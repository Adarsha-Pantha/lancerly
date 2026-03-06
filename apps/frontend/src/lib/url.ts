// apps/frontend/src/lib/url.ts
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export const toPublicUrl = (p?: string | null) =>
  p ? (/^https?:\/\//i.test(p) ? p : `${API}${p}`) : "";
