import re
import math
from collections import Counter

def read_file(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        return file.read()

def preprocess_text(text):
    # Приведение к нижнему регистру и удаление знаков препинания
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = text.replace(' ', '')
    return text

def save_preprocessed_text(text, filename):
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(text)

def count_frequencies(text):
    # Подсчет частоты однобуквенных сочетаний
    single_letter_freq = Counter(text)
    
    # Подсчет частоты двухбуквенных сочетаний
    double_letter_freq = Counter(text[i:i+2] for i in range(len(text)-1))
    
    return single_letter_freq, double_letter_freq

def calculate_entropy(frequencies, total_count):
    entropy = 0
    for count in frequencies.values():
        probability = count / total_count
        entropy -= probability * math.log2(probability)
    return entropy

def calculate_code_length(alphabet_size, text_length):
    return text_length * math.log2(alphabet_size)

def calculate_redundancy(entropy, code_length):
    return 1 - (entropy / code_length)

def remove_frequent_chars(text, percentage):
    char_freq = Counter(text)
    chars_to_remove = int(len(char_freq) * percentage)
    most_common = [char for char, _ in char_freq.most_common(chars_to_remove)]
    return ''.join(char for char in text if char not in most_common)

def remove_rare_chars(text, percentage):
    char_freq = Counter(text)
    chars_to_remove = int(len(char_freq) * percentage)
    least_common = [char for char, _ in char_freq.most_common()[:-chars_to_remove-1:-1]]
    return ''.join(char for char in text if char not in least_common)

def main():
    # 1. Чтение файла
    input_filename = 'input.txt'
    text = read_file(input_filename)

    # 2. Предобработка текста
    preprocessed_text = preprocess_text(text)
    save_preprocessed_text(preprocessed_text, 'preprocessed.txt')

    # 3. Подсчет частоты
    single_letter_freq, double_letter_freq = count_frequencies(preprocessed_text)

    # 4. Расчет энтропии
    single_letter_entropy = calculate_entropy(single_letter_freq, len(preprocessed_text))
    double_letter_entropy = calculate_entropy(double_letter_freq, len(preprocessed_text) - 1)

    print(f"Энтропия однобуквенных сочетаний: {single_letter_entropy:.4f} бит/символ")
    print(f"Энтропия двухбуквенных сочетаний: {double_letter_entropy:.4f} бит/пару символов")

    # 5. Расчет длины кода и избыточности
    alphabet_size = len(set(preprocessed_text))
    code_length = calculate_code_length(alphabet_size, len(preprocessed_text))
    redundancy = calculate_redundancy(single_letter_entropy, math.log2(alphabet_size))

    print(f"Длина кода при равномерном побуквенном кодировании: {code_length:.4f} бит")
    print(f"Избыточность: {redundancy:.4f}")

    # 6. Удаление 20% наиболее частых символов
    text_without_frequent = remove_frequent_chars(preprocessed_text, 0.2)
    freq_without_frequent = Counter(text_without_frequent)
    entropy_without_frequent = calculate_entropy(freq_without_frequent, len(text_without_frequent))

    print(f"Энтропия после удаления 20% частых символов: {entropy_without_frequent:.4f} бит/символ")

    # 7. Удаление 20% наиболее редких символов
    text_without_rare = remove_rare_chars(preprocessed_text, 0.2)
    freq_without_rare = Counter(text_without_rare)
    entropy_without_rare = calculate_entropy(freq_without_rare, len(text_without_rare))

    print(f"Энтропия после удаления 20% редких символов: {entropy_without_rare:.4f} бит/символ")

if __name__ == "__main__":
    main()