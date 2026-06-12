import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/api_constants.dart';
import 'auth_interceptor.dart';

/// Builds the single [Dio] instance used for all authenticated API calls.
///
/// [onSessionExpired] is called when a refresh attempt fails (refresh
/// token invalid/expired) — the auth provider wires this up to log the
/// user out and let the router redirect to `/login`.
Dio createDio({required FlutterSecureStorage secureStorage, required void Function() onSessionExpired}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      contentType: 'application/json',
    ),
  );

  dio.interceptors.add(
    AuthInterceptor(dio: dio, secureStorage: secureStorage, onSessionExpired: onSessionExpired),
  );

  return dio;
}
