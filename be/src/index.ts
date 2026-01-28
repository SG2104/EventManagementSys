import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

import eventRoutes from "./modules/events/routes";
import categoryRoutes from "./modules/categories/routes";

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/categories", categoryRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("Backend is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

pool.query("SELECT NOW() AS now")
    .then((res) => console.log("DB connected:", res.rows[0]))
    .catch((err) => console.error("DB connection error:", err));