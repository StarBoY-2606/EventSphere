import { Router } from "express";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../controllers/eventController";
import { requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { UserRole } from "../types";

const router = Router();

router.get("/", getEvents);
router.post("/", requireRole([UserRole.ADMIN]), validateBody(["name", "category", "date"]), createEvent);
router.put("/:id", requireRole([UserRole.ADMIN]), updateEvent);
router.delete("/:id", requireRole([UserRole.ADMIN]), deleteEvent);

export default router;
