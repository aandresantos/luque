import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import type { UserType } from "../modules/user/user.schema";

const ACCESS_TOKEN_SECRET =
  process.env.AUTH_ACCESS_TOKEN_SECRET ?? "luque-dev-access-secret";
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS ?? 900);
const REFRESH_TOKEN_TTL_SECONDS = Number(
  process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30,
);

export type AccessTokenPayload = {
  sub: string;
  type: UserType;
  sessionId: string;
  exp: number;
  iat: number;
};

export function issueAccessToken(payload: Omit<AccessTokenPayload, "exp" | "iat">): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.sessionId !== "string" ||
      typeof payload.type !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number"
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function issueRefreshToken(): { token: string; expiresAt: Date } {
  return {
    token: randomBytes(48).toString("base64url"),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
  };
}
