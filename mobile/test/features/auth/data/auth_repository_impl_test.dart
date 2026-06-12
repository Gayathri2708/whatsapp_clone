import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:whatsapp_clone/core/constants/storage_keys.dart';
import 'package:whatsapp_clone/core/error/exceptions.dart';
import 'package:whatsapp_clone/core/error/failure.dart';
import 'package:whatsapp_clone/core/utils/result.dart';
import 'package:whatsapp_clone/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:whatsapp_clone/features/auth/data/models/auth_response_model.dart';
import 'package:whatsapp_clone/features/auth/data/models/auth_tokens_model.dart';
import 'package:whatsapp_clone/features/auth/data/models/user_model.dart';
import 'package:whatsapp_clone/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:whatsapp_clone/features/auth/domain/entities/user.dart';

class MockAuthRemoteDataSource extends Mock implements AuthRemoteDataSource {}

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late MockAuthRemoteDataSource remoteDataSource;
  late MockFlutterSecureStorage secureStorage;
  late AuthRepositoryImpl repository;

  final user = UserModel(id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: DateTime(2024, 1, 1));
  const tokens = AuthTokensModel(accessToken: 'access-token', refreshToken: 'refresh-token');
  final authResponse = AuthResponseModel(user: user, tokens: tokens);

  setUp(() {
    remoteDataSource = MockAuthRemoteDataSource();
    secureStorage = MockFlutterSecureStorage();
    repository = AuthRepositoryImpl(remoteDataSource: remoteDataSource, secureStorage: secureStorage);

    when(
      () => secureStorage.write(key: any(named: 'key'), value: any(named: 'value')),
    ).thenAnswer((_) async {});
    when(() => secureStorage.delete(key: any(named: 'key'))).thenAnswer((_) async {});
  });

  group('login', () {
    test('persists tokens and returns the user on success', () async {
      when(
        () => remoteDataSource.login(email: any(named: 'email'), password: any(named: 'password')),
      ).thenAnswer((_) async => authResponse);

      final result = await repository.login(email: 'ada@example.com', password: 'password123');

      expect(result, isA<Ok<User>>());
      expect((result as Ok<User>).value.email, 'ada@example.com');
      verify(() => secureStorage.write(key: StorageKeys.accessToken, value: 'access-token')).called(1);
      verify(() => secureStorage.write(key: StorageKeys.refreshToken, value: 'refresh-token')).called(1);
    });

    test('maps UnauthorizedException to UnauthorizedFailure without persisting tokens', () async {
      when(
        () => remoteDataSource.login(email: any(named: 'email'), password: any(named: 'password')),
      ).thenThrow(const UnauthorizedException('Invalid email or password'));

      final result = await repository.login(email: 'ada@example.com', password: 'wrong-password');

      expect(result, isA<Err<User>>());
      expect((result as Err<User>).failure, isA<UnauthorizedFailure>());
      verifyNever(() => secureStorage.write(key: any(named: 'key'), value: any(named: 'value')));
    });

    test('maps ValidationException to ValidationFailure with field errors', () async {
      when(() => remoteDataSource.login(email: any(named: 'email'), password: any(named: 'password'))).thenThrow(
        const ValidationException(
          'Validation failed',
          fieldErrors: {
            'email': ['Invalid email address'],
          },
        ),
      );

      final result = await repository.login(email: 'not-an-email', password: 'password123');

      final failure = (result as Err<User>).failure as ValidationFailure;
      expect(failure.fieldErrors, {
        'email': ['Invalid email address'],
      });
    });

    test('maps NetworkException to NetworkFailure', () async {
      when(
        () => remoteDataSource.login(email: any(named: 'email'), password: any(named: 'password')),
      ).thenThrow(const NetworkException('Could not reach the server. Check your connection.'));

      final result = await repository.login(email: 'ada@example.com', password: 'password123');

      expect((result as Err<User>).failure, isA<NetworkFailure>());
    });
  });

  group('hasStoredSession', () {
    test('returns true when an access token is stored', () async {
      when(() => secureStorage.read(key: StorageKeys.accessToken)).thenAnswer((_) async => 'access-token');

      expect(await repository.hasStoredSession(), isTrue);
    });

    test('returns false when no access token is stored', () async {
      when(() => secureStorage.read(key: StorageKeys.accessToken)).thenAnswer((_) async => null);

      expect(await repository.hasStoredSession(), isFalse);
    });
  });

  group('logout', () {
    test('clears stored tokens', () async {
      await repository.logout();

      verify(() => secureStorage.delete(key: StorageKeys.accessToken)).called(1);
      verify(() => secureStorage.delete(key: StorageKeys.refreshToken)).called(1);
    });
  });
}
