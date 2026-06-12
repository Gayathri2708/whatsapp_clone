import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

/// Talks to the `/auth/*` and `/users/me` endpoints. Throws the
/// `core/error/exceptions.dart` types (never raw [DioException]) so the
/// repository doesn't need to know about Dio at all.
abstract interface class AuthRemoteDataSource {
  Future<AuthResponseModel> register({required String name, required String email, required String password});

  Future<AuthResponseModel> login({required String email, required String password});

  Future<UserModel> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio _dio;

  const AuthRemoteDataSourceImpl(this._dio);

  @override
  Future<AuthResponseModel> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.register,
        data: {'name': name, 'email': email, 'password': password},
      );
      return AuthResponseModel.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<AuthResponseModel> login({required String email, required String password}) async {
    try {
      final response = await _dio.post(ApiConstants.login, data: {'email': email, 'password': password});
      return AuthResponseModel.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await _dio.get(ApiConstants.me);
      return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
