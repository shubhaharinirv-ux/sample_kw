// src/lib/api.ts
/**
 * API Base URL Configuration
 *
 * Priority order:
 * 1. VITE_API_BASE environment variable
 * 2. Environment-specific default (dev: http://127.0.0.1:8000, prod: https://api.production.com)
 *
 * Set VITE_API_BASE in .env or .env.local to override defaults
 */
/**
 * API Base URL Configuration
 * 
 * In standard operation (Dev or Prod with proxy), this should be '/api'.
 * The proxy (Vite or Nginx) handles forwarding to the correct backend port (8001 Dev / 8000 Prod).
 */
const getDefaultApiBase = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL);
  }
  // Default to relative /api which is proxied
  return "/api";
};

const normalizeBase = (base: string) => base.replace(/\/$/, "");
const withLeadingSlash = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export const API_BASE = normalizeBase(getDefaultApiBase());

// Log API configuration
console.debug("[API Config]", { API_BASE, mode: import.meta.env.MODE });

export const buildApiUrl = (path: string) => {
  // If API_BASE is relative (/api), ensure we don't double slash if path is also /
  if (API_BASE === '/api' && path.startsWith('/')) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}${withLeadingSlash(path)}`;
};

import { pushToast } from "./toast";
import type { AuthResponseDto } from "@/shared/types/domain";

export const ACCESS_TOKEN_KEY = "kalai_access_token";
export const REFRESH_TOKEN_KEY = "kalai_refresh_token";
export const USER_KEY = "kalai_user";
export const AUTH_UPDATED_EVENT = "auth:updated";

// Track if we've already shown a session expired toast to prevent duplicates
let sessionExpiredToastShown = false;

// Reset the flag when user logs in again so future session expiry can show toast
export const resetSessionExpiredFlag = () => {
  sessionExpiredToastShown = false;
};

export type StoredUser = any;

export const getStoredSession = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  let user: StoredUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }
  return { accessToken, refreshToken, user };
};

export const saveSessionToStorage = (
  accessToken: string | null,
  refreshToken: string | null,
  user: StoredUser | null
) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }

  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
};

export const clearSessionStorage = () => {
  saveSessionToStorage(null, null, null);
};

const extractErrorMessage = async (res: Response) => {
  try {
    const data = await res.clone().json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      const first = data.detail[0];
      if (typeof first?.msg === "string") return first.msg;
    }
  } catch {
    // ignore json parse errors and fall through
  }
  const text = await res.text();
  return text || `Status ${res.status}`;
};

export function handleApiError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.detail !== "undefined"
  ) {
    const detail = (error as any).response.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
      return detail[0].msg;
    }
  }
  return "Something went wrong";
}

async function handleResponse<T>(res: Response, opts?: { suppressToast?: boolean }): Promise<T> {
  if (!res.ok) {
    let data: unknown = undefined;
    try {
      data = await res.clone().json();
    } catch {
      data = undefined;
    }
    const message = await extractErrorMessage(res);
    // Only show toast if not suppressed (e.g., for expected 401s before login)
    if (!opts?.suppressToast) {
      pushToast({
        title: "Request failed",
        description: message,
        variant: "error",
      });
    }
    const error = new Error(message || "Network response was not ok") as Error & {
      status?: number;
      data?: unknown;
    };
    error.status = res.status;
    if (data !== undefined) {
      error.data = data;
    }
    throw error;
  }

  // 204 No Content or empty body should return undefined/void without parsing JSON.
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

const buildAuthHeader = (authToken?: string | null) => {
  const token = authToken ?? getStoredSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const doFetch = (
  path: string,
  init: RequestInit,
  opts?: { authToken?: string | null }
) => {
  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...buildAuthHeader(opts?.authToken),
  };
  return fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
};

const attemptRefresh = async (): Promise<"success" | "failed" | "no_token"> => {
  const { refreshToken, user } = getStoredSession();
  if (!refreshToken) return "no_token";

  try {
    const res = await fetch(buildApiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      clearSessionStorage();
      return "failed";
    }

    const data = (await res.json()) as AuthResponseDto;
    saveSessionToStorage(data.access_token, data.refresh_token, user);
    return "success";
  } catch {
    clearSessionStorage();
    return "failed";
  }
};

async function requestWithAuth<T>(
  path: string,
  init: RequestInit,
  opts?: {
    authToken?: string | null;
    skipRefresh?: boolean;
    suppressToastOn401?: boolean;
    suppressToast?: boolean;
  }
): Promise<T> {
  let res = await doFetch(path, init, opts);

  if (res.status === 401 && !opts?.skipRefresh) {
    const refreshResult = await attemptRefresh();
    if (refreshResult === "success") {
      res = await doFetch(path, init, opts);
    } else if (refreshResult === "failed" && !sessionExpiredToastShown) {
      // Show a single "session expired" toast instead of multiple error toasts
      sessionExpiredToastShown = true;
      pushToast({
        title: "Session expired",
        description: "Please login again",
        variant: "error",
      });
      throw new Error("Session expired");
    } else if (refreshResult === "failed") {
      // Already showed the toast, just throw without another toast
      throw new Error("Session expired");
    }
  }

  // Suppress toast for 401/403 errors when session is already known to be expired
  const suppressToast =
    opts?.suppressToast ||
    ((res.status === 401 || res.status === 403) && sessionExpiredToastShown) ||
    (res.status === 401 && opts?.suppressToastOn401);
  return handleResponse<T>(res, { suppressToast });
}

export async function getJSON<T>(
  path: string,
  opts?: { authToken?: string; suppressToast?: boolean }
) {
  return requestWithAuth<T>(path, { method: "GET" }, opts);
}

export async function patchJSON<T>(
  path: string,
  body: any,
  opts?: { authToken?: string; suppressToast?: boolean }
) {
  return requestWithAuth<T>(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    opts
  );
}

export async function postJSON<T>(
  path: string,
  body: any,
  opts?: { authToken?: string; suppressToast?: boolean }
) {
  return requestWithAuth<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    opts
  );
}

export async function deleteJSON<T = void>(
  path: string,
  opts?: { authToken?: string; suppressToast?: boolean }
) {
  return requestWithAuth<T>(path, { method: "DELETE" }, opts);
}

export async function fetchBlob(path: string, opts?: { authToken?: string }): Promise<Blob> {
  let res = await doFetch(path, { method: "GET" }, opts);

  if (res.status === 401 && !opts?.authToken) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      res = await doFetch(path, { method: "GET" }, opts);
    }
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Failed to fetch file: ${res.status}`);
  }

  return res.blob();
}

const parseFilenameFromContentDisposition = (value: string | null): string | undefined => {
  if (!value) return undefined;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(value);
  if (!match || !match[1]) return undefined;
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return match[1].trim();
  }
};

export async function fetchBlobWithFilename(
  path: string,
  opts?: { authToken?: string }
): Promise<{ blob: Blob; filename?: string }> {
  let res = await doFetch(path, { method: "GET" }, opts);

  if (res.status === 401 && !opts?.authToken) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      res = await doFetch(path, { method: "GET" }, opts);
    }
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Failed to fetch file: ${res.status}`);
  }

  const filename = parseFilenameFromContentDisposition(
    res.headers.get("content-disposition")
  );
  const blob = await res.blob();
  return { blob, filename };
}
