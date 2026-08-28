import jwt from "jsonwebtoken";

function getAccessSecret(): string {
  return (
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    "avira_mlm_emerald_super_secret_access_jwt_key_2026"
  );
}

function getRefreshSecret(): string {
  return (
    process.env.JWT_REFRESH_SECRET ||
    "avira_mlm_emerald_super_secret_refresh_jwt_key_2026"
  );
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
