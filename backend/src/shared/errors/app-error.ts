/**
 * Base class for all errors that are anticipated and handled deliberately
 * (as opposed to programming bugs / unexpected exceptions).
 *
 * The central error-handling middleware checks `isOperational` to decide
 * whether to return the error's own message to the client (safe, expected
 * errors) or a generic 500 message (unexpected/internal errors).
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;

  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;

  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;

  constructor(message = "Forbidden") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;

  constructor(message = "Resource not found") {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}
