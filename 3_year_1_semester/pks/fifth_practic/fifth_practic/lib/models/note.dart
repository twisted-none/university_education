// lib/models/note.dart
class Note {
  final String id;
  String title;
  String body;

  Note({
    required this.id,
    required this.title,
    required this.body,
  }); // [cite: 379]

  // Метод для создания копии объекта с измененными полями
  Note copyWith({String? title, String? body}) => Note(
    id: id,
    title: title ?? this.title,
    body: body ?? this.body,
  ); // [cite: 380, 381, 382, 383, 384]
}
