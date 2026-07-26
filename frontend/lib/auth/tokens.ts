// Access token lives in memory only (never localStorage) — the refresh token is an
// httpOnly cookie the browser sends automatically, per docs/architecture.md §6.

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
