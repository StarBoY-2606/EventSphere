import { Router } from "express";
import { getNotifications, markAllRead, markOneRead } from "../controllers/notificationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.post("/read-all", requireAuth, markAllRead);
router.post("/:id/read", requireAuth, markOneRead);

export default router;
