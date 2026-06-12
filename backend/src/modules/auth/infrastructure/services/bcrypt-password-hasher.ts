import bcrypt from "bcrypt";
import { IPasswordHasher } from "../../domain/services/password-hasher";

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
