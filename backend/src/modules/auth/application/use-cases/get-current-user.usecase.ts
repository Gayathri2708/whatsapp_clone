import { IUserRepository } from "../../domain/repositories/user.repository";
import { toUserProfile, UserProfile } from "../../domain/entities/user.entity";
import { NotFoundError } from "../../../../shared/errors/app-error";

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toUserProfile(user);
  }
}
