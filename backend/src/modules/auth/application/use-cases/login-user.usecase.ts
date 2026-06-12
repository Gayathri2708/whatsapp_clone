import { IUserRepository } from "../../domain/repositories/user.repository";
import { IPasswordHasher } from "../../domain/services/password-hasher";
import { ITokenService } from "../../domain/services/token.service";
import { InvalidCredentialsError } from "../../domain/errors/auth.errors";
import { toUserProfile } from "../../domain/entities/user.entity";
import { LoginInput } from "../dtos/auth.dto";
import { AuthResult } from "./register-user.usecase";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const tokens = this.tokenService.generateTokenPair(user.id);
    const refreshTokenHash = await this.tokenService.hashRefreshToken(tokens.refreshToken);
    await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return { user: toUserProfile(user), tokens };
  }
}
