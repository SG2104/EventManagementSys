import { Router } from "express";
import { createEvent, updateEvent, getEvents, getEventById, deleteEvent, checkOverlap } from "./controller";

const router = Router();

router.get("/check-overlap", checkOverlap);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
