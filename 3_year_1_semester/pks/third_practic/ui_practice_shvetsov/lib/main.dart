import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Практика №3',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromARGB(255, 0, 0, 0),
        ),
      ),
      home: const MyHomePage(title: 'Швецов UI Test Практика №3'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 205, 241, 75),
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Какой-то текст",
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.w500,
                color: const Color.fromARGB(255, 108, 201, 32),
              ),
            ),
            ElevatedButton(
              onPressed: () {},
              child: Text(
                "Я кнопка",
                style: TextStyle(
                  fontSize: 50,
                  fontWeight: FontWeight.bold,
                  color: const Color.fromARGB(255, 211, 41, 106),
                ),
              ),
            ),
            Container(
              padding: EdgeInsets.all(16),
              color: const Color.fromARGB(255, 13, 187, 187),
              width: 200,
              height: 300,
              child: Text("Я контейнер!!!"),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Icon(Icons.access_alarm_outlined),
                SizedBox(width: 30),
                Icon(Icons.access_time, color: Colors.yellow),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
