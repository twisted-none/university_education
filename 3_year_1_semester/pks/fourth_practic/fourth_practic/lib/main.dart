import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

// Главный виджет, который запускает приложение
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Практика №4: Счетчик',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const CounterScreen(), // Используем StatefulWidget для экрана
    );
  }
}

// StatefulWidget для управления состоянием счетчика
class CounterScreen extends StatefulWidget {
  const CounterScreen({super.key});

  @override
  State<CounterScreen> createState() => _CounterScreenState();
}

// Класс состояния для CounterScreen
class _CounterScreenState extends State<CounterScreen> {
  // Переменная состояния
  int _counter = 0; //

  // Метод для увеличения счетчика на 1 (обычное нажатие)
  void _incrementCounter() {
    setState(() {
      //
      _counter++; //
    });
  }

  // Метод для увеличения счетчика на 10 (долгое нажатие)
  void _incrementCounterLongPress() {
    setState(() {
      //
      _counter += 10;
    });
  }

  // Метод для сброса счетчика
  void _resetCounter() {
    setState(() {
      //
      _counter = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Практика №4'), //
        backgroundColor: Colors.blueGrey,
      ),
      body: Center(
        // Используем Column для вертикального расположения элементов
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // Текст, отображающий текущее значение счетчика
            Text(
              'Значение счётчика: $_counter', //
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 30), // Отступ
            // Кнопка "Увеличить"
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0), // Отступ
              child: Container(
                color: Colors.lightGreen.shade100, // Контейнер с фоном
                padding: const EdgeInsets.all(4.0),
                child: ElevatedButton(
                  onPressed: _incrementCounter, // Обычное нажатие (+1)
                  onLongPress:
                      _incrementCounterLongPress, // Долгое нажатие (+10)
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 15,
                    ),
                    textStyle: const TextStyle(fontSize: 18),
                  ),
                  child: const Text('Увеличить'), //
                ),
              ),
            ),

            const SizedBox(height: 10), // Отступ
            // Кнопка "Сбросить"
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0), // Отступ
              child: Container(
                color: Colors.red.shade100, // Контейнер с другим фоном
                padding: const EdgeInsets.all(4.0),
                child: ElevatedButton(
                  onPressed: _resetCounter, // Нажатие (сброс)
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 15,
                    ),
                    textStyle: const TextStyle(fontSize: 18),
                  ),
                  child: const Text('Сбросить'), //
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
