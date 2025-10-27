// lib/main.dart
import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/product_screen.dart';
import 'screens/cart_screen.dart'; // <--- Импорт CartScreen
import 'theme/colors.dart';

void main() {
  runApp(const MadShopApp());
}

class MadShopApp extends StatelessWidget {
  const MadShopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MAD Shopp UI',
      theme: ThemeData(
        // Единый стиль приложения
        primaryColor: AppColors.primary,
        useMaterial3: true,
        // Настройка стилей для ElevatedButton
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.textLight,
          ),
        ),
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: AppColors.primary,
          secondary: AppColors.accent,
        ),
        scaffoldBackgroundColor: AppColors.background,
      ),
      // Настройка именованных маршрутов
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/cart': (context) => const CartScreen(), // <--- Регистрация маршрута
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/product') {
          // Здесь можно было бы обработать передачу аргументов, если бы это был именованный маршрут.
        }
        return null;
      },
    );
  }
}
