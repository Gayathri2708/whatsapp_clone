import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/auth/presentation/providers/auth_state.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';

/// Refreshes the router whenever [AuthState] changes, so [_redirect] is
/// re-evaluated on login/logout/session-expiry without manual navigation calls.
class _AuthRefreshNotifier extends ChangeNotifier {
  _AuthRefreshNotifier(Ref ref) {
    ref.listen<AuthState>(authControllerProvider, (_, _) => notifyListeners());
  }
}

final Provider<GoRouter> appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthRefreshNotifier(ref),
    redirect: (context, state) => _redirect(ref, state),
    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
    ],
  );
});

String? _redirect(Ref ref, GoRouterState state) {
  final authState = ref.read(authControllerProvider);
  final location = state.matchedLocation;
  final isAuthRoute = location == '/login' || location == '/register';

  switch (authState) {
    case AuthInitial():
      // Stay on splash until the startup session check finishes.
      return location == '/' ? null : '/';
    case AuthLoading():
      // Mid login/register request — don't redirect away from the form.
      return null;
    case AuthAuthenticated():
      return (location == '/' || isAuthRoute) ? '/home' : null;
    case AuthUnauthenticated():
    case AuthError():
      return (location == '/' || !isAuthRoute) ? '/login' : null;
  }
}
