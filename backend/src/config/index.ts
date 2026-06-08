import { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";

// ── Prisma ──────────────────────────────────────────────────────────────────
export const usePrisma = process.env.DB_PROVIDER === "postgresql";

let _prisma: PrismaClient | null = null;
export function getPrisma(): PrismaClient | null {
  if (!usePrisma) return null;
  if (!_prisma) _prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  return _prisma;
}

// ── S3 ──────────────────────────────────────────────────────────────────────
let _s3: S3Client | null = null;
export function getS3Client(): S3Client | null {
  const { AWS_ACCESS_KEY_ID: key, AWS_SECRET_ACCESS_KEY: secret, AWS_REGION: region = "us-east-1" } = process.env;
  if (!key || !secret || key === "mock_aws_access_key") return null;
  if (!_s3) _s3 = new S3Client({ region, credentials: { accessKeyId: key, secretAccessKey: secret } });
  return _s3;
}

// ── JWT ─────────────────────────────────────────────────────────────────────
export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is required but not set.");

// ── App ─────────────────────────────────────────────────────────────────────
export const PORT = parseInt(process.env.PORT || "3000", 10);
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "eventsphere-media";
export const AWS_REGION = process.env.AWS_REGION || "us-east-1";
