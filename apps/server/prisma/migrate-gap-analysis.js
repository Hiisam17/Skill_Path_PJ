/**
 * Migration script to add Job table and nodeId column to skills table.
 * Run with: node prisma/migrate-gap-analysis.js
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envDevPath = path.join(__dirname, '..', '.env.development');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envDevPath)) {
  dotenv.config({ path: envDevPath });
} else {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.development');
  process.exit(1);
}

// Use direct connection (port 5432) for DDL operations
const directUrl = DATABASE_URL.replace(':6543/', ':5432/').replace('?pgbouncer=true', '');

async function main() {
  const pool = new Pool({ connectionString: directUrl });
  const client = await pool.connect();

  try {
    console.log('🔄 Running Smart Gap Analysis migration...');

    // 1. Add nodeId column to skills table
    await client.query(`
      ALTER TABLE skills
      ADD COLUMN IF NOT EXISTS node_id TEXT UNIQUE;
    `);
    console.log('✅ Added node_id column to skills table');

    // 2. Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        description TEXT NOT NULL,
        requirements TEXT,
        skills TEXT[] DEFAULT '{}',
        job_type TEXT,
        source TEXT,
        source_url TEXT,
        roadmap_path TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created jobs table');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => process.exit(1));
