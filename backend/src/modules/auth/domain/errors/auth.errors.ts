import { ConflictError, UnauthorizedError } from "../../../../shared/errors/app-error";

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid email or password");
  }
}

export class EmailAlreadyInUseError extends ConflictError {
  constructor(email: string) {
    super(`An account with email "${email}" already exists`);
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super("Invalid or expired refresh token");
  }
}
