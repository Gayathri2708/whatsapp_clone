import { CreateUserInput, IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserDocument, UserModel } from "../models/user.model";

/**
 * Mongoose-backed implementation of IUserRepository. Translates between the
 * persistence model (Mongoose document) and the plain domain `User` entity
 * so the rest of the app never touches Mongoose types directly.
 */
export class MongoUserRepository implements IUserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const doc = await UserModel.create(input);
    return toDomain(doc);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash });
  }
}

function toDomain(doc: UserDocument): User {
  return {
    id: doc.id as string,
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    refreshTokenHash: doc.refreshTokenHash ?? null,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
  };
}
