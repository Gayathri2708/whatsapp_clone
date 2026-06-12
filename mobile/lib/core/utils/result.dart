import '../error/failure.dart';

/// A lightweight `Either`-style type for repository return values, using
/// Dart 3 sealed classes + pattern matching instead of pulling in a
/// functional-programming package like `dartz` for two cases.
///
/// Usage:
/// ```dart
/// final result = await authRepository.login(email, password);
/// switch (result) {
///   case Ok(:final value): // success path
///   case Err(:final failure): // error path
/// }
/// ```
sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  final T value;

  const Ok(this.value);
}

final class Err<T> extends Result<T> {
  final Failure failure;

  const Err(this.failure);
}
