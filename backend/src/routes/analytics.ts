import { Router } from "express";
import { getDashboard, getActivities } from "../controllers/analyticsController";
import { requireRole, requireAuth } from "../middleware/auth";
import { UserRole } from "../types";

const router = Router();

router.get("/dashboard", requireRole([UserRole.ADMIN]), getDashboard);
router.get("/activities", requireRole([UserRole.ADMIN]), getActivities);

export default router;
