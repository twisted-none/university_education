// lib/main.dart
import 'package:flutter/material.dart';
import 'models/note.dart';
import 'edit_note_page.dart';

void main() => runApp(const SimpleNotesApp()); // [cite: 391]

class SimpleNotesApp extends StatelessWidget {
  const SimpleNotesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Simple Notes',
      theme: ThemeData(useMaterial3: true),
      home: const NotesPage(), // [cite: 399]
    );
  }
}

class NotesPage extends StatefulWidget {
  const NotesPage({super.key});

  @override
  State<NotesPage> createState() => _NotesPageState(); // [cite: 406]
}

class _NotesPageState extends State<NotesPage> {
  // Список заметок, хранящийся в состоянии виджета
  final List<Note> _notes = [
    Note(
      id: '1',
      title: 'Пример',
      body: 'Это пример заметки',
    ), // [cite: 409, 410, 411]
  ];

  // Метод для добавления заметки
  Future<void> _addNote() async {
    final newNote = await Navigator.push<Note>(
      // Ожидаем результат с экрана редактирования
      context,
      MaterialPageRoute(
        builder: (_) => const EditNotePage(),
      ), // [cite: 413, 414, 415]
    );
    if (newNote != null) {
      setState(
        () => _notes.add(newNote),
      ); // Если заметка не null, добавляем ее в список и обновляем UI
    }
  }

  // Метод для редактирования заметки
  Future<void> _edit(Note note) async {
    final updated = await Navigator.push<Note>(
      // Передаем существующую заметку для редактирования
      context,
      MaterialPageRoute(
        builder: (_) => EditNotePage(existing: note),
      ), // [cite: 422, 423, 424]
    );
    if (updated != null) {
      setState(() {
        // Обновляем UI
        final i = _notes.indexWhere(
          (n) => n.id == updated.id,
        ); // Находим индекс заметки по ID
        if (i != -1)
          _notes[i] =
              updated; // Заменяем старую заметку на обновленную [cite: 427, 428, 429]
      });
    }
  }

  // Метод для удаления заметки
  void _delete(Note note) {
    setState(
      () => _notes.removeWhere((n) => n.id == note.id),
    ); // Удаляем элемент и обновляем UI
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Заметка удалена'),
      ), // Показываем сообщение об удалении [cite: 435, 436]
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Simple Notes')), // [cite: 442]
      floatingActionButton: FloatingActionButton(
        onPressed: _addNote, // Кнопка для добавления заметки
        child: const Icon(Icons.add), // [cite: 443, 444, 445]
      ),
      body: _notes.isEmpty
          ? const Center(
              child: Text('Пока нет заметок. Нажмите +'),
            ) // Сообщение, если список пуст [cite: 447, 448]
          : ListView.builder(
              // Оптимизированный список для коллекций [cite: 449]
              itemCount: _notes.length, // [cite: 450]
              itemBuilder: (context, i) {
                final note = _notes[i];
                return ListTile(
                  key: ValueKey(
                    note.id,
                  ), // Важный уникальный ключ для списков [cite: 454]
                  title: Text(
                    note.title.isEmpty ? '(без названия)' : note.title,
                  ),
                  subtitle: Text(
                    note.body,
                    maxLines: 1,
                    overflow: TextOverflow
                        .ellipsis, // Обрезка длинного текста [cite: 457, 458, 459, 460]
                  ),
                  onTap: () =>
                      _edit(note), // Тап для редактирования [cite: 461]
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () =>
                        _delete(note), // Кнопка для удаления [cite: 462, 464]
                  ),
                );
              },
            ),
    );
  }
}
