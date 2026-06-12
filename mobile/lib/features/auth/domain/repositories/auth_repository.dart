import '../../../../core/utils/result.dart';
import '../entities/user.dart';

/// Port that the application/presentation layers depend on. The Dio +
/// secure-storage backed implementation lives in
/// `data/repositories/auth_repository_impl.dart`.
abstract interface class AuthRepository {
  Future<Result<User>> register({required String name, required String email, required String password});

  Future<Result<User>> login({required String email, required String password});

  /// Fetches the current user's profile using the stored access token.
  /// Returns [UnauthorizedFailure] if there's no valid session.
  Future<Result<User>> getCurrentUser();

  /// True if an access or refresh token is stored locally. Does not
  /// guarantee the token is still valid server-side — `getCurrentUser()`
  /// is the source of truth for that.
  Future<bool> hasStoredSession();

  Future<void> logout();
}
