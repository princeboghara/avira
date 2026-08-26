import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Strict Member Portal Authentication Guard
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("avira_access_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Strict Admin Portal Authentication Guard
  if (pathname.startsWith("/admin/dashboard")) {
    const adminToken = request.cookies.get("admin_access_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};
