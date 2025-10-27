// lib/theme/text_styles.dart
import 'package:flutter/material.dart';
import 'colors.dart';

// Вынос стилей текста
class AppTextStyles {
  static const TextStyle title = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textDark,
  ); // [cite: 215, 216, 217]

  static const TextStyle subtitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textDark,
  );

  static const TextStyle body = TextStyle(
    fontSize: 14,
    color: AppColors.textDark,
  );
}
