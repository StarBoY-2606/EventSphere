/**
 * Watermark Engine
 * Injects a semi-transparent banner into SVG images.
 * For raster images, returns the URL for client-side canvas watermarking.
 */
export function applyWatermark(base64: string, eventName: string): { type: "svg" | "raster"; data: string; eventName: string } {
  if (base64.startsWith("data:image/svg+xml")) {
    const svgSource = Buffer.from(base64.split(",")[1], "base64").toString("utf-8");
    const watermarked = svgSource.replace("</svg>", `
      <rect x="0" y="380" width="800" height="70" fill="rgba(8, 14, 30, 0.85)" />
      <text x="25" y="420" font-family="'Inter', sans-serif" font-size="20" font-weight="bold" fill="#ADC6FF">© EventSphere Watermark Protocol</text>
      <text x="775" y="420" font-family="'Inter', sans-serif" font-size="16" text-anchor="end" fill="#dae2fd">${eventName}</text>
    </svg>`);
    return { type: "svg", data: watermarked, eventName };
  }
  return { type: "raster", data: base64, eventName };
}

export function generateMockImageBase64(text: string, colorHex = "ADC6FF", bgHex = "171F33"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#${bgHex}"/>
    <circle cx="400" cy="225" r="150" fill="#${colorHex}" opacity="0.08" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="36" font-weight="bold" fill="#${colorHex}">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
