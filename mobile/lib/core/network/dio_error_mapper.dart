import 'package:dio/dio.dart';

import '../error/exceptions.dart';

/// Translates a [DioException] into one of our domain [Exception] types
/// based on the backend's error response shape:
/// `{ success: false, message, details?: { fieldErrors, formErrors } }`
/// (see backend `errorHandler` middleware).
///
/// Centralizing this means every data source handles errors identically
/// without duplicating status-code checks.
Exception mapDioException(DioException error) {
  switch (error.type) {
    case DioExceptionType.connectionError:
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.sendTimeout:
      return const NetworkException('Could not reach the server. Check your connection.');
    default:
      break;
  }

  final response = error.response;
  if (response == null) {
    return NetworkException(error.message ?? 'Unexpected network error');
  }

  final body = response.data;
  final message = (body is Map && body['message'] is String)
      ? body['message'] as String
      : 'Something went wrong';

  switch (response.statusCode) {
    case 400:
      Map<String, List<String>>? fieldErrors;
      if (body is Map && body['details'] is Map && body['details']['fieldErrors'] is Map) {
        final raw = body['details']['fieldErrors'] as Map;
        fieldErrors = raw.map(
          (key, value) => MapEntry(key as String, (value as List).map((e) => e.toString()).toList()),
        );
      }
      return ValidationException(message, fieldErrors: fieldErrors);
    case 401:
      return UnauthorizedException(message);
    default:
      return ServerException(message);
  }
}
