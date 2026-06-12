import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/has_stored_session_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import 'auth_controller.dart';
import 'auth_state.dart';

final Provider<FlutterSecureStorage> secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// The single [Dio] instance used for all API calls. [onSessionExpired] is a
/// closure read lazily (not watched) so this provider doesn't create a
/// circular dependency with [authControllerProvider] — it's only invoked
/// later, when a refresh actually fails.
final Provider<Dio> dioProvider = Provider<Dio>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return createDio(
    secureStorage: secureStorage,
    onSessionExpired: () => ref.read(authControllerProvider.notifier).handleSessionExpired(),
  );
});

final Provider<AuthRemoteDataSource> authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(ref.watch(dioProvider));
});

final Provider<AuthRepository> authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    secureStorage: ref.watch(secureStorageProvider),
  );
});

final Provider<RegisterUseCase> registerUseCaseProvider = Provider<RegisterUseCase>((ref) {
  return RegisterUseCase(ref.watch(authRepositoryProvider));
});

final Provider<LoginUseCase> loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return LoginUseCase(ref.watch(authRepositoryProvider));
});

final Provider<GetCurrentUserUseCase> getCurrentUserUseCaseProvider = Provider<GetCurrentUserUseCase>((ref) {
  return GetCurrentUserUseCase(ref.watch(authRepositoryProvider));
});

final Provider<LogoutUseCase> logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  return LogoutUseCase(ref.watch(authRepositoryProvider));
});

final Provider<HasStoredSessionUseCase> hasStoredSessionUseCaseProvider = Provider<HasStoredSessionUseCase>((ref) {
  return HasStoredSessionUseCase(ref.watch(authRepositoryProvider));
});

final StateNotifierProvider<AuthController, AuthState> authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(
    registerUseCase: ref.watch(registerUseCaseProvider),
    loginUseCase: ref.watch(loginUseCaseProvider),
    getCurrentUserUseCase: ref.watch(getCurrentUserUseCaseProvider),
    logoutUseCase: ref.watch(logoutUseCaseProvider),
    hasStoredSessionUseCase: ref.watch(hasStoredSessionUseCaseProvider),
  );
});
