import '../../../../core/error/failure.dart';
import '../../domain/entities/user.dart';

/// All possible states of the auth flow. The router and screens switch on
/// this (via pattern matching) instead of juggling separate
/// loading/error/data flags.
sealed class AuthState {
  const AuthState();
}

/// Before [AuthController] has finished its startup session check.
/// The router keeps the user on the splash screen while in this state.
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// A register/login request is in flight.
class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final User user;

  const AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// A register/login attempt failed. Carries the [Failure] so the screen can
/// show field-level errors (for [ValidationFailure]) or a generic message.
class AuthError extends AuthState {
  final Failure failure;

  const AuthError(this.failure);
}
