/**
 * Port for password hashing. The bcrypt-based implementation lives in
 * `infrastructure/services/bcrypt-password-hasher.ts`. Use cases depend on
 * this interface so the hashing algorithm can change (or be swapped for a
 * fast fake in tests) without touching application logic.
 */
export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
