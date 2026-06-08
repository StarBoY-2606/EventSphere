import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PORT } from "./src/config";
import { authenticateToken } from "./src/middleware/auth";

import authRoutes from "./src/routes/auth";
import eventRoutes from "./src/routes/events";
import albumRoutes from "./src/routes/albums";
import mediaRoutes from "./src/routes/media";
import notificationRoutes from "./src/routes/notifications";
import analyticsRoutes from "./src/routes/analytics";

async function startServer() {
  const app = express();

  // ── Core middleware ───────────────────────────────────────────────────
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
  app.use(authenticateToken);

  // ── API routes ────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api", albumRoutes);
  app.use("/api", mediaRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // ── Frontend serving ──────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ EventSphere running on http://localhost:${PORT}`);
  });
}

startServer();
