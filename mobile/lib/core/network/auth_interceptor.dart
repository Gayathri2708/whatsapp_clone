import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/api_constants.dart';
import '../constants/storage_keys.dart';

/// Attaches the stored access token to outgoing requests and transparently
/// refreshes it on a 401 response, retrying the original request once.
///
/// If the refresh itself fails (refresh token invalid/expired), stored
/// tokens are cleared and [onSessionExpired] is invoked so the app can
/// redirect to the login screen — without this interceptor needing to know
/// anything about Riverpod or routing.
class AuthInterceptor extends Interceptor {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;
  final void Function() onSessionExpired;

  /// A separate Dio instance with no interceptors, used only for the
  /// `/auth/refresh` call — avoids attaching a stale access token and
  /// avoids recursive interception if the refresh call itself 401s.
  final Dio _refreshDio;

  AuthInterceptor({
    required Dio dio,
    required FlutterSecureStorage secureStorage,
    required this.onSessionExpired,
  }) : _dio = dio,
       _secureStorage = secureStorage,
       _refreshDio = Dio(
         BaseOptions(
           baseUrl: ApiConstants.baseUrl,
           connectTimeout: ApiConstants.connectTimeout,
           receiveTimeout: ApiConstants.receiveTimeout,
         ),
       );

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final accessToken = await _secureStorage.read(key: StorageKeys.accessToken);
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final isUnauthorized = err.response?.statusCode == 401;
    final alreadyRetried = err.requestOptions.extra['retried'] == true;

    if (!isUnauthorized || alreadyRetried) {
      handler.next(err);
      return;
    }

    final refreshToken = await _secureStorage.read(key: StorageKeys.refreshToken);
    if (refreshToken == null) {
      await _clearSession();
      handler.next(err);
      return;
    }

    try {
      final response = await _refreshDio.post(
        ApiConstants.refresh,
        data: {'refreshToken': refreshToken},
      );

      final tokens = response.data['data'] as Map<String, dynamic>;
      await _secureStorage.write(key: StorageKeys.accessToken, value: tokens['accessToken'] as String);
      await _secureStorage.write(
        key: StorageKeys.refreshToken,
        value: tokens['refreshToken'] as String,
      );

      final retryOptions = err.requestOptions
        ..headers['Authorization'] = 'Bearer ${tokens['accessToken']}'
        ..extra['retried'] = true;

      final retryResponse = await _dio.fetch(retryOptions);
      handler.resolve(retryResponse);
    } on DioException {
      await _clearSession();
      handler.next(err);
    }
  }

  Future<void> _clearSession() async {
    await _secureStorage.delete(key: StorageKeys.accessToken);
    await _secureStorage.delete(key: StorageKeys.refreshToken);
    onSessionExpired();
  }
}
