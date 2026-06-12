import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface AccessTokenPayload {
  sub: string; // user id
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  // Random per-token ID. Without this, two refresh tokens issued for the
  // same user within the same second would be byte-for-byte identical
  // (JWTs are deterministic given the same payload + iat), which would
  // break reuse detection after rotation.
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  const refreshPayload: RefreshTokenPayload = { ...payload, jti: randomUUID() };
  return jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
