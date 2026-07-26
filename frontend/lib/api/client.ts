import { getAccessToken, setAccessToken } from "@/lib/auth/tokens";
import type { ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  { retryOn401 = true }: { retryOn401?: boolean } = {}
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, init, { retryOn401: false });
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(
      body?.message ?? res.statusText,
      res.status,
      body?.code
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { ApiRequestError, API_URL };
