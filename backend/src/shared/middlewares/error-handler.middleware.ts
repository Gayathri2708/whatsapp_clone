import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors/app-error";
import { logger } from "../../config/logger";

/**
 * Central error-handling middleware. Must be registered last, after all
 * routes. Express recognizes this as an error handler because it declares
 * four parameters.
 *
 * - Known, operational errors (`AppError` subclasses) are returned to the
 *   client with their own status code and message.
 * - Zod validation errors are converted into a 400 `ValidationError` shape.
 * - Anything else is logged with full detail and returned as a generic 500
 *   so internal details never leak to clients.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const validationError = new ValidationError("Validation failed", err.flatten());
    res.status(validationError.statusCode).json({
      success: false,
      message: validationError.message,
      details: validationError.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
    });
    return;
  }

  logger.error(err instanceof Error ? err : new Error(String(err)));

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
