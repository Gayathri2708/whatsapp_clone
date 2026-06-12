/**
 * The User as understood by the domain/application layers — independent of
 * how it's persisted (MongoDB/Mongoose is an infrastructure detail).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The subset of a User that's safe to send to clients — never includes
 * password or token hashes.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
