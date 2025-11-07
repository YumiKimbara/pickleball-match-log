const { Pool } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.log("Please set DATABASE_URL in your environment or .env.local file");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const migrationPath = path.join(__dirname, "../lib/db/migrations/001-nextauth-tables.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    console.log("Running migration: 001-nextauth-tables.sql");
    await pool.query(migrationSQL);
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();

