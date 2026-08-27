import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (isProduction) {
      throw new Error("CRITICAL SECURITY ERROR: JWT_ACCESS_SECRET is not configured in production environment.");
    }
    return "dev_avira_mlm_access_secret_key_2026_x789";
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (isProduction) {
      throw new Error("CRITICAL SECURITY ERROR: JWT_REFRESH_SECRET is not configured in production environment.");
    }
    return "dev_avira_mlm_refresh_secret_key_2026_r456";
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  memberId: string;
  role: string;
  fullName: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: "2h",
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: "30d",
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, getAccessSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, getRefreshSecret()) as TokenPayload;
  } catch {
    return null;
  }
}
