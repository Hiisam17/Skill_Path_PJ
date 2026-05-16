// Prisma 7 CLI configuration
// Provides DATABASE_URL for migrate/push commands
import * as dotenv from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { defineConfig } from "prisma/config";

// Load env file (try .env.development first, fallback to .env)
const envDevPath = resolve(process.cwd(), ".env.development");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envDevPath)) {
  dotenv.config({ path: envDevPath });
} else {
  dotenv.config({ path: envPath });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
