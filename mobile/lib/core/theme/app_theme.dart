import 'package:flutter/material.dart';

/// Centralized Material 3 theme. Keeping colors/typography here means
/// screens never hardcode a `Color(0xFF...)` — they reference
/// `Theme.of(context)` so the whole app can be re-themed in one place.
class AppTheme {
  const AppTheme._();

  static const Color seedColor = Color(0xFF128C7E); // WhatsApp teal-green

  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(seedColor: seedColor);

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: colorScheme.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        centerTitle: false,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        filled: true,
        fillColor: colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
      ),
    );
  }
}
