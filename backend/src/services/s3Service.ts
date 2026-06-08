import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, BUCKET_NAME, AWS_REGION } from "../config";

const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export async function uploadMedia(fileBase64: string, filename: string): Promise<{ url: string; isFallback: boolean }> {
  const s3 = getS3Client();
  const matches = fileBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  let mimeType = "image/png";
  let bufferData: Buffer;

  if (matches) {
    mimeType = matches[1];
    bufferData = Buffer.from(matches[2], "base64");
  } else if (fileBase64.startsWith("data:image/svg+xml")) {
    mimeType = "image/svg+xml";
    bufferData = Buffer.from(fileBase64.split(",")[1], "base64");
  } else {
    bufferData = Buffer.from(fileBase64, "base64");
  }

  const ext = mimeType.split("/")[1] || "png";
  const uniqueKey = `${crypto.randomUUID()}.${ext}`;

  if (s3) {
    try {
      await s3.send(new PutObjectCommand({ Bucket: BUCKET_NAME, Key: uniqueKey, Body: bufferData, ContentType: mimeType }));
      return { url: `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uniqueKey}`, isFallback: false };
    } catch (err) {
      console.error("S3 upload failed, falling back to local:", err);
    }
  }

  const localPath = path.join(UPLOADS_DIR, uniqueKey);
  fs.writeFileSync(localPath, bufferData);
  return { url: `/uploads/${uniqueKey}`, isFallback: true };
}
