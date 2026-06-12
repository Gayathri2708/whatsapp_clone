import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/result.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/has_stored_session_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import 'auth_state.dart';

/// Owns the app's auth session state. Screens call [register]/[login]/
/// [logout]; the router and splash screen watch [AuthState] to decide what
/// to show.
class AuthController extends StateNotifier<AuthState> {
  final RegisterUseCase _registerUseCase;
  final LoginUseCase _loginUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final LogoutUseCase _logoutUseCase;
  final HasStoredSessionUseCase _hasStoredSessionUseCase;

  AuthController({
    required RegisterUseCase registerUseCase,
    required LoginUseCase loginUseCase,
    required GetCurrentUserUseCase getCurrentUserUseCase,
    required LogoutUseCase logoutUseCase,
    required HasStoredSessionUseCase hasStoredSessionUseCase,
  }) : _registerUseCase = registerUseCase,
       _loginUseCase = loginUseCase,
       _getCurrentUserUseCase = getCurrentUserUseCase,
       _logoutUseCase = logoutUseCase,
       _hasStoredSessionUseCase = hasStoredSessionUseCase,
       super(const AuthInitial()) {
    checkAuthStatus();
  }

  /// Run once at startup. Avoids a network call entirely if there's no
  /// stored token; otherwise validates it against `/users/me`.
  Future<void> checkAuthStatus() async {
    final hasSession = await _hasStoredSessionUseCase();
    if (!hasSession) {
      state = const AuthUnauthenticated();
      return;
    }

    final result = await _getCurrentUserUseCase();
    switch (result) {
      case Ok(:final value):
        state = AuthAuthenticated(value);
      case Err():
        // Stored token is invalid/expired and couldn't be refreshed.
        await _logoutUseCase();
        state = const AuthUnauthenticated();
    }
  }

  Future<void> register({required String name, required String email, required String password}) async {
    state = const AuthLoading();
    final result = await _registerUseCase(name: name, email: email, password: password);
    state = switch (result) {
      Ok(:final value) => AuthAuthenticated(value),
      Err(:final failure) => AuthError(failure),
    };
  }

  Future<void> login({required String email, required String password}) async {
    state = const AuthLoading();
    final result = await _loginUseCase(email: email, password: password);
    state = switch (result) {
      Ok(:final value) => AuthAuthenticated(value),
      Err(:final failure) => AuthError(failure),
    };
  }

  Future<void> logout() async {
    await _logoutUseCase();
    state = const AuthUnauthenticated();
  }

  /// Called by [AuthInterceptor] (via [dioProvider]'s `onSessionExpired`)
  /// when a refresh attempt fails. Drops the user back to the login screen.
  void handleSessionExpired() {
    if (state is AuthAuthenticated) {
      state = const AuthUnauthenticated();
    }
  }
}
