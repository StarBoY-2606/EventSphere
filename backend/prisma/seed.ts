import { PrismaClient, Role, Visibility } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const hash = (password: string) =>
  crypto.createHash("sha256").update(password).digest("hex");

async function main() {
  console.log("🌱 Seeding EventSphere database...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@eventsphere.com" },
    update: {},
    create: {
      id: "u1",
      name: "Admin User",
      email: "admin@eventsphere.com",
      passwordHash: hash("admin123"),
      role: Role.ADMIN,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminUser",
    },
  });

  const photographer = await prisma.user.upsert({
    where: { email: "photographer@eventsphere.com" },
    update: {},
    create: {
      id: "u2",
      name: "Guest Photographer",
      email: "photographer@eventsphere.com",
      passwordHash: hash("photo123"),
      role: Role.PHOTOGRAPHER,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=SarahConnor",
    },
  });

  await prisma.user.upsert({
    where: { email: "member@eventsphere.com" },
    update: {},
    create: {
      id: "u3",
      name: "Guest Member",
      email: "member@eventsphere.com",
      passwordHash: hash("member123"),
      role: Role.CLUB_MEMBER,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexJohnson",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@eventsphere.com" },
    update: {},
    create: {
      id: "u4",
      name: "Guest Viewer",
      email: "viewer@eventsphere.com",
      passwordHash: hash("viewer123"),
      role: Role.VIEWER,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=GuestViewer",
    },
  });

  console.log("✅ Users seeded");

  // ── Events ─────────────────────────────────────────────────────────────────
  const event1 = await prisma.event.upsert({
    where: { id: "e1" },
    update: {},
    create: {
      id: "e1",
      name: "Global AI Summit 2024",
      description: "A grand summit with industry leaders discussing generative algorithms, cloud native models, and high-performance computing frameworks.",
      category: "Conference",
      date: new Date("2024-10-12"),
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80",
      visibility: Visibility.PUBLIC,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: "e2" },
    update: {},
    create: {
      id: "e2",
      name: "Annual Executive Gala",
      description: "An elegant networking dinner and recognition night reserved for our partners and executive delegates.",
      category: "Gala",
      date: new Date("2024-11-05"),
      coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop&q=80",
      visibility: Visibility.PRIVATE,
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: "e3" },
    update: {},
    create: {
      id: "e3",
      name: "The Sterling Wedding",
      description: "The beautiful vows and magnificent reception holding key moments of the Sterling family.",
      category: "Wedding",
      date: new Date("2024-12-20"),
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80",
      visibility: Visibility.PUBLIC,
    },
  });

  await prisma.event.upsert({
    where: { id: "e4" },
    update: {},
    create: {
      id: "e4",
      name: "AI Creative Workshop",
      description: "Hands-on, multi-modal sandbox testing workspace using live agents and visual models.",
      category: "Workshop",
      date: new Date("2025-01-15"),
      coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
      visibility: Visibility.PRIVATE,
    },
  });

  console.log("✅ Events seeded");

  // ── Albums ─────────────────────────────────────────────────────────────────
  const album1 = await prisma.album.upsert({
    where: { id: "a1" },
    update: {},
    create: {
      id: "a1",
      eventId: event1.id,
      name: "Keynote Speeches",
      coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    },
  });

  await prisma.album.upsert({
    where: { id: "a2" },
    update: {},
    create: {
      id: "a2",
      eventId: event1.id,
      name: "Panel Discussions",
      coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    },
  });

  const album3 = await prisma.album.upsert({
    where: { id: "a3" },
    update: {},
    create: {
      id: "a3",
      eventId: event2.id,
      name: "Awards Ceremony",
      coverImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=80",
    },
  });

  await prisma.album.upsert({
    where: { id: "a4" },
    update: {},
    create: {
      id: "a4",
      eventId: event3.id,
      name: "Ceremony & Rings",
      coverImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ Albums seeded");

  // ── Media ──────────────────────────────────────────────────────────────────
  const media1 = await prisma.media.upsert({
    where: { id: "m1" },
    update: {},
    create: {
      id: "m1",
      eventId: event1.id,
      albumId: album1.id,
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
      uploadedBy: photographer.id,
      tags: ["Stage", "Crowd", "Indoor", "Workshop"],
    },
  });

  const media2 = await prisma.media.upsert({
    where: { id: "m2" },
    update: {},
    create: {
      id: "m2",
      eventId: event1.id,
      albumId: album1.id,
      url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
      uploadedBy: photographer.id,
      tags: ["Stage", "Indoor", "Workshop"],
    },
  });

  const media3 = await prisma.media.upsert({
    where: { id: "m3" },
    update: {},
    create: {
      id: "m3",
      eventId: event2.id,
      albumId: album3.id,
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
      uploadedBy: admin.id,
      tags: ["Stage", "Indoor", "Party", "Food"],
    },
  });

  console.log("✅ Media seeded");

  // ── Comments ───────────────────────────────────────────────────────────────
  await prisma.comment.upsert({
    where: { id: "c1" },
    update: {},
    create: {
      id: "c1",
      mediaId: media1.id,
      userId: "u3",
      text: "Outstanding keynote! The future of agentic AI is already here.",
    },
  });

  await prisma.comment.upsert({
    where: { id: "c2" },
    update: {},
    create: {
      id: "c2",
      mediaId: media3.id,
      userId: "u3",
      text: "What an exquisite dinner arrangement! Simply marvelous.",
    },
  });

  console.log("✅ Comments seeded");

  // ── Likes ──────────────────────────────────────────────────────────────────
  await prisma.like.upsert({
    where: { mediaId_userId: { mediaId: media1.id, userId: "u3" } },
    update: {},
    create: {
      id: "l1",
      mediaId: media1.id,
      userId: "u3",
    },
  });

  await prisma.like.upsert({
    where: { mediaId_userId: { mediaId: media2.id, userId: "u3" } },
    update: {},
    create: {
      id: "l2",
      mediaId: media2.id,
      userId: "u3",
    },
  });

  await prisma.like.upsert({
    where: { mediaId_userId: { mediaId: media3.id, userId: "u4" } },
    update: {},
    create: {
      id: "l3",
      mediaId: media3.id,
      userId: "u4",
    },
  });

  console.log("✅ Likes seeded");

  console.log("\n🎉 Seeding complete!");
  console.log("   admin@eventsphere.com        / admin123   (ADMIN)");
  console.log("   photographer@eventsphere.com / photo123   (PHOTOGRAPHER)");
  console.log("   member@eventsphere.com        / member123  (CLUB_MEMBER)");
  console.log("   viewer@eventsphere.com        / viewer123  (VIEWER)");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
