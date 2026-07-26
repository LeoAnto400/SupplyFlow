import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Presence-only check: the refresh token is an httpOnly cookie set by the backend
// (docs/architecture.md §6). Actual JWT verification happens on the API, not here.
const REFRESH_COOKIE = "refreshToken";

const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_COOKIE);
  const { pathname } = request.nextUrl;
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isAuthPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
