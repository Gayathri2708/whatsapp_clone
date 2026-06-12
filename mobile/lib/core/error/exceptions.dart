/// Exceptions thrown by the data layer (data sources). Repositories catch
/// these and translate them into [Failure]s for the rest of the app.
library;

class ServerException implements Exception {
  final String message;

  const ServerException(this.message);
}

class ValidationException implements Exception {
  final String message;
  final Map<String, List<String>>? fieldErrors;

  const ValidationException(this.message, {this.fieldErrors});
}

class UnauthorizedException implements Exception {
  final String message;

  const UnauthorizedException(this.message);
}

class NetworkException implements Exception {
  final String message;

  const NetworkException(this.message);
}
