import { createHash, timingSafeEqual } from "crypto";
import { ITokenService, TokenPair } from "../../domain/services/token.service";
import { InvalidRefreshTokenError } from "../../domain/errors/auth.errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken as verifyRefreshTokenJwt,
} from "../../../../shared/utils/jwt";

export class JwtTokenService implements ITokenService {
  generateTokenPair(userId: string): TokenPair {
    return {
      accessToken: signAccessToken({ sub: userId }),
      refreshToken: signRefreshToken({ sub: userId }),
    };
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const payload = verifyRefreshTokenJwt(token);
      return { userId: payload.sub };
    } catch {
      throw new InvalidRefreshTokenError();
    }
  }

  // Refresh tokens are stored hashed (like passwords) so a leaked database
  // dump doesn't hand out reusable session tokens.
  //
  // bcrypt is intentionally NOT used here: bcrypt silently truncates its
  // input to 72 bytes, but a JWT refresh token is far longer than that —
  // every token would hash to the same value, defeating rotation/reuse
  // detection entirely. Refresh tokens are already high-entropy secrets
  // (unlike user passwords), so a plain SHA-256 digest compared in
  // constant time is the correct, standard approach (the same pattern used
  // for API key storage).
  hashRefreshToken(token: string): Promise<string> {
    return Promise.resolve(createHash("sha256").update(token).digest("hex"));
  }

  compareRefreshToken(token: string, hash: string): Promise<boolean> {
    const candidate = createHash("sha256").update(token).digest();
    const stored = Buffer.from(hash, "hex");

    if (candidate.length !== stored.length) {
      return Promise.resolve(false);
    }
    return Promise.resolve(timingSafeEqual(candidate, stored));
  }
}
