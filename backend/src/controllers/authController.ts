import { Request, Response } from "express";
import { db } from "../services/dbService";
import { signToken } from "../utils/jwt";
import { UserRole } from "../types";
import { AuthRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const user = await db.createUser(name, email, password, UserRole.VIEWER); // always default to VIEWER
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await db.getUserByEmail(email);
  if (!user || !(await db.verifyUserPassword(user.id, password))) {
    return res.status(401).json({ error: "Invalid email or credentials" });
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ user, token });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await db.getUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

export const uploadSelfie = async (req: AuthRequest, res: Response) => {
  const { referenceSelfieUrl } = req.body;
  await db.updateUserProfile(req.user!.id, { referenceSelfieUrl });
  const user = await db.getUserById(req.user!.id);
  if (user) await db.logActivity(user.id, user.name, user.email, user.role, "SELFIE_UPLOAD", "Registered new facial identification selfie");
  res.json({ success: true });
};

export const deleteSelfie = async (req: AuthRequest, res: Response) => {
  await db.updateUserProfile(req.user!.id, { referenceSelfieUrl: "" });
  const user = await db.getUserById(req.user!.id);
  if (user) await db.logActivity(user.id, user.name, user.email, user.role, "SELFIE_DELETE", "Deleted facial identification selfie");
  res.json({ success: true });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const user = await db.getUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const updated = await db.updateUserProfile(req.user!.id, { name });
  await db.logActivity(user.id, name, user.email, user.role, "PROFILE_UPDATE", `Updated name from '${user.name}' to '${name}'`);
  res.json({ success: true, user: updated });
};
