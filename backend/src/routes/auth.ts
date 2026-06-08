import { Router } from "express";
import { register, login, getMe, uploadSelfie, deleteSelfie, updateProfile } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

router.post("/register", validateBody(["name", "email", "password"]), register);
router.post("/login", validateBody(["email", "password"]), login);
router.get("/me", requireAuth, getMe);
router.post("/selfie", requireAuth, validateBody(["referenceSelfieUrl"]), uploadSelfie);
router.delete("/selfie", requireAuth, deleteSelfie);
router.post("/profile", requireAuth, validateBody(["name"]), updateProfile);

export default router;
