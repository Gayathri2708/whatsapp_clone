/// Failures are what the data layer's exceptions get translated into before
/// crossing into the domain/presentation layers. Presentation code matches
/// on these (via the sealed class) to decide what to show the user, without
/// ever needing to know about Dio, HTTP status codes, etc.
sealed class Failure {
  final String message;

  const Failure(this.message);
}

/// The backend returned a structured error (4xx/5xx with a JSON body).
class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

/// Request failed validation (400) — [fieldErrors] mirrors the backend's
/// Zod `flatten()` shape so forms can highlight specific fields.
class ValidationFailure extends Failure {
  final Map<String, List<String>>? fieldErrors;

  const ValidationFailure(super.message, {this.fieldErrors});
}

/// 401 — invalid credentials, or an access/refresh token that's invalid or
/// expired and couldn't be refreshed.
class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(super.message);
}

/// No connectivity, DNS failure, timeout, etc.
class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

/// Anything that doesn't fit the above (unexpected response shape, etc.).
class UnknownFailure extends Failure {
  const UnknownFailure(super.message);
}
