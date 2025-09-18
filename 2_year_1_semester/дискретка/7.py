import re

def preprocess_text(text):
    """Предварительная обработка текста: приведение к нижнему регистру и удаление знаков препинания"""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

def simple_substitution_encrypt(text, key):
    """Шифрование методом простой замены"""
    russian_alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    if len(key) != len(russian_alphabet):
        raise ValueError("Длина ключа должна совпадать с длиной алфавита")
    
    translation_table = str.maketrans(russian_alphabet, key)
    return text.translate(translation_table)

def simple_substitution_decrypt(text, key):
    """Дешифрование методом простой замены"""
    russian_alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    if len(key) != len(russian_alphabet):
        raise ValueError("Длина ключа должна совпадать с длиной алфавита")
    
    translation_table = str.maketrans(key, russian_alphabet)
    return text.translate(translation_table)

def create_vigenere_table():
    """Создание таблицы Виженера"""
    alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'
    table = []
    for i in range(len(alphabet)):
        row = alphabet[i:] + alphabet[:i]
        table.append(row)
    return table

def vigenere_encrypt(text, key):
    """Шифрование методом сложной замены (шифр Виженера)"""
    alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'
    table = create_vigenere_table()
    result = ''
    key_index = 0
    
    for char in text:
        if char in alphabet:
            # Находим индексы в алфавите
            row = alphabet.index(key[key_index % len(key)])
            col = alphabet.index(char)
            # Получаем символ из таблицы Виженера
            result += table[row][col]
            key_index += 1
        else:
            result += char
            
    return result

def vigenere_decrypt(text, key):
    """Дешифрование методом сложной замены (шифр Виженера)"""
    alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'
    table = create_vigenere_table()
    result = ''
    key_index = 0
    
    for char in text:
        if char in alphabet:
            # Находим строку по символу ключа
            row = alphabet.index(key[key_index % len(key)])
            # Ищем позицию зашифрованного символа в строке таблицы
            col = table[row].index(char)
            # Восстанавливаем исходный символ
            result += alphabet[col]
            key_index += 1
        else:
            result += char
            
    return result

# Тестирование программы
if __name__ == "__main__":
    # Исходный текст
    original_text = "прилетаю седьмого"
    print(f"Исходный текст: {original_text}")
    
    # Предварительная обработка
    processed_text = preprocess_text(original_text)
    print(f"Обработанный текст: {processed_text}")
    
    # Тест простой замены
    print("\nМетод простой замены:")
    # Используем простой сдвиг на 3 позиции для каждой буквы
    simple_key = 'гдеёжзийклмнопрстуфхцчшщъыьэюяабв'
    encrypted_simple = simple_substitution_encrypt(processed_text, simple_key)
    print(f"Зашифрованный текст: {encrypted_simple}")
    decrypted_simple = simple_substitution_decrypt(encrypted_simple, simple_key)
    print(f"Расшифрованный текст: {decrypted_simple}")
    
    # Тест шифра Виженера
    print("\nМетод сложной замены (шифр Виженера):")
    vigenere_key = "амброзия"
    encrypted_vigenere = vigenere_encrypt(processed_text, vigenere_key)
    print(f"Зашифрованный текст: {encrypted_vigenere}")
    decrypted_vigenere = vigenere_decrypt(encrypted_vigenere, vigenere_key)
    print(f"Расшифрованный текст: {decrypted_vigenere}")