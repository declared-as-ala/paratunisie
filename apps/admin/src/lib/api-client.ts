function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // If accessing via VPS IP directly
    if (host === "145.223.118.9") {
      return `http://145.223.118.9:3013/api/v1`;
    }
    // If accessing on production domain
    if (host.includes("paratunisie.com")) {
      return "https://paratunisie.com/api/v1";
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  }
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://paratunisie-api:3001/api/v1";
}

export function resolveMediaUrl(value?: string | null, fallback = "/assets/product-tube.webp") {
  if (!value) return fallback;
  if (/^(?:https?:)?\/\//i.test(value) || /^(?:data|blob):/i.test(value)) return value;
  if (!/^\/?uploads\//i.test(value)) return value;

  const cleanPath = value.replace(/^\/+/, "");
  return `https://paratunisie.com/${cleanPath}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // response wasn't JSON — keep statusText
    }
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function uploadMediaFile(file: File): Promise<{ url: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${getApiBaseUrl()}/catalogue/upload-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    let message = "Échec du téléchargement";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, res.status);
  }
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  uploadImage: uploadMediaFile,
};
