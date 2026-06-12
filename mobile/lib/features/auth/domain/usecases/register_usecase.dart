import '../../../../core/utils/result.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Encapsulates the "register a new account" business action. Use cases are
/// thin here, but having one per action keeps the presentation layer
/// (`AuthController`) focused on state management rather than orchestration,
/// and gives each action an isolated unit-test surface.
class RegisterUseCase {
  final AuthRepository _repository;

  const RegisterUseCase(this._repository);

  Future<Result<User>> call({required String name, required String email, required String password}) {
    return _repository.register(name: name, email: email, password: password);
  }
}
