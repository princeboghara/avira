import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "@/lib/jwt";

/**
 * Extracts and verifies the member session from cookies or Bearer Authorization header.
 * Returns null if token is missing, expired, or tampered.
 */
export async function getSession(req?: NextRequest): Promise<TokenPayload | null> {
  try {
    let token = "";

    if (req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else {
        token = req.cookies.get("avira_access_token")?.value || "";
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("avira_access_token")?.value || "";

      if (!token) {
        const headerList = await headers();
        const authHeader = headerList.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    }

    if (!token) return null;

    const payload = verifyAccessToken(token);
    return payload || null;
  } catch (err) {
    console.error("Session retrieval error:", err);
    return null;
  }
}

/**
 * Extracts and verifies the administrator session.
 * Requires valid token signature AND role === 'ADMIN'.
 */
export async function getAdminSession(req?: NextRequest): Promise<TokenPayload | null> {
  try {
    let token = "";

    if (req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else {
        token = req.cookies.get("admin_access_token")?.value || "";
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_access_token")?.value || "";

      if (!token) {
        const headerList = await headers();
        const authHeader = headerList.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    }

    if (!token) return null;

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== "ADMIN") return null;

    return payload;
  } catch (err) {
    console.error("Admin session retrieval error:", err);
    return null;
  }
}

/**
 * Route handler guard for member-authenticated API routes.
 */
export async function requireMemberSession(req?: NextRequest): Promise<
  | { session: TokenPayload; errorResponse?: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getSession(req);
  if (!session || !session.memberId) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Route handler guard for admin-authenticated API routes.
 */
export async function requireAdminSession(req?: NextRequest): Promise<
  | { session: TokenPayload; errorResponse?: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getAdminSession(req);
  if (!session || session.role !== "ADMIN") {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Unauthorized. Administrator access required." },
        { status: 403 }
      ),
    };
  }
  return { session };
}

/**
 * Extracts and verifies the Shoppy (Franchise) session.
 * Checks shoppy_access_token cookie or Authorization Bearer header.
 */
export async function getShoppySession(req?: NextRequest): Promise<TokenPayload | null> {
  try {
    let token = "";

    if (req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else {
        token = req.cookies.get("shoppy_access_token")?.value || "";
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("shoppy_access_token")?.value || "";

      if (!token) {
        const headerList = await headers();
        const authHeader = headerList.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    }

    if (!token) return null;

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== "SHOPPY") return null;

    return payload;
  } catch (err) {
    console.error("Shoppy session retrieval error:", err);
    return null;
  }
}

/**
 * Route handler guard for Shoppy-authenticated API routes.
 */
export async function requireShoppySession(req?: NextRequest): Promise<
  | { session: TokenPayload; errorResponse?: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getShoppySession(req);
  if (!session || session.role !== "SHOPPY") {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Unauthorized. Shoppy authentication required." },
        { status: 401 }
      ),
    };
  }
  return { session };
}
