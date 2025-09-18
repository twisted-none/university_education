import random

# Устанавливаем seed для воспроизводимости результатов
random.seed(42)

# Исходный текст для шифрования
text = "Привет, это тестовое сообщение для шифрования методом гаммирования!"
print(f"Исходный текст: {text}")

# Преобразуем текст в массив байтов
text_bytes = [ord(c) for c in text]
print(f"Текст в байтах: {text_bytes}")

# Генерируем гамму нужной длины
gamma = [random.randint(0, 255) for _ in range(len(text_bytes))]
print(f"Гамма: {gamma}")

# Шифруем текст, применяя операцию XOR между текстом и гаммой
encrypted_bytes = [t ^ g for t, g in zip(text_bytes, gamma)]
print(f"Зашифрованный текст (в байтах): {encrypted_bytes}")

# Дешифруем текст, применяя операцию XOR между шифротекстом и той же гаммой
decrypted_bytes = [c ^ g for c, g in zip(encrypted_bytes, gamma)]
print(f"Расшифрованный текст (в байтах): {decrypted_bytes}")

# Преобразуем расшифрованные байты обратно в текст
decrypted_text = ''.join(chr(b) for b in decrypted_bytes)
print(f"Расшифрованный текст: {decrypted_text}")

# Проверяем, что расшифрованный текст совпадает с исходным
if text == decrypted_text:
    print("Проверка успешна: расшифрованный текст совпадает с исходным.")
else:
    print("Ошибка: расшифрованный текст не совпадает с исходным!")