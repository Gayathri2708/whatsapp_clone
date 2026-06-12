import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';
import '../providers/auth_state.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  /// Populated from a [ValidationFailure] returned by the backend, keyed by
  /// field name (matches the Zod `flatten().fieldErrors` shape).
  Map<String, List<String>> _fieldErrors = {};

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    setState(() => _fieldErrors = {});
    if (!_formKey.currentState!.validate()) return;
    ref.read(authControllerProvider.notifier).register(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      if (next is AuthError) {
        final failure = next.failure;
        if (failure is ValidationFailure && failure.fieldErrors != null) {
          setState(() => _fieldErrors = failure.fieldErrors!);
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(failure.message)));
      }
    });

    final authState = ref.watch(authControllerProvider);
    final isLoading = authState is AuthLoading;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Create an account',
                    style: Theme.of(context).textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  AppTextField(
                    controller: _nameController,
                    label: 'Name',
                    textInputAction: TextInputAction.next,
                    validator: (value) => _validateRequired(value, 'Name', _fieldErrors['name']),
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _emailController,
                    label: 'Email',
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    validator: (value) => _validateEmail(value, _fieldErrors['email']),
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _passwordController,
                    label: 'Password',
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    validator: (value) => _validatePassword(value, _fieldErrors['password']),
                  ),
                  const SizedBox(height: 24),
                  PrimaryButton(label: 'Sign up', isLoading: isLoading, onPressed: _submit),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: isLoading ? null : () => context.go('/login'),
                    child: const Text('Already have an account? Log in'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

String? _validateRequired(String? value, String label, List<String>? serverErrors) {
  if (serverErrors != null && serverErrors.isNotEmpty) return serverErrors.first;
  if (value == null || value.trim().isEmpty) return '$label is required';
  return null;
}

String? _validateEmail(String? value, List<String>? serverErrors) {
  if (serverErrors != null && serverErrors.isNotEmpty) return serverErrors.first;
  if (value == null || value.trim().isEmpty) return 'Email is required';
  if (!value.contains('@')) return 'Enter a valid email';
  return null;
}

String? _validatePassword(String? value, List<String>? serverErrors) {
  if (serverErrors != null && serverErrors.isNotEmpty) return serverErrors.first;
  if (value == null || value.isEmpty) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}
