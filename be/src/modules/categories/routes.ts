import { Router } from "express";
import { pool } from "../../config/db";
import { Request, Response } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, name FROM categories ORDER BY name");
    res.json({
      status: "success",
      message: "Categories fetched successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ status: "error", message: "Internal Server Error", data: null });
  }
});

export default router;
