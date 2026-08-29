import jwt from "jsonwebtoken";

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_ACCESS_SECRET is required in production environment.");
    }
    return "avira_dev_access_secret_key_change_in_prod";
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_REFRESH_SECRET is required in production environment.");
    }
    return "avira_dev_refresh_secret_key_change_in_prod";
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
