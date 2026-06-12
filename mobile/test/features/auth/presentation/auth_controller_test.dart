import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:whatsapp_clone/core/error/failure.dart';
import 'package:whatsapp_clone/core/utils/result.dart';
import 'package:whatsapp_clone/features/auth/domain/entities/user.dart';
import 'package:whatsapp_clone/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:whatsapp_clone/features/auth/domain/usecases/has_stored_session_usecase.dart';
import 'package:whatsapp_clone/features/auth/domain/usecases/login_usecase.dart';
import 'package:whatsapp_clone/features/auth/domain/usecases/logout_usecase.dart';
import 'package:whatsapp_clone/features/auth/domain/usecases/register_usecase.dart';
import 'package:whatsapp_clone/features/auth/presentation/providers/auth_controller.dart';
import 'package:whatsapp_clone/features/auth/presentation/providers/auth_state.dart';

class MockRegisterUseCase extends Mock implements RegisterUseCase {}

class MockLoginUseCase extends Mock implements LoginUseCase {}

class MockGetCurrentUserUseCase extends Mock implements GetCurrentUserUseCase {}

class MockLogoutUseCase extends Mock implements LogoutUseCase {}

class MockHasStoredSessionUseCase extends Mock implements HasStoredSessionUseCase {}

void main() {
  late MockRegisterUseCase registerUseCase;
  late MockLoginUseCase loginUseCase;
  late MockGetCurrentUserUseCase getCurrentUserUseCase;
  late MockLogoutUseCase logoutUseCase;
  late MockHasStoredSessionUseCase hasStoredSessionUseCase;

  final user = User(id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: DateTime(2024, 1, 1));

  setUp(() {
    registerUseCase = MockRegisterUseCase();
    loginUseCase = MockLoginUseCase();
    getCurrentUserUseCase = MockGetCurrentUserUseCase();
    logoutUseCase = MockLogoutUseCase();
    hasStoredSessionUseCase = MockHasStoredSessionUseCase();

    when(() => logoutUseCase()).thenAnswer((_) async {});
  });

  AuthController buildController() {
    return AuthController(
      registerUseCase: registerUseCase,
      loginUseCase: loginUseCase,
      getCurrentUserUseCase: getCurrentUserUseCase,
      logoutUseCase: logoutUseCase,
      hasStoredSessionUseCase: hasStoredSessionUseCase,
    );
  }

  group('checkAuthStatus (run on construction)', () {
    test('is unauthenticated when there is no stored session', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => false);

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);

      expect(controller.state, isA<AuthUnauthenticated>());
      verifyNever(() => getCurrentUserUseCase());
    });

    test('is authenticated when the stored session is still valid', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => true);
      when(() => getCurrentUserUseCase()).thenAnswer((_) async => Ok(user));

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);

      expect(controller.state, isA<AuthAuthenticated>());
      expect((controller.state as AuthAuthenticated).user, user);
    });

    test('logs out and is unauthenticated when the stored session is invalid', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => true);
      when(() => getCurrentUserUseCase()).thenAnswer((_) async => const Err(UnauthorizedFailure('Unauthorized')));

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);

      expect(controller.state, isA<AuthUnauthenticated>());
      verify(() => logoutUseCase()).called(1);
    });
  });

  group('login', () {
    test('transitions through loading to authenticated on success', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => false);
      when(
        () => loginUseCase(email: any(named: 'email'), password: any(named: 'password')),
      ).thenAnswer((_) async => Ok(user));

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);

      final loginFuture = controller.login(email: 'ada@example.com', password: 'password123');
      expect(controller.state, isA<AuthLoading>());

      await loginFuture;
      expect(controller.state, isA<AuthAuthenticated>());
    });

    test('transitions to AuthError with the failure on invalid credentials', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => false);
      when(() => loginUseCase(email: any(named: 'email'), password: any(named: 'password'))).thenAnswer(
        (_) async => const Err(UnauthorizedFailure('Invalid email or password')),
      );

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);

      await controller.login(email: 'ada@example.com', password: 'wrong-password');

      final state = controller.state;
      expect(state, isA<AuthError>());
      expect((state as AuthError).failure, isA<UnauthorizedFailure>());
    });
  });

  group('logout', () {
    test('calls the use case and becomes unauthenticated', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => true);
      when(() => getCurrentUserUseCase()).thenAnswer((_) async => Ok(user));

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);
      expect(controller.state, isA<AuthAuthenticated>());

      await controller.logout();

      expect(controller.state, isA<AuthUnauthenticated>());
      verify(() => logoutUseCase()).called(1);
    });
  });

  group('handleSessionExpired', () {
    test('drops an authenticated user back to unauthenticated', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => true);
      when(() => getCurrentUserUseCase()).thenAnswer((_) async => Ok(user));

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);
      expect(controller.state, isA<AuthAuthenticated>());

      controller.handleSessionExpired();

      expect(controller.state, isA<AuthUnauthenticated>());
    });

    test('does nothing when not authenticated', () async {
      when(() => hasStoredSessionUseCase()).thenAnswer((_) async => false);

      final controller = buildController();
      await Future<void>.delayed(Duration.zero);
      expect(controller.state, isA<AuthUnauthenticated>());

      controller.handleSessionExpired();

      expect(controller.state, isA<AuthUnauthenticated>());
    });
  });
}
