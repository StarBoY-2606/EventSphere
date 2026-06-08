import { Router } from "express";
import { getAlbumsByEvent, createAlbum, deleteAlbum } from "../controllers/albumController";
import { requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { UserRole } from "../types";

const router = Router();

router.get("/events/:eventId/albums", getAlbumsByEvent);
router.post("/albums", requireRole([UserRole.ADMIN, UserRole.PHOTOGRAPHER]), validateBody(["eventId", "name"]), createAlbum);
router.delete("/albums/:id", requireRole([UserRole.ADMIN, UserRole.PHOTOGRAPHER]), deleteAlbum);

export default router;
