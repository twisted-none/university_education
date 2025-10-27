// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../theme/text_styles.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Главный экран', style: AppTextStyles.title),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textLight,
      ),
      body: const Center(
        child: Text(
          'Здесь будет список товаров (GridView/ListView) ',
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
