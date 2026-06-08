import { Router } from "express";
import {
  getMediaByAlbum, uploadMedia, deleteMedia,
  toggleLike, toggleFavourite, getComments, addComment,
  downloadWithWatermark, scanFace
} from "../controllers/mediaController";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { UserRole } from "../types";

const router = Router();

router.get("/albums/:albumId/media", getMediaByAlbum);
router.post("/media", requireRole([UserRole.ADMIN, UserRole.PHOTOGRAPHER]), validateBody(["eventId", "albumId", "fileBase64"]), uploadMedia);
router.delete("/media/:id", requireRole([UserRole.ADMIN, UserRole.PHOTOGRAPHER]), deleteMedia);

router.post("/media/:id/like", requireAuth, toggleLike);
router.post("/media/:id/favourite", requireAuth, toggleFavourite);
router.get("/media/:id/comments", getComments);
router.post("/media/:id/comments", requireAuth, validateBody(["text"]), addComment);

router.get("/media/download/:id", downloadWithWatermark);
router.post("/face-recognition/scan", requireAuth, scanFace);

export default router;
