import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Intercept all /api/ requests and proxy them dynamically at runtime
  if (pathname.startsWith("/api/")) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const targetUrl = new URL(`${pathname}${search}`, backendUrl);
    return NextResponse.rewrite(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
