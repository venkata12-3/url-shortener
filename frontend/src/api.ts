export interface ShortLink {
  shortCode: string;
  longUrl: string;
  clickCount: number;
}

export interface LinkStats {
  shortCode: string;
  clickCount: number;
}

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body || `Request failed (${response.status})`;
    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string };
      message = parsed.message ?? parsed.error ?? message;
    } catch {
      // Some backend errors are plain text rather than JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json() as Promise<T>;
  return response.text() as Promise<T>;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string }>("/api/v1/auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (username: string, email: string, password: string) =>
    request<string>("/api/v1/auth/register", undefined, {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  links: (token: string) => request<ShortLink[]>("/api/v1/urls/me", token),
  create: (token: string, longUrl: string, customAlias: string, expiresAt: string) =>
    request<{ shortCode: string }>("/api/v1/urls", token, {
      method: "POST",
      body: JSON.stringify({
        longUrl,
        ...(customAlias ? { customAlias } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      }),
    }),
  stats: (shortCode: string) =>
    request<LinkStats>(`/api/v1/urls/${encodeURIComponent(shortCode)}/stat`),
  remove: (token: string, shortCode: string) =>
    request<string>(`/api/v1/urls/${encodeURIComponent(shortCode)}`, token, { method: "DELETE" }),
};

export function shortUrlFor(shortCode: string): string {
  const publicBase = import.meta.env.VITE_PUBLIC_SHORT_URL_BASE;
  return `${(publicBase || window.location.origin).replace(/\/$/, "")}/api/v1/urls/${encodeURIComponent(shortCode)}`;
}
