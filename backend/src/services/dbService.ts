import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getPrisma, usePrisma } from "../config";
import { uploadMedia } from "./s3Service";
import { generateAITags } from "./aiService";
import { User, UserRole, Event, Album, Media, Comment, Like, Favourite, Notification, Activity } from "../types";
import { generateMockImageBase64 } from "../utils/watermark";

const DATA_FILE = path.join(process.cwd(), "data.json");

// ── JSON seed data ────────────────────────────────────────────────────────
const initialDatabase = () => ({
  users: [
    { id: "u1", email: "admin@eventsphere.com", name: "Admin User", role: UserRole.ADMIN, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminUser", createdAt: new Date().toISOString() },
    { id: "u2", email: "photographer@eventsphere.com", name: "Sarah Connor", role: UserRole.PHOTOGRAPHER, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=SarahConnor", createdAt: new Date().toISOString() },
    { id: "u3", email: "member@eventsphere.com", name: "Alex Johnson", role: UserRole.CLUB_MEMBER, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexJohnson", createdAt: new Date().toISOString() },
    { id: "u4", email: "viewer@eventsphere.com", name: "Guest Viewer", role: UserRole.VIEWER, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=GuestViewer", createdAt: new Date().toISOString() }
  ] as User[],
  passwordHashes: {
    "u1": crypto.createHash("sha256").update("admin123").digest("hex"),
    "u2": crypto.createHash("sha256").update("photo123").digest("hex"),
    "u3": crypto.createHash("sha256").update("member123").digest("hex"),
    "u4": crypto.createHash("sha256").update("viewer123").digest("hex")
  } as Record<string, string>,
  events: [
    { id: "e1", name: "Global AI Summit 2024", description: "A grand summit with industry leaders.", category: "Conference", date: "2024-10-12", coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000", visibility: "PUBLIC", createdAt: new Date().toISOString() },
    { id: "e2", name: "Annual Executive Gala", description: "Elegant networking dinner.", category: "Gala", date: "2024-11-05", coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000", visibility: "PRIVATE", createdAt: new Date().toISOString() },
    { id: "e3", name: "The Sterling Wedding", description: "Beautiful vows and reception.", category: "Wedding", date: "2024-12-20", coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000", visibility: "PUBLIC", createdAt: new Date().toISOString() },
    { id: "e4", name: "AI Creative Workshop", description: "Hands-on AI sandbox.", category: "Workshop", date: "2025-01-15", coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000", visibility: "PRIVATE", createdAt: new Date().toISOString() }
  ] as Event[],
  albums: [
    { id: "a1", eventId: "e1", name: "Keynote Speeches", coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800", createdAt: new Date().toISOString() },
    { id: "a2", eventId: "e1", name: "Panel Discussions", coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800", createdAt: new Date().toISOString() },
    { id: "a3", eventId: "e2", name: "Awards Ceremony", coverImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800", createdAt: new Date().toISOString() },
    { id: "a4", eventId: "e3", name: "Ceremony & Rings", coverImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800", createdAt: new Date().toISOString() }
  ] as Album[],
  media: [
    { id: "m1", eventId: "e1", albumId: "a1", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600", uploadedBy: "u2", uploaderName: "Sarah Connor", uploadDate: new Date().toISOString(), tags: ["Stage", "Crowd", "Indoor"], likesCount: 5 },
    { id: "m2", eventId: "e1", albumId: "a1", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600", uploadedBy: "u2", uploaderName: "Sarah Connor", uploadDate: new Date().toISOString(), tags: ["Stage", "Indoor", "Workshop"], likesCount: 2 },
    { id: "m3", eventId: "e2", albumId: "a3", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600", uploadedBy: "u1", uploaderName: "Admin User", uploadDate: new Date().toISOString(), tags: ["Stage", "Indoor", "Party"], likesCount: 8 }
  ] as Media[],
  comments: [
    { id: "c1", mediaId: "m1", userId: "u3", userName: "Alex Johnson", text: "Outstanding keynote!", createdAt: new Date().toISOString() }
  ] as Comment[],
  likes: [] as Like[],
  favourites: [] as Favourite[],
  notifications: [] as Notification[]
});

export class DbService {
  private cache: ReturnType<typeof initialDatabase>;

  constructor() {
    if (fs.existsSync(DATA_FILE)) {
      try { this.cache = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
      catch { this.cache = initialDatabase(); this.save(); }
    } else {
      this.cache = initialDatabase();
      this.save();
    }
  }

  private save() { fs.writeFileSync(DATA_FILE, JSON.stringify(this.cache, null, 2), "utf-8"); }

  // ── Users ──────────────────────────────────────────────────────────────
  async getUsers() {
    const prisma = getPrisma();
    if (prisma) return (await prisma.user.findMany()) as unknown as User[];
    return this.cache.users;
  }

  async getUserById(id: string) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.user.findUnique({ where: { id } })) as unknown as User | null;
    return this.cache.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.user.findUnique({ where: { email } })) as unknown as User | null;
    return this.cache.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async createUser(name: string, email: string, psw: string, role: UserRole) {
    if (await this.getUserByEmail(email)) throw new Error("Email already registered");
    const id = "u_" + crypto.randomBytes(4).toString("hex");
    const hash = crypto.createHash("sha256").update(psw).digest("hex");
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    const prisma = getPrisma();
    if (prisma) return (await prisma.user.create({ data: { id, name, email, passwordHash: hash, role: role as any, avatarUrl } })) as unknown as User;
    const user: User = { id, name, email, role, avatarUrl, createdAt: new Date().toISOString() };
    this.cache.users.push(user);
    this.cache.passwordHashes[id] = hash;
    this.save();
    return user;
  }

  async verifyUserPassword(userId: string, psw: string) {
    const hash = crypto.createHash("sha256").update(psw).digest("hex");
    const prisma = getPrisma();
    if (prisma) { const u = await prisma.user.findUnique({ where: { id: userId } }); return u ? u.passwordHash === hash : false; }
    return this.cache.passwordHashes[userId] === hash;
  }

  async updateUserProfile(userId: string, updates: { name?: string; referenceSelfieUrl?: string }) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.user.update({ where: { id: userId }, data: updates })) as unknown as User;
    const i = this.cache.users.findIndex(u => u.id === userId);
    if (i !== -1) { this.cache.users[i] = { ...this.cache.users[i], ...updates }; this.save(); return this.cache.users[i]; }
    return null;
  }

  // ── Events ─────────────────────────────────────────────────────────────
  async getEvents() {
    const prisma = getPrisma();
    if (prisma) return (await prisma.event.findMany({ orderBy: { date: "desc" } })).map(e => ({ ...e, date: e.date.toISOString().split("T")[0], createdAt: e.createdAt.toISOString() })) as unknown as Event[];
    return this.cache.events;
  }

  async getEventById(id: string) {
    const prisma = getPrisma();
    if (prisma) { const e = await prisma.event.findUnique({ where: { id } }); return e ? { ...e, date: e.date.toISOString().split("T")[0], createdAt: e.createdAt.toISOString() } as unknown as Event : null; }
    return this.cache.events.find(e => e.id === id) || null;
  }

  async createEvent(event: Omit<Event, "id" | "createdAt">) {
    const id = "e_" + crypto.randomBytes(4).toString("hex");
    const prisma = getPrisma();
    if (prisma) { const e = await prisma.event.create({ data: { id, ...event, date: new Date(event.date), visibility: event.visibility as any } }); return { ...e, date: e.date.toISOString().split("T")[0], createdAt: e.createdAt.toISOString() } as unknown as Event; }
    const e: Event = { id, ...event, createdAt: new Date().toISOString() };
    this.cache.events.push(e); this.save(); return e;
  }

  async updateEvent(id: string, updates: Partial<Event>) {
    const prisma = getPrisma();
    if (prisma) { const data: any = { ...updates }; if (updates.date) data.date = new Date(updates.date); const e = await prisma.event.update({ where: { id }, data }); return { ...e, date: e.date.toISOString().split("T")[0] } as unknown as Event; }
    const i = this.cache.events.findIndex(e => e.id === id);
    if (i !== -1) { this.cache.events[i] = { ...this.cache.events[i], ...updates }; this.save(); return this.cache.events[i]; }
    return null;
  }

  async deleteEvent(id: string) {
    const prisma = getPrisma();
    if (prisma) { await prisma.event.delete({ where: { id } }); return; }
    this.cache.events = this.cache.events.filter(e => e.id !== id);
    this.cache.albums = this.cache.albums.filter(a => a.eventId !== id);
    this.cache.media = this.cache.media.filter(m => m.eventId !== id);
    this.save();
  }

  // ── Albums ─────────────────────────────────────────────────────────────
  async getAlbumsByEvent(eventId: string) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.album.findMany({ where: { eventId } })).map(a => ({ ...a, createdAt: a.createdAt.toISOString() })) as unknown as Album[];
    return this.cache.albums.filter(a => a.eventId === eventId);
  }

  async createAlbum(album: Omit<Album, "id" | "createdAt">) {
    const id = "a_" + crypto.randomBytes(4).toString("hex");
    const prisma = getPrisma();
    if (prisma) { const a = await prisma.album.create({ data: { id, ...album } }); return { ...a, createdAt: a.createdAt.toISOString() } as unknown as Album; }
    const a: Album = { id, ...album, createdAt: new Date().toISOString() };
    this.cache.albums.push(a); this.save(); return a;
  }

  async deleteAlbum(id: string) {
    const prisma = getPrisma();
    if (prisma) { await prisma.album.delete({ where: { id } }); return; }
    this.cache.albums = this.cache.albums.filter(a => a.id !== id);
    this.cache.media = this.cache.media.filter(m => m.albumId !== id);
    this.save();
  }

  // ── Media ──────────────────────────────────────────────────────────────
  async getMedia() {
    const prisma = getPrisma();
    if (prisma) return (await prisma.media.findMany({ include: { uploader: true, likes: true } })).map(m => ({ id: m.id, eventId: m.eventId, albumId: m.albumId, url: m.url, thumbnailUrl: m.thumbnailUrl, uploadedBy: m.uploadedBy, uploaderName: m.uploader.name, uploadDate: m.uploadDate.toISOString(), tags: m.tags, likesCount: m.likes.length })) as unknown as Media[];
    return this.cache.media;
  }

  async getMediaByAlbum(albumId: string) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.media.findMany({ where: { albumId }, include: { uploader: true, likes: true } })).map(m => ({ id: m.id, eventId: m.eventId, albumId: m.albumId, url: m.url, thumbnailUrl: m.thumbnailUrl, uploadedBy: m.uploadedBy, uploaderName: m.uploader.name, uploadDate: m.uploadDate.toISOString(), tags: m.tags, likesCount: m.likes.length })) as unknown as Media[];
    return this.cache.media.filter(m => m.albumId === albumId);
  }

  async getMediaById(id: string) {
    const prisma = getPrisma();
    if (prisma) { const m = await prisma.media.findUnique({ where: { id }, include: { uploader: true, likes: true } }); return m ? { id: m.id, eventId: m.eventId, albumId: m.albumId, url: m.url, thumbnailUrl: m.thumbnailUrl, uploadedBy: m.uploadedBy, uploaderName: m.uploader.name, uploadDate: m.uploadDate.toISOString(), tags: m.tags, likesCount: m.likes.length } as unknown as Media : null; }
    return this.cache.media.find(m => m.id === id) || null;
  }

  async addMedia(mediaItem: Omit<Media, "id" | "likesCount" | "tags">, fileBase64: string) {
    const id = "m_" + crypto.randomBytes(4).toString("hex");
    const { url } = await uploadMedia(fileBase64, `${id}.png`);
    const tags = await generateAITags(fileBase64, mediaItem.title || "Photo").catch(() => ["Indoor", "Event"]);
    const prisma = getPrisma();
    if (prisma) { const m = await prisma.media.create({ data: { id, eventId: mediaItem.eventId, albumId: mediaItem.albumId, url, thumbnailUrl: url, uploadedBy: mediaItem.uploadedBy, tags }, include: { uploader: true } }); return { id: m.id, eventId: m.eventId, albumId: m.albumId, url: m.url, thumbnailUrl: m.thumbnailUrl, uploadedBy: m.uploadedBy, uploaderName: m.uploader.name, uploadDate: m.uploadDate.toISOString(), tags: m.tags, likesCount: 0 } as unknown as Media; }
    const media: Media = { id, ...mediaItem, url, thumbnailUrl: url, tags, likesCount: 0 };
    this.cache.media.push(media); this.save(); return media;
  }

  async deleteMedia(id: string) {
    const prisma = getPrisma();
    if (prisma) { await prisma.media.delete({ where: { id } }); return; }
    this.cache.media = this.cache.media.filter(m => m.id !== id);
    this.cache.likes = this.cache.likes.filter(l => l.mediaId !== id);
    this.cache.comments = this.cache.comments.filter(c => c.mediaId !== id);
    this.save();
  }

  // ── Comments ───────────────────────────────────────────────────────────
  async getCommentsByMedia(mediaId: string) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.comment.findMany({ where: { mediaId }, include: { user: true } })).map(c => ({ id: c.id, mediaId: c.mediaId, userId: c.userId, userName: c.user.name, text: c.text, createdAt: c.createdAt.toISOString() })) as unknown as Comment[];
    return this.cache.comments.filter(c => c.mediaId === mediaId);
  }

  async addComment(mediaId: string, userId: string, text: string) {
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");
    const id = "c_" + crypto.randomBytes(4).toString("hex");
    const prisma = getPrisma();
    if (prisma) { const c = await prisma.comment.create({ data: { id, mediaId, userId, text } }); return { id: c.id, mediaId: c.mediaId, userId: c.userId, userName: user.name, text: c.text, createdAt: c.createdAt.toISOString() } as unknown as Comment; }
    const comment: Comment = { id, mediaId, userId, userName: user.name, text, createdAt: new Date().toISOString() };
    this.cache.comments.push(comment); this.save(); return comment;
  }

  // ── Likes & Favourites ─────────────────────────────────────────────────
  async toggleLike(mediaId: string, userId: string) {
    const prisma = getPrisma();
    if (prisma) {
      const existing = await prisma.like.findUnique({ where: { mediaId_userId: { mediaId, userId } } });
      if (!existing) { await prisma.like.create({ data: { id: "l_" + crypto.randomBytes(4).toString("hex"), mediaId, userId } }); }
      else { await prisma.like.delete({ where: { mediaId_userId: { mediaId, userId } } }); }
      const likesCount = await prisma.like.count({ where: { mediaId } });
      return { liked: !existing, likesCount };
    }
    const i = this.cache.likes.findIndex(l => l.mediaId === mediaId && l.userId === userId);
    const media = this.cache.media.find(m => m.id === mediaId);
    if (!media) throw new Error("Media not found");
    if (i === -1) { this.cache.likes.push({ id: "l_" + crypto.randomBytes(4).toString("hex"), mediaId, userId }); media.likesCount++; }
    else { this.cache.likes.splice(i, 1); media.likesCount = Math.max(0, media.likesCount - 1); }
    this.save();
    return { liked: i === -1, likesCount: media.likesCount };
  }

  async toggleFavourite(mediaId: string, userId: string) {
    const prisma = getPrisma();
    if (prisma) {
      const existing = await prisma.favourite.findUnique({ where: { mediaId_userId: { mediaId, userId } } });
      if (!existing) await prisma.favourite.create({ data: { id: "fav_" + crypto.randomBytes(4).toString("hex"), mediaId, userId } });
      else await prisma.favourite.delete({ where: { mediaId_userId: { mediaId, userId } } });
      return !existing;
    }
    const i = this.cache.favourites.findIndex(f => f.mediaId === mediaId && f.userId === userId);
    if (i === -1) { this.cache.favourites.push({ id: "fav_" + crypto.randomBytes(4).toString("hex"), mediaId, userId }); this.save(); return true; }
    this.cache.favourites.splice(i, 1); this.save(); return false;
  }

  // ── Notifications ──────────────────────────────────────────────────────
  async getNotificationsByUser(userId: string) {
    const prisma = getPrisma();
    if (prisma) return (await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })).map(n => ({ ...n, createdAt: n.createdAt.toISOString() })) as unknown as Notification[];
    return this.cache.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async sendNotification(userId: string, type: "LIKE" | "COMMENT" | "SYSTEM", message: string, mediaId?: string) {
    const id = "n_" + crypto.randomBytes(4).toString("hex");
    const prisma = getPrisma();
    if (prisma) return (await prisma.notification.create({ data: { id, userId, type: type as any, message, mediaId, read: false } })) as unknown as Notification;
    const n: Notification = { id, userId, type, message, mediaId, read: false, createdAt: new Date().toISOString() };
    this.cache.notifications.push(n); this.save(); return n;
  }

  async markAllNotificationsAsRead(userId: string) {
    const prisma = getPrisma();
    if (prisma) { await prisma.notification.updateMany({ where: { userId }, data: { read: true } }); return; }
    this.cache.notifications.forEach(n => { if (n.userId === userId) n.read = true; }); this.save();
  }

  async markNotificationAsRead(id: string) {
    const prisma = getPrisma();
    if (prisma) { await prisma.notification.update({ where: { id }, data: { read: true } }); return; }
    const n = this.cache.notifications.find(n => n.id === id);
    if (n) { n.read = true; this.save(); }
  }

  // ── Activities ─────────────────────────────────────────────────────────
  private get actPath() { return path.join(process.cwd(), "activities.json"); }

  async getActivities(): Promise<Activity[]> {
    if (!fs.existsSync(this.actPath)) { fs.writeFileSync(this.actPath, "[]", "utf-8"); return []; }
    try { return JSON.parse(fs.readFileSync(this.actPath, "utf-8")); } catch { return []; }
  }

  async logActivity(userId: string, userName: string, userEmail: string, userRole: string, type: Activity["type"], details: string) {
    const list = await this.getActivities();
    const a: Activity = { id: "act_" + crypto.randomBytes(4).toString("hex"), userId, userName, userEmail, userRole, type, details, createdAt: new Date().toISOString() };
    list.unshift(a);
    fs.writeFileSync(this.actPath, JSON.stringify(list.slice(0, 100), null, 2), "utf-8");
    return a;
  }

  // ── Analytics ──────────────────────────────────────────────────────────
  async getAnalytics() {
    const prisma = getPrisma();
    if (prisma) return { totalUsers: await prisma.user.count(), totalEvents: await prisma.event.count(), totalAlbums: await prisma.album.count(), totalUploads: await prisma.media.count(), totalLikes: await prisma.like.count(), totalDownloads: 148 };
    return { totalUsers: this.cache.users.length, totalEvents: this.cache.events.length, totalAlbums: this.cache.albums.length, totalUploads: this.cache.media.length, totalLikes: this.cache.likes.length || 15, totalDownloads: 148 };
  }
}

export const db = new DbService();
