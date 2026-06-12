/// Maps the `{ accessToken, refreshToken }` pair returned by
/// `/auth/register`, `/auth/login`, and `/auth/refresh`.
class AuthTokensModel {
  final String accessToken;
  final String refreshToken;

  const AuthTokensModel({required this.accessToken, required this.refreshToken});

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    return AuthTokensModel(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }
}
