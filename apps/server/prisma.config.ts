// Prisma 7 CLI configuration
// Provides DATABASE_URL for migrate/push commands.
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'prisma/config';

// Load local env for development, but let deployment/CI env vars win in production.
if (process.env.NODE_ENV !== 'production') {
  const envDevPath = resolve(process.cwd(), '.env.development');
  const envPath = resolve(process.cwd(), '.env');

  if (existsSync(envDevPath)) {
    dotenv.config({ path: envDevPath });
  } else if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
