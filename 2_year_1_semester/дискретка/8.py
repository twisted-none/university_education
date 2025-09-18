import random
from collections import Counter

class TextCryptoAnalyzer:
    def __init__(self):
        # Русский алфавит
        self.alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя '
        # Создаем случайный шифр замены
        self.create_substitution_cipher()
        
    def create_substitution_cipher(self):
        """Создает случайный шифр замены"""
        alphabet_list = list(self.alphabet)
        shuffled = alphabet_list.copy()
        random.shuffle(shuffled)
        self.encrypt_dict = dict(zip(alphabet_list, shuffled))
        self.decrypt_dict = dict(zip(shuffled, alphabet_list))
        
    def encrypt(self, text):
        """Шифрует текст"""
        text = text.lower()
        return ''.join(self.encrypt_dict.get(c, c) for c in text)
        
    def decrypt(self, text):
        """Расшифровывает текст"""
        return ''.join(self.decrypt_dict.get(c, c) for c in text)
        
    def analyze_frequency(self, text):
        """Анализирует частоту символов в тексте"""
        # Считаем общее количество символов
        total = len(text)
        # Подсчитываем частоту каждого символа
        frequency = Counter(text.lower())
        # Переводим в вероятности
        probability = {char: count/total for char, count in frequency.items()}
        # Сортируем по убыванию
        return dict(sorted(probability.items(), key=lambda x: x[1], reverse=True))
    
    def get_reference_frequencies(self):
        """Возвращает эталонные частоты букв русского языка"""
        return {
            ' ': 0.175,
            'о': 0.090,
            'е': 0.072,
            'а': 0.062,
            'и': 0.062,
            'н': 0.053,
            'т': 0.053,
            'с': 0.045,
            'р': 0.040,
            'в': 0.038,
            'л': 0.035,
            'к': 0.028,
            'м': 0.026,
            'д': 0.025,
            'п': 0.023,
            'у': 0.021,
            'я': 0.018,
            'ы': 0.016,
            'з': 0.016,
            'ъ': 0.014,
            'б': 0.014,
            'г': 0.013,
            'ч': 0.012,
            'й': 0.010,
            'х': 0.009,
            'ж': 0.007,
            'ю': 0.006,
            'ш': 0.006,
            'ц': 0.004,
            'щ': 0.003,
            'э': 0.003,
            'ф': 0.002,
            'ё': 0.001
        }
    
    def display_analysis(self, frequencies):
        """Выводит результаты анализа"""
        print("\nЧастотный анализ:")
        print("Символ | Частота")
        print("-" * 20)
        for char, freq in frequencies.items():
            if char == ' ':
                char_display = 'Пробел'
            else:
                char_display = char
            print(f"{char_display:6} | {freq:.4f}")
            
    def suggest_decryption(self, encrypted_text):
        """Предлагает расшифровку на основе частотного анализа"""
        # Получаем частоты в зашифрованном тексте
        encrypted_freq = self.analyze_frequency(encrypted_text)
        # Получаем эталонные частоты
        reference_freq = self.get_reference_frequencies()
        
        # Сортируем оба словаря по частоте
        encrypted_sorted = sorted(encrypted_freq.items(), key=lambda x: x[1], reverse=True)
        reference_sorted = sorted(reference_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Создаем словарь соответствий
        mapping = {}
        for (enc_char, _), (ref_char, _) in zip(encrypted_sorted, reference_sorted):
            mapping[enc_char] = ref_char
            
        # Применяем расшифровку
        decrypted_text = ''
        for char in encrypted_text:
            decrypted_text += mapping.get(char, char)
            
        return decrypted_text

def main():
    analyzer = TextCryptoAnalyzer()
    
    while True:
        text = input("\nВведите текст для анализа: ")
            
        # Шифруем текст
        encrypted = analyzer.encrypt(text)
        print("\nЗашифрованный текст:")
        print(encrypted)
        
        # Проводим анализ зашифрованного текста
        frequencies = analyzer.analyze_frequency(encrypted)
        analyzer.display_analysis(frequencies)
        
        # Пытаемся расшифровать
        decrypted = analyzer.suggest_decryption(encrypted)
        print("\nПредполагаемая расшифровка:")
        print(decrypted)
        
        # Показываем правильную расшифровку для сравнения
        print("\nПравильная расшифровка:")
        print(analyzer.decrypt(encrypted))


if __name__ == "__main__":
    main()