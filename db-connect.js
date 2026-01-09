// File: db-connect.js
import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function connectAndQuery() {
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon
    }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✓ Connected successfully!\n');

    // Get all table names
    console.log('=== DATABASE TABLES ===');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Get columns for users table
    console.log('\n=== USERS TABLE COLUMNS ===');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });

    // Check for gender column specifically
    console.log('\n=== GENDER COLUMN CHECK ===');
    const genderCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'gender'
    `);
    
    if (genderCheck.rows.length > 0) {
      console.log('✓ Gender column exists in users table');
    } else {
      console.log('✗ Gender column does NOT exist in users table');
      
      // Option to add the column
      console.log('\nWould you like to add the gender column? (This is safe)');
      // You can uncomment the next lines to automatically add it
      // await client.query(`ALTER TABLE users ADD COLUMN gender TEXT`);
      // console.log('✓ Gender column added successfully');
    }

    // Get sample user data
    console.log('\n=== SAMPLE USER DATA ===');
    const sampleUsers = await client.query(`
      SELECT id, username, full_name, email
      FROM users
      LIMIT 5
    `);
    
    sampleUsers.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Name: ${user.full_name}, Email: ${user.email}`);
    });

    console.log('\n=== DATABASE CONNECTION TEST COMPLETE ===');

  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    // Close the connection
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the function
connectAndQuery();