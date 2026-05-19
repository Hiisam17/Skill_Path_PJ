/**
 * Seed script: Populates nodeId for all existing skills.
 * Generates a URL-safe slug from skill name with special-case mappings.
 * Run with: node prisma/seed-node-ids.js
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
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const directUrl = DATABASE_URL.replace(':6543/', ':5432/').replace('?pgbouncer=true', '');

/**
 * Special-case mappings for skill names that don't slug cleanly.
 * Key: lowercase skill name, Value: desired nodeId
 */
const SPECIAL_MAPPINGS = {
  'c#': 'csharp',
  'c++': 'cpp',
  'c': 'c-lang',
  'f#': 'fsharp',
  'asp.net': 'aspnet',
  '.net': 'dotnet',
  'node.js': 'nodejs',
  'vue.js': 'vuejs',
  'react.js': 'reactjs',
  'next.js': 'nextjs',
  'nuxt.js': 'nuxtjs',
  'express.js': 'expressjs',
  'nest.js': 'nestjs',
  'ruby on rails': 'ruby-on-rails',
  'sql server': 'mssql',
  'ms sql': 'mssql',
  'json apis': 'json-apis',
  'rest apis': 'rest-apis',
  'client side': 'client-side',
  'server side': 'server-side',
};

/**
 * Generates a nodeId slug from a skill name.
 * @param {string} name - Skill name
 * @returns {string} URL-safe slug
 */
function generateNodeId(name) {
  const lower = name.toLowerCase().trim();

  // Check special mappings first
  if (SPECIAL_MAPPINGS[lower]) {
    return SPECIAL_MAPPINGS[lower];
  }

  // General slug generation
  return lower
    .replace(/\./g, '')        // Remove dots (e.g., "Node.js" -> "Nodejs")
    .replace(/\+/g, 'plus')   // Replace + (e.g., "C++" -> "Cplusplus")
    .replace(/#/g, 'sharp')   // Replace # (e.g., "C#" -> "Csharp")
    .replace(/\s+/g, '-')     // Spaces to hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Trim leading/trailing hyphens
}

async function main() {
  const pool = new Pool({ connectionString: directUrl });
  const client = await pool.connect();

  try {
    console.log('🔄 Populating nodeId for all skills...\n');

    const { rows: skills } = await client.query(
      'SELECT id, name, node_id FROM skills ORDER BY id'
    );

    console.log(`Found ${skills.length} skills in database.\n`);

    let updated = 0;
    let skipped = 0;
    const usedNodeIds = new Set();

    for (const skill of skills) {
      if (skill.node_id) {
        usedNodeIds.add(skill.node_id);
        skipped++;
        continue;
      }

      let nodeId = generateNodeId(skill.name);

      // Handle duplicates by appending skill id
      if (usedNodeIds.has(nodeId)) {
        nodeId = `${nodeId}-${skill.id}`;
      }

      usedNodeIds.add(nodeId);

      await client.query(
        'UPDATE skills SET node_id = $1 WHERE id = $2',
        [nodeId, skill.id]
      );

      console.log(`  ✅ [${skill.id}] "${skill.name}" → "${nodeId}"`);
      updated++;
    }

    console.log(`\n🎉 Done! Updated: ${updated}, Skipped (already set): ${skipped}`);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => process.exit(1));
