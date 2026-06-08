import { Request, Response } from "express";
import { db } from "../services/dbService";
import { matchFace } from "../services/aiService";
import { applyWatermark } from "../utils/watermark";
import { AuthRequest } from "../middleware/auth";

export const getMediaByAlbum = async (req: Request, res: Response) => {
  res.json(await db.getMediaByAlbum(req.params.albumId));
};

export const uploadMedia = async (req: AuthRequest, res: Response) => {
  const { eventId, albumId, title, fileBase64 } = req.body;
  try {
    const uploader = await db.getUserById(req.user!.id);
    const media = await db.addMedia({ eventId, albumId, title: title || "Media Asset", url: fileBase64, thumbnailUrl: fileBase64, uploadedBy: req.user!.id, uploaderName: uploader?.name || "Unknown", uploadDate: new Date().toISOString() }, fileBase64);
    if (uploader) await db.logActivity(uploader.id, uploader.name, uploader.email, uploader.role, "UPLOAD", `Uploaded '${title || "photo"}'`);
    res.status(201).json(media);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  await db.deleteMedia(req.params.id);
  res.json({ success: true });
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  const result = await db.toggleLike(req.params.id, req.user!.id);
  res.json(result);
};

export const toggleFavourite = async (req: AuthRequest, res: Response) => {
  const favourited = await db.toggleFavourite(req.params.id, req.user!.id);
  res.json({ favourited });
};

export const getComments = async (req: Request, res: Response) => {
  res.json(await db.getCommentsByMedia(req.params.id));
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  const comment = await db.addComment(req.params.id, req.user!.id, text);
  res.status(201).json(comment);
};

export const downloadWithWatermark = async (req: Request, res: Response) => {
  const media = await db.getMediaById(req.params.id);
  if (!media) return res.status(404).json({ error: "Media not found" });
  const event = await db.getEventById(media.eventId);
  const result = applyWatermark(media.url, event?.name || "EventSphere");
  if (result.type === "svg") {
    res.setHeader("Content-Disposition", `attachment; filename="Watermarked-${media.id}.svg"`);
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(result.data);
  }
  res.json({ mediaId: media.id, watermarkedUrl: media.url, eventName: result.eventName });
};

export const scanFace = async (req: AuthRequest, res: Response) => {
  const user = await db.getUserById(req.user!.id);
  if (!user?.referenceSelfieUrl) return res.status(400).json({ error: "Please upload a reference selfie first." });
  const allMedia = await db.getMedia();
  const matches = [];
  for (const m of allMedia) {
    try { if (await matchFace(user.referenceSelfieUrl, m.url)) matches.push(m); } catch {}
  }
  res.json({ matches });
};
