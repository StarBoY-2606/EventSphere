import { Response } from "express";
import { db } from "../services/dbService";
import { AuthRequest } from "../middleware/auth";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  res.json(await db.getNotificationsByUser(req.user!.id));
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  await db.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
};

export const markOneRead = async (req: AuthRequest, res: Response) => {
  await db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
};
