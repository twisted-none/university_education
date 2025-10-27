// lib/edit_note_page.dart
import 'package:flutter/material.dart';
import 'models/note.dart'; // Импорт модели

class EditNotePage extends StatefulWidget {
  final Note? existing; // Если заметка передана, то это редактирование

  const EditNotePage({super.key, this.existing}); // [cite: 477, 478]

  @override
  State<EditNotePage> createState() => _EditNotePageState(); // [cite: 480]
}

class _EditNotePageState extends State<EditNotePage> {
  final _formKey = GlobalKey<FormState>(); // Ключ для валидации формы
  late String _title =
      widget.existing?.title ?? ''; // Начальное значение заголовка
  late String _body =
      widget.existing?.body ?? ''; // Начальное значение текста [cite: 484, 485]

  void _save() {
    if (!_formKey.currentState!.validate()) return; // Проверка валидации
    _formKey.currentState!.save(); // Сохранение значений из полей

    final result =
        (widget.existing ==
            null) // Если existing == null, создаем новую заметку
        ? Note(
            id: DateTime.now().millisecondsSinceEpoch
                .toString(), // Генерация уникального ID
            title: _title,
            body: _body,
          ) // [cite: 490, 491, 492, 493, 494]
        : widget.existing!.copyWith(
            title: _title,
            body: _body,
          ); // Иначе - обновляем существующую [cite: 495]

    Navigator.pop(
      context,
      result,
    ); // Возвращаем результат (заметку) на предыдущий экран [cite: 496]
  }

  @override
  Widget build(BuildContext context) {
    final isEdit =
        widget.existing !=
        null; // Проверка режима: редактирование или создание [cite: 500]
    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Редактировать' : 'Новая заметка'),
      ), // [cite: 502]
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey, // [cite: 506]
          child: Column(
            children: [
              TextFormField(
                initialValue: _title,
                decoration: const InputDecoration(
                  labelText: 'Заголовок',
                ), // [cite: 511]
                onSaved: (v) => _title = v!.trim(), // [cite: 512]
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: _body,
                decoration: const InputDecoration(
                  labelText: 'Текст',
                ), // [cite: 517]
                minLines: 3,
                maxLines: 6, // [cite: 518, 519]
                onSaved: (v) => _body = v!.trim(),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) // Валидация
                    ? 'Введите текст заметки'
                    : null, // [cite: 521, 522, 523, 524]
              ),
              const Spacer(), // Заполняет оставшееся пространство
              FilledButton.icon(
                onPressed: _save,
                icon: const Icon(Icons.check),
                label: const Text('Сохранить'), // [cite: 526, 527, 528, 529]
              ),
            ],
          ),
        ),
      ),
    );
  }
}
