import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket with error handling
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false; // Disable pipeline connect which can cause issues
neonConfig.useSecureWebSocket = true; // Ensure secure connection

// Remove webSocketProxy as it doesn't exist in NeonConfig type

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Conservative connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Reduced from 20000
  min: 2,  // Reduced from 50
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout
  query_timeout: 10000,
  maxUses: 7500,
  allowExitOnIdle: true,
});

// Enhanced error handling with proper typing
pool.on('error', (err: Error & { client?: any }) => {
  try {
    console.error('[DB] Unexpected error on idle client:', err);
    
    // Safely release client if it exists
    if (err.client) {
      try {
        err.client.release(true); // Force release the client
      } catch (releaseError) {
        console.error('[DB] Failed to release client:', releaseError);
      }
    }
  } catch (loggingError) {
    // Fallback if error object can't be accessed
    console.error('[DB] Critical error occurred while logging previous error');
  }
});

pool.on('connect', () => {
  console.log('[DB] New database connection established');
});

pool.on('remove', () => {
  console.log('[DB] Database connection closed');
});

// Graceful shutdown handling with error suppression
const shutdownHandler = async (signal: string) => {
  try {
    console.log(`[DB] Received ${signal}, closing connection pool...`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error(`[DB] Error during shutdown:`, err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdownHandler('SIGINT'));
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

// Create drizzle instance with error handling
export const db = drizzle({ 
  client: pool, 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export pool for direct access
export { pool };

// Health check function with retry logic
export async function checkDatabaseConnection(maxRetries = 3): Promise<boolean> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('[DB] Database connection healthy');
      return true;
    } catch (error) {
      lastError = error;
      console.error(`[DB] Connection attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`[DB] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[DB] Database connection failed after retries:', lastError);
  return false;
}

// Query execution with retry logic
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      console.error(`[DB] Query attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500; // Shorter delay for queries
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}