// apps/frontend/src/lib/api.ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
  .replace(/\/+$/, "");

const urlFor = (path: string) =>
  `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

const safeJson = (t: string) => {
  try { return JSON.parse(t); } catch { return { raw: t }; }
};

const tokenFromStorage = () => {
  if (typeof window === "undefined") return undefined;
  try { return localStorage.getItem("token") || undefined; } catch { return undefined; }
};

async function request<T = any>(
  method: HttpMethod,
  path: string,
  opts?: {
    body?: unknown | FormData;
    token?: string;
    headers?: Record<string, string>;
    formData?: boolean; // if true, don't set JSON header
  }
): Promise<T> {
  const isForm = !!opts?.formData;
  const token = opts?.token ?? tokenFromStorage();

  const headers: Record<string, string> = {
    ...(isForm ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts?.headers ?? {}),
  };

  const res = await fetch(urlFor(path), {
    method,
    headers,
    body:
      method === "GET" || method === "DELETE"
        ? undefined
        : isForm
        ? (opts?.body as FormData)
        : JSON.stringify(opts?.body ?? {}),
  });

  const text = await res.text();
  const data = safeJson(text);
  if (!res.ok) {
    let msg: string | string[] = `HTTP ${res.status}`;
    
    if (data) {
      if (data.message) {
        msg = data.message;
      } else if (data.error) {
        msg = data.error;
      } else if (data.raw) {
        msg = data.raw;
      }
    }
    
    const errorMessage = Array.isArray(msg) ? msg.join(", ") : String(msg);
    throw new Error(errorMessage);
  }
  return data as T;
}

// JSON helpers
export const get = <T = any>(path: string, token?: string) =>
  request<T>("GET", path, { token });
export const post = <T = any>(path: string, body?: unknown, token?: string) =>
  request<T>("POST", path, { body, token });
export const put = <T = any>(path: string, body?: unknown, token?: string) =>
  request<T>("PUT", path, { body, token });
export const patch = <T = any>(path: string, body?: unknown, token?: string) =>
  request<T>("PATCH", path, { body, token });
export const del = <T = any>(path: string, token?: string) =>
  request<T>("DELETE", path, { token });

// Multipart helpers (e.g. avatar uploads)
export const putForm = <T = any>(path: string, form: FormData, token?: string) =>
  request<T>("PUT", path, { body: form, token, formData: true });
export const postForm = <T = any>(path: string, form: FormData, token?: string) =>
  request<T>("POST", path, { body: form, token, formData: true });
