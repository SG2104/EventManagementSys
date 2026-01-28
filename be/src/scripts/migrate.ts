import fs from "fs";
import path from "path";
import { pool } from "../config/db";

async function migrate() {
    try {
        console.log("Starting migration...");

        const schemaPath = path.resolve(process.cwd(), "schema.sql");

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`schema.sql not found at: ${schemaPath}`);
        }

        const sql = fs.readFileSync(schemaPath, "utf8").trim();
        if (!sql) {
            throw new Error("schema.sql is empty.");
        }

        await pool.query(sql);

        console.log("Migration completed: Database executed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
