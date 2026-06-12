import { User } from "../entities/user.entity";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

/**
 * Port (in the hexagonal-architecture sense) that the application layer
 * depends on. The Mongoose-backed implementation lives in
 * `infrastructure/repositories/mongo-user.repository.ts`. Use cases never
 * import Mongoose directly — they only know this interface, which makes
 * them trivial to unit test with an in-memory fake.
 */
export interface IUserRepository {
  create(input: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void>;
}
