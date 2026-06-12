import { AppError } from "../../../shared/errors/app-error";

/**
 * Raised when the upstream AI provider fails (rate limit, network error,
 * malformed response that fails schema validation, etc.). Mapped to 502
 * since the failure is in a downstream dependency, not the client's
 * request.
 */
export class AIProviderError extends AppError {
  readonly statusCode = 502;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
