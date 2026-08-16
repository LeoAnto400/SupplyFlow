import { apiFetch } from "./client";
import type { User } from "@/types";

// Matches backend/src/modules/auth/presentation/auth.routes.ts `toResponseBody` —
// intentionally not the full `Organization` type, since these endpoints only
// ever return `{ id, name }`.
export interface AuthSession {
  accessToken: string;
  user: User;
  organization?: { id: string; name: string };
}

export function login(input: { email: string; password: string }): Promise<AuthSession> {
  return apiFetch<AuthSession>(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify(input) },
    { retryOn401: false }
  );
}

export function register(input: {
  organizationName: string;
  email: string;
  password: string;
}): Promise<AuthSession> {
  return apiFetch<AuthSession>(
    "/api/v1/auth/register",
    { method: "POST", body: JSON.stringify(input) },
    { retryOn401: false }
  );
}

// Relies on the httpOnly refresh cookie the browser sends automatically —
// used both for token refresh-on-401 (see lib/api/client.ts) and to
// rehydrate the in-memory access token + user on a hard page load.
export function refresh(): Promise<AuthSession> {
  return apiFetch<AuthSession>("/api/v1/auth/refresh", { method: "POST" }, { retryOn401: false });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/api/v1/auth/logout", { method: "POST" }, { retryOn401: false });
}
