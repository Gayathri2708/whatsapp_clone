/// Centralizes the backend's base URL so it's defined exactly once.
///
/// Override at build/run time with:
///   flutter run --dart-define=API_BASE_URL=http://192.168.1.50:4000/api/v1
///
/// Defaults assume the backend (`/backend`) is running locally on port 4000:
///  - Android emulator: 10.0.2.2 maps to the host machine's localhost.
///  - iOS simulator / web / desktop: localhost works directly.
class ApiConstants {
  const ApiConstants._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api/v1',
  );

  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String me = '/users/me';

  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);
}
