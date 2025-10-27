// lib/screens/product_screen.dart
import 'package:flutter/material.dart';

class ProductScreen extends StatelessWidget {
  final String productId;
  const ProductScreen({
    super.key,
    required this.productId,
  }); // Пример передачи данных

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Товар №$productId')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Здесь будет изображение, описание и цена '),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: null,
              child: Text('Добавить в корзину'), //
            ),
          ],
        ),
      ),
    );
  }
}
