import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/app-error";
import { verifyAccessToken } from "../utils/jwt";

// Augment Express's Request type so `req.userId` is available (and typed)
// in any handler placed after this middleware.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Verifies the `Authorization: Bearer <token>` header against the access
 * token secret and attaches the decoded user id to `req.userId`. Any
 * feature module that needs "must be logged in" protection (chat, AI
 * assistant, etc.) reuses this middleware.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}
