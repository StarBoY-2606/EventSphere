import crypto from "crypto";
import { JWT_SECRET } from "../config";
import { UserRole } from "../types";

export function signToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  const fullPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const hmac = crypto.createHmac("sha256", JWT_SECRET!);
  hmac.update(`${header}.${fullPayload}`);
  return `${header}.${fullPayload}.${hmac.digest("base64url")}`;
}

export function verifyToken(token: string): { id: string; email: string; role: UserRole } | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;
    const hmac = crypto.createHmac("sha256", JWT_SECRET!);
    hmac.update(`${header}.${payload}`);
    if (signature !== hmac.digest("base64url")) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: decoded.id, email: decoded.email, role: decoded.role as UserRole };
  } catch {
    return null;
  }
}
