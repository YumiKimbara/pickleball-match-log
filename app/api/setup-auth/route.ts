import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Read migration file
    const migrationPath = path.join(
      process.cwd(),
      "lib/db/migrations/001-nextauth-tables.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Run migration
    await pool.query(migrationSQL);
    await pool.end();

    return NextResponse.json({
      success: true,
      message: "NextAuth tables created successfully. You can now use magic link authentication.",
      nextSteps: [
        "1. Sign up at https://resend.com and get an API key",
        "2. Add RESEND_API_KEY to your environment variables",
        "3. Restart the dev server",
        "4. Test magic link sign-in"
      ]
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}

