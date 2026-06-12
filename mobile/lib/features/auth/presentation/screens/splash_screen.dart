import 'package:flutter/material.dart';

/// Shown briefly while [AuthController] runs its startup session check.
/// The router redirects away as soon as the state leaves [AuthInitial].
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
