import { Request, Response } from "express";
import { db } from "../services/dbService";
import { generateMockImageBase64 } from "../utils/watermark";
import { AuthRequest } from "../middleware/auth";

export const getAlbumsByEvent = async (req: Request, res: Response) => {
  res.json(await db.getAlbumsByEvent(req.params.eventId));
};

export const createAlbum = async (req: AuthRequest, res: Response) => {
  const { eventId, name, coverImage } = req.body;
  const cover = coverImage || generateMockImageBase64(name, "3A4A5F");
  const album = await db.createAlbum({ eventId, name, coverImage: cover });
  const user = await db.getUserById(req.user!.id);
  if (user) await db.logActivity(user.id, user.name, user.email, user.role, "ALBUM_CREATE", `Created album '${name}'`);
  res.status(201).json(album);
};

export const deleteAlbum = async (req: Request, res: Response) => {
  await db.deleteAlbum(req.params.id);
  res.json({ success: true });
};
