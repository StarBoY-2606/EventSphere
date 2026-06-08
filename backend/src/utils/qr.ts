/**
 * QR Code Utility
 * Generates a QR code URL using the qrserver.com API.
 */
export function generateQRCodeUrl(path: string, appUrl?: string): string {
  const base = appUrl || process.env.APP_URL || "http://localhost:3000";
  const fullUrl = `${base}${path}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;
}
