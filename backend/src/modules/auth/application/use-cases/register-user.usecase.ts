import { IUserRepository } from "../../domain/repositories/user.repository";
import { IPasswordHasher } from "../../domain/services/password-hasher";
import { ITokenService, TokenPair } from "../../domain/services/token.service";
import { EmailAlreadyInUseError } from "../../domain/errors/auth.errors";
import { toUserProfile, UserProfile } from "../../domain/entities/user.entity";
import { RegisterInput } from "../dtos/auth.dto";

export interface AuthResult {
  user: UserProfile;
  tokens: TokenPair;
}

/**
 * Application-layer use case: orchestrates domain rules and ports for
 * registering a new account. Has zero knowledge of Express or Mongoose —
 * it only depends on the interfaces (ports) defined in `domain/`, which is
 * what makes it independently unit-testable.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyInUseError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const tokens = this.tokenService.generateTokenPair(user.id);
    const refreshTokenHash = await this.tokenService.hashRefreshToken(tokens.refreshToken);
    await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return { user: toUserProfile(user), tokens };
  }
}
