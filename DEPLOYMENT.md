# EventSphere Production & Cloud Deployment Manual

This guide describes how to configure, pack, deploy, and scale EventSphere on production targets (Vercel, Render, AWS, and Docker).

---

## Technical Configuration Requirements (`.env`)

Configure the following variables in the root directory prior to system launch:

```env
# Server Ingress Controls
PORT=3000
NODE_ENV=production

# Security Token Hashes
JWT_SECRET=eventsphere_super_secret_key_1337

# Multi-Modal Gemini Visual Models
GEMINI_API_KEY=AIzaSy...

# Cloud DB Integrations
DATABASE_URL=postgresql://neondb_owner:...@ep-blue-cloud.neon.tech/neondb?sslmode=require

# AWS CDN & S3 Access
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=eventsphere-media-archives
AWS_REGION=us-east-1
```

---

## AWS S3 Bucket Setup Guide

To connect high-speed persistent storage, configure an S3 bucket with proper CORS policies to verify and accept incoming visual payloads.

1. **Create S3 Bucket**: Open the Amazon Web Services Dashboard, navigate to S3, and initialize a private block bucket named `eventsphere-media-archives`.
2. **Access Control (IAM Roles)**: Create an IAM user with `AmazonS3FullAccess` or restricted put/get capabilities to prevent credential abuse.
3. **Configure Block Public Access**: Avoid unauthenticated global viewing. Ensure block public access settings are enabled, using signed URLs to manage temporary retrievals.
4. **CORS Configuration Integration**: Update permissions headers in S3 to authorize client frames. Apply the following JSON outline template inside the S3 CORS rules editor:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://*.eventsphere.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
}
]
```

---

## Facial Recognition Pipeline & Gemini Spatial Verification

EventSphere uses the state-of-the-art **Gemini 3.5 Flash** visual model to implement reliable image comparison without maintaining a complex, custom-trained neural network:

1. **Embedding Stage**: When a user registers their reference selfie, the base64 structure is saved to their profile on the backend server.
2. **Indexing Scanning**: Triggering `/api/face-recognition/scan` pulls all media records associated with active events.
3. **Landmark Assessment Loop**: For each photo, the server creates a multimodal payload combining two inline data objects:
   - **Object A**: The reference selfie base64 buffer.
   - **Object B**: The event scene candidate base64 buffer.
4. **Cognitive Vector Matches**: Gemini processes the spatial layout, nose/ear profiles, eyes, hairline, and facial contours, responding with `{"match": true}` if the same person is detected in both scenes. Matches are then compiled and returned to the client.

---

## Docker Container Packaging

Run these commands in the root directory of your project to build and package EventSphere under Docker:

### 1. Dockerfile Representation
```dockerfile
# Node.js alpine execution state
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Standalone lean release state
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data.json ./data.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Standalone Build Controls
```bash
# Compile and containerize the image
docker build -t eventsphere-media .

# Execute container mapping Port 3000
docker run -p 3000:3000 --env-file .env eventsphere-media
```
