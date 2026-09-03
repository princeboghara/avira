import { NextRequest } from "next/server";

/**
 * Returns the public origin/base URL of the application.
 * Resolves properly behind reverse proxies (Render, AWS, Cloudflare, Nginx, Vercel)
 * and prevents redirects to internal container hosts such as 0.0.0.0:10000.
 */
export function getPublicBaseUrl(req?: Request | NextRequest | null): string {
  if (req) {
    // 1. Standard reverse-proxy forwarded host header (Render, AWS ALB, Cloudflare, Nginx)
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const proto = forwardedProto || (req.url?.startsWith("https") ? "https" : "http");

    if (forwardedHost && !forwardedHost.includes("0.0.0.0")) {
      return `${proto}://${forwardedHost}`;
    }

    // 2. Standard HTTP Host header
    const host = req.headers.get("host");
    if (host && !host.includes("0.0.0.0")) {
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      const scheme = isLocal ? "http" : proto;
      return `${scheme}://${host}`;
    }
  }

  // 3. Configured environment variable (e.g. on Render or production env)
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("0.0.0.0")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 4. Fallback to request URL if valid and not 0.0.0.0
  if (req && req.url) {
    try {
      const parsed = new URL(req.url);
      if (parsed.hostname !== "0.0.0.0") {
        return parsed.origin;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 5. Fallback to local default
  return "http://localhost:3000";
}

/**
 * Constructs a fully qualified public URL safely.
 */
export function getPublicUrl(path: string, req?: Request | NextRequest | null): URL {
  const base = getPublicBaseUrl(req);
  return new URL(path, base);
}
