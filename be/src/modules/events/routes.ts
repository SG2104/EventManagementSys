import { Router } from "express";
import { createEvent, updateEvent, getEvents, getEventById, deleteEvent, checkOverlap } from "./controller";

const router = Router();

router.get("/check-overlap", checkOverlap);
router.get("/get-all", getEvents);
router.get("/get/:id", getEventById);
router.post("/create", createEvent);
router.patch("/update/:id", updateEvent);
router.delete("/delete/:id", deleteEvent);

export default router;
