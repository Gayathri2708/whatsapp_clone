/// The authenticated user as understood by the domain/presentation layers —
/// independent of the JSON shape the backend happens to return.
class User {
  final String id;
  final String name;
  final String email;
  final DateTime createdAt;

  const User({required this.id, required this.name, required this.email, required this.createdAt});
}
