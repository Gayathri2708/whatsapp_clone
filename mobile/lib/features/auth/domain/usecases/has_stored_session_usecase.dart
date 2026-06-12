import '../repositories/auth_repository.dart';

/// Local-only check (no network call) used at app startup to decide whether
/// it's worth attempting [GetCurrentUserUseCase] at all.
class HasStoredSessionUseCase {
  final AuthRepository _repository;

  const HasStoredSessionUseCase(this._repository);

  Future<bool> call() {
    return _repository.hasStoredSession();
  }
}
