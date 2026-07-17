// This file is a migration runner for the database. It will run all the migration files in the migrations folder in order to set up the database schema.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "migrations");

await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
`);

// Read and sort files by name to ensure they run in order
const files = (await fs.readdir(migrationsDir))
    .filter(file => file.endsWith(".sql"))
    .sort();

// Check which migrations already ran
const result = await pool.query("SELECT filename FROM migrations");
const applied = new Set(
    result.rows.map(row => row.filename)
);

for (const file of files) {

    // Skip migrations that have already been applied
    if (applied.has(file)) {
        continue;
    }

    console.log(`Running ${file}...`);

    // Read the SQL file and execute it against the database
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf-8");
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // run the migration script and record it in the migrations table
        await client.query(sql);
        await client.query(
            "INSERT INTO migrations (filename) VALUES ($1)",
            [file]
        );

        await client.query("COMMIT");
        console.log(`Migration ${file} applied successfully.`);
    } catch (error) {
        console.error(`Error running migration for file ${file}:`, error);
        await client.query("ROLLBACK");
        client.release();
        process.exit(1);
    } finally {
        client.release();
    }
}

console.log("Database up to date.");