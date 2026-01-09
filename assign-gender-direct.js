// File: assign-gender-direct.js
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });
    
    return envVars;
  }
  return {};
}

const env = loadEnv();

// Common male suffixes/prefixes in Bengali names (English spelling)
const maleKeywords = [
  'alam', 'ullah', 'islam', 'ahmed', 'rahman', 'mia', 'miah', 'khan', 
  'hossain', 'hossein', 'hussain', 'chowdhury', 'chaudhury', 'uddin',
  'uddin', 'haque', 'hak', 'howlader', 'hoque', 'islam', 'mohammad',
  'muhammad', 'md.', 'mr.', 'shah', 'sheikh', 'siddique', 'sarker', 'Abdul', 'Abdur', 'Md', 'Muhammed', 'Mohammed',
  'Md.', 'Hossain','Hoque','Salim','Mostafa','Abdul'
];

// Common female suffixes/prefixes in Bengali names (English spelling)
const femaleKeywords = [
  'begum', 'khatun', 'banu', 'jahan', 'ara', 'sultana', 'akter', 'akhter',
  'khatun', 'nesa', 'bibi', 'parvin', 'parveen', 'fatema', 'fatima',
  'khaleda', 'hasina', 'sheikh', 'begom', 'begam', 'aktar', 'akhtar','Nesa','Bibi','Parvin','Fatema','Fatima','Khaleda','Hasina','Khatun',
  'Akther','Begom','Begam'
];

function determineGender(fullName) {
  if (!fullName) return null;
  
  const nameLower = fullName.toLowerCase();
  
  // Check for female keywords first (some might be substrings of male keywords)
  for (const keyword of femaleKeywords) {
    if (nameLower.includes(keyword)) {
      return 'female';
    }
  }
  
  // Then check for male keywords
  for (const keyword of maleKeywords) {
    if (nameLower.includes(keyword)) {
      return 'male';
    }
  }
  
  return null; // Unknown
}

async function assignGenderToUsers() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon
    }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✓ Connected successfully!\n');

    console.log('Starting gender assignment based on names...');
    
    // Get all users
    const result = await client.query('SELECT id, full_name, gender FROM users');
    const allUsers = result.rows;
    console.log(`Found ${allUsers.length} users to process\n`);
    
    let maleCount = 0;
    let femaleCount = 0;
    let unknownCount = 0;
    let updatedCount = 0;
    let alreadyHasGender = 0;
    
    for (const user of allUsers) {
      // Skip users who already have gender assigned
      if (user.gender) {
        alreadyHasGender++;
        continue;
      }
      
      const gender = determineGender(user.full_name);
      
      if (gender) {
        // Update the user's gender
        await client.query('UPDATE users SET gender = $1 WHERE id = $2', [gender, user.id]);
        
        if (gender === 'male') {
          maleCount++;
        } else {
          femaleCount++;
        }
        updatedCount++;
        
        console.log(`Updated user ${user.id}: ${user.full_name} -> ${gender}`);
      } else {
        unknownCount++;
        console.log(`Could not determine gender for: ${user.full_name}`);
      }
    }
    
    console.log('\n=== GENDER ASSIGNMENT SUMMARY ===');
    console.log(`Total users processed: ${allUsers.length}`);
    console.log(`Users with existing gender: ${alreadyHasGender}`);
    console.log(`Users updated: ${updatedCount}`);
    console.log(`  - Male: ${maleCount}`);
    console.log(`  - Female: ${femaleCount}`);
    console.log(`Unknown gender: ${unknownCount}`);
    
    client.release();
    
  } catch (error) {
    console.error('Error assigning gender:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the assignment
assignGenderToUsers();