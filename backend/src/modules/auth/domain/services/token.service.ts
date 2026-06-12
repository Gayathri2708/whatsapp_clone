export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Port for issuing and validating the JWT pair used by the auth feature.
 * The JWT-based implementation lives in
 * `infrastructure/services/jwt-token.service.ts`.
 */
export interface ITokenService {
  generateTokenPair(userId: string): TokenPair;

  /** Throws InvalidRefreshTokenError if the token is malformed or expired. */
  verifyRefreshToken(token: string): { userId: string };

  hashRefreshToken(token: string): Promise<string>;
  compareRefreshToken(token: string, hash: string): Promise<boolean>;
}
