import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPublicUrl } from "@/lib/url";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Strict Admin API Edge Protection
  if (pathname.startsWith("/api/admin")) {
    const isPublicAdminRoute =
      pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/logout";

    if (!isPublicAdminRoute) {
      const adminCookie = request.cookies.get("admin_access_token")?.value;
      const authHeader = request.headers.get("authorization");
      const hasBearer = authHeader && authHeader.startsWith("Bearer ");

      if (!adminCookie && !hasBearer) {
        return NextResponse.json(
          { success: false, message: "Unauthorized. Administrator session required." },
          { status: 401 }
        );
      }
    }
  }

  // 2. Strict Member API Edge Protection
  if (pathname.startsWith("/api/member")) {
    const memberCookie = request.cookies.get("avira_access_token")?.value;
    const authHeader = request.headers.get("authorization");
    const hasBearer = authHeader && authHeader.startsWith("Bearer ");

    if (!memberCookie && !hasBearer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Member session required." },
        { status: 401 }
      );
    }
  }

  // 3. Strict Admin Portal UI Protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_access_token")?.value;
    if (!adminToken) {
      const loginUrl = getPublicUrl("/admin/login", request);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Strict Member Portal UI Protection
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("avira_access_token")?.value;
    if (!token) {
      const loginUrl = getPublicUrl("/login", request);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Strict Shoppy API Edge Protection
  if (pathname.startsWith("/api/shoppy")) {
    const isPublicShoppyRoute =
      pathname === "/api/shoppy/auth/login" || pathname === "/api/shoppy/auth/logout";

    if (!isPublicShoppyRoute) {
      const shoppyCookie = request.cookies.get("shoppy_access_token")?.value;
      const authHeader = request.headers.get("authorization");
      const hasBearer = authHeader && authHeader.startsWith("Bearer ");

      if (!shoppyCookie && !hasBearer) {
        return NextResponse.json(
          { success: false, message: "Unauthorized. Shoppy session required." },
          { status: 401 }
        );
      }
    }
  }

  // 6. Strict Shoppy Portal UI Protection
  if (pathname.startsWith("/shoppy") && pathname !== "/shoppy/login") {
    const shoppyToken = request.cookies.get("shoppy_access_token")?.value;
    if (!shoppyToken) {
      const loginUrl = getPublicUrl("/shoppy/login", request);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 7. Response with security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/shoppy/:path*",
    "/api/admin/:path*",
    "/api/member/:path*",
    "/api/shoppy/:path*",
  ],
};
