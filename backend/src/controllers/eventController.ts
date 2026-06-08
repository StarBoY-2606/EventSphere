import { Request, Response } from "express";
import { db } from "../services/dbService";
import { generateMockImageBase64 } from "../utils/watermark";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "../types";

export const getEvents = async (req: AuthRequest, res: Response) => {
  const list = await db.getEvents();
  // Only admins/photographers see private events
  if (!req.user || req.user.role === UserRole.VIEWER) {
    return res.json(list.filter((e: any) => e.visibility === "PUBLIC"));
  }
  res.json(list);
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  const { name, description, category, date, coverImage, visibility } = req.body;
  const cover = coverImage || generateMockImageBase64(name, "ADC6FF");
  const event = await db.createEvent({ name, description: description || "", category, date, coverImage: cover, visibility: visibility || "PUBLIC" });
  const user = await db.getUserById(req.user!.id);
  if (user) await db.logActivity(user.id, user.name, user.email, user.role, "EVENT_CREATE", `Created event: '${name}'`);
  res.status(201).json(event);
};

export const updateEvent = async (req: Request, res: Response) => {
  const updated = await db.updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Event not found" });
  res.json(updated);
};

export const deleteEvent = async (req: Request, res: Response) => {
  await db.deleteEvent(req.params.id);
  res.json({ success: true });
};
