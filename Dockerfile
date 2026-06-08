# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
 
# Set Docker build flag so vite.config.ts uses correct frontend path
ENV DOCKER_BUILD=true
 
# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install
 
# Copy prisma schema first
COPY backend/prisma ./prisma
 
# Generate Prisma client
RUN npx prisma generate
 
# Copy backend source files
COPY backend/ ./
 
# Copy frontend inside /app/frontend
COPY frontend/ ./frontend/
 
# Build frontend (vite) + backend (esbuild)
RUN npm run build
 
# ── Stage 2: Production runner ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
 
# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
 
# Copy built output
COPY --from=builder /app/dist ./dist
 
# Copy Prisma files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY backend/prisma ./prisma
 
# Create uploads directory
RUN mkdir -p public/uploads
 
EXPOSE 3000
 
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/server.cjs"]

