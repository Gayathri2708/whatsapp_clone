import { IUserRepository } from "../../domain/repositories/user.repository";
import { ITokenService, TokenPair } from "../../domain/services/token.service";
import { InvalidRefreshTokenError } from "../../domain/errors/auth.errors";

/**
 * Implements refresh-token rotation: every successful refresh issues a new
 * refresh token and invalidates the old one (by overwriting the stored
 * hash). If a refresh token is reused after rotation, the hash comparison
 * fails and the request is rejected — limiting the damage of a leaked
 * refresh token.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    const { userId } = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new InvalidRefreshTokenError();
    }

    const matches = await this.tokenService.compareRefreshToken(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!matches) {
      throw new InvalidRefreshTokenError();
    }

    const tokens = this.tokenService.generateTokenPair(user.id);
    const newRefreshTokenHash = await this.tokenService.hashRefreshToken(tokens.refreshToken);
    await this.userRepository.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return tokens;
  }
}
