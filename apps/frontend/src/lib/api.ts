// apps/frontend/src/lib/api.ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
  .replace(/\/+$/, "");

const urlFor = (path: string) =>
  `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

const safeJson = (t: string) => {
  try { return JSON.parse(t); } catch { return { raw: t }; }
};

/** Convert a relative path from the backend (e.g. /uploads/...) to a full URL */
export function toPublicUrl(p?: string | null) {
  if (!p) return "";
  return /^https?:\/\//i.test(p) ? p : `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
}

const tokenFromStorage = () => {
  if (typeof window === "undefined") return undefined;
  try { return localStorage.getItem("token") || undefined; } catch { return undefined; }
};

/** Call when API returns 401 or "expired" so the app can clear auth and redirect to login */
export const onAuthFailure = (() => {
  let handler: (() => void) | null = null;
  return {
    set(h: () => void) {
      handler = h;
    },
    call() {
      handler?.();
    },
  };
})();

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

  let res: Response;
  try {
    res = await fetch(urlFor(path), {
      method,
      headers,
      body:
        method === "GET" || method === "DELETE"
          ? undefined
          : isForm
          ? (opts?.body as FormData)
          : JSON.stringify(opts?.body ?? {}),
    });
  } catch (error: any) {
    // Network error (backend not running, CORS, etc.)
    const url = urlFor(path);
    throw new Error(
      `Failed to connect to backend at ${url}. Make sure the backend server is running on port 3001. ${error?.message || ""}`
    );
  }

  const text = await res.text();
  const data = safeJson(text);
  if (!res.ok) {
    let msg: string | string[] = `HTTP ${res.status}`;

    if (data && typeof data === "object") {
      if (Array.isArray(data.message)) {
        msg = data.message;
      } else if (typeof data.message === "string") {
        msg = data.message;
      } else if (typeof data.message === "object" && data.message !== null) {
        // NestJS validation: { field: ["error1", "error2"] }
        msg = Object.entries(data.message as Record<string, string[]>)
          .flatMap(([k, v]) => (Array.isArray(v) ? v : [String(v)]).map((e) => `${k}: ${e}`));
      } else if (typeof data.error === "string") {
        msg = data.error;
      } else if (data.raw && typeof data.raw === "string") {
        msg = data.raw.length > 200 ? data.raw.slice(0, 200) + "…" : data.raw;
      }
    } else if (text && text.trim()) {
      msg = text.length > 200 ? text.slice(0, 200) + "…" : text;
    }

    const errorMessage = Array.isArray(msg) ? msg.join(". ") : String(msg);
    const finalMessage = errorMessage.trim() || `${res.status} ${res.statusText}`;

    const isAuthError = res.status === 401 || /token expired|jwt expired|invalid token|unauthorized/i.test(finalMessage);
    if (isAuthError) {
      onAuthFailure.call();
    }

    console.error(`API Error [${res.status}] ${urlFor(path)}:`, finalMessage, data);
    throw new Error(finalMessage);
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
