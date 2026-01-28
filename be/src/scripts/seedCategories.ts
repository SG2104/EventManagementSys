import { pool } from "../config/db";

const categories = [
    "Music",
    "Sports",
    "Tech",
    "Workshop",
    "Conference"
];

async function seedCategories() {
    try {
        console.log("Seeding categories.");

        for (const name of categories) {
            await pool.query(
                `INSERT INTO categories (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
                [name]
            );
        }

        console.log("Categories seeded successfully.");
    } catch (error) {
        console.error("Error seeding categories:", error);
    } finally {
        await pool.end();
    }
}

seedCategories();
