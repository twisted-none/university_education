// lib/screens/cart_screen.dart
import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../theme/text_styles.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // В реальном приложении здесь будет логика отображения товаров и итоговой суммы
    return Scaffold(
      appBar: AppBar(
        title: const Text('Корзина', style: AppTextStyles.title),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textLight,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.shopping_cart,
                size: 80,
                color: AppColors.primary,
              ),
              const SizedBox(height: 20),
              Text(
                'Ваша корзина пуста', // Заглушка, если товаров нет
                style: AppTextStyles.title.copyWith(color: AppColors.textDark),
              ),
              const SizedBox(height: 10),
              Text(
                'Добавьте товары, чтобы увидеть список и сумму.',
                style: AppTextStyles.body,
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              // Заглушка для кнопки "Оформить заказ"
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    textStyle: AppTextStyles.subtitle.copyWith(
                      color: AppColors.textLight,
                    ),
                  ),
                  child: const Text('Оформить заказ (Сумма: 0.00 ₽)'),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
