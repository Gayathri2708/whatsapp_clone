import 'auth_tokens_model.dart';
import 'user_model.dart';

/// Maps the `{ user, tokens }` shape returned by `/auth/register` and
/// `/auth/login`.
class AuthResponseModel {
  final UserModel user;
  final AuthTokensModel tokens;

  const AuthResponseModel({required this.user, required this.tokens});

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      tokens: AuthTokensModel.fromJson(json['tokens'] as Map<String, dynamic>),
    );
  }
}
