import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/constants/storage_keys.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/auth_response_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final FlutterSecureStorage _secureStorage;

  const AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required FlutterSecureStorage secureStorage,
  }) : _remoteDataSource = remoteDataSource,
       _secureStorage = secureStorage;

  @override
  Future<Result<User>> register({required String name, required String email, required String password}) {
    return _authenticate(() => _remoteDataSource.register(name: name, email: email, password: password));
  }

  @override
  Future<Result<User>> login({required String email, required String password}) {
    return _authenticate(() => _remoteDataSource.login(email: email, password: password));
  }

  /// Shared by register/login: both return `{ user, tokens }` and both
  /// need to persist the tokens on success.
  Future<Result<User>> _authenticate(Future<AuthResponseModel> Function() call) async {
    try {
      final response = await call();
      await _persistTokens(response.tokens.accessToken, response.tokens.refreshToken);
      return Ok(response.user);
    } on ValidationException catch (e) {
      return Err(ValidationFailure(e.message, fieldErrors: e.fieldErrors));
    } on UnauthorizedException catch (e) {
      return Err(UnauthorizedFailure(e.message));
    } on ServerException catch (e) {
      return Err(ServerFailure(e.message));
    } on NetworkException catch (e) {
      return Err(NetworkFailure(e.message));
    }
  }

  @override
  Future<Result<User>> getCurrentUser() async {
    try {
      final user = await _remoteDataSource.getCurrentUser();
      return Ok(user);
    } on ValidationException catch (e) {
      return Err(ValidationFailure(e.message, fieldErrors: e.fieldErrors));
    } on UnauthorizedException catch (e) {
      return Err(UnauthorizedFailure(e.message));
    } on ServerException catch (e) {
      return Err(ServerFailure(e.message));
    } on NetworkException catch (e) {
      return Err(NetworkFailure(e.message));
    }
  }

  @override
  Future<bool> hasStoredSession() async {
    final accessToken = await _secureStorage.read(key: StorageKeys.accessToken);
    return accessToken != null;
  }

  @override
  Future<void> logout() async {
    await _secureStorage.delete(key: StorageKeys.accessToken);
    await _secureStorage.delete(key: StorageKeys.refreshToken);
  }

  Future<void> _persistTokens(String accessToken, String refreshToken) async {
    await _secureStorage.write(key: StorageKeys.accessToken, value: accessToken);
    await _secureStorage.write(key: StorageKeys.refreshToken, value: refreshToken);
  }
}
