import math
from collections import Counter, defaultdict
import numpy as np

class TextProcessor:
    def __init__(self, text):
        self.text = text
        self.char_frequencies = self._calculate_frequencies(text)
        self.bigram_frequencies = self._calculate_bigram_frequencies(text)
        
    def _calculate_frequencies(self, text):
        counter = Counter(text)
        total = sum(counter.values())
        return {char: count/total for char, count in counter.items()}
    
    def _calculate_bigram_frequencies(self, text):
        bigrams = [''.join(pair) for pair in zip(text[:-1], text[1:])]
        counter = Counter(bigrams)
        total = sum(counter.values())
        return {bigram: count/total for bigram, count in counter.items()}
    
    def calculate_entropy(self, frequencies):
        return -sum(p * math.log2(p) for p in frequencies.values())
    
    def calculate_uniform_code_length(self, alphabet_size):
        return math.ceil(math.log2(alphabet_size))
    
    def calculate_redundancy(self, entropy, uniform_length):
        return 1 - (entropy / uniform_length)
    
    def calculate_average_code_length(self, codes, frequencies):
        # Вычисление средней длины кода
        return sum(len(codes[symbol]) * freq for symbol, freq in frequencies.items())

class ShannonFano:
    def __init__(self):
        self.codes = {}
    
    def divide_symbols(self, symbols_with_probs):
        if len(symbols_with_probs) <= 1:
            return symbols_with_probs
        
        total_prob = sum(prob for _, prob in symbols_with_probs)
        running_prob = 0
        best_diff = float('inf')
        best_idx = 0
        
        for i, (_, prob) in enumerate(symbols_with_probs[:-1]):
            running_prob += prob
            diff = abs(2 * running_prob - total_prob)
            if diff < best_diff:
                best_diff = diff
                best_idx = i + 1
                
        return symbols_with_probs[:best_idx], symbols_with_probs[best_idx:]
    
    def build_code(self, symbols_with_probs, prefix=''):
        if len(symbols_with_probs) == 1:
            symbol, _ = symbols_with_probs[0]
            self.codes[symbol] = prefix
            return
            
        left, right = self.divide_symbols(symbols_with_probs)
        self.build_code(left, prefix + '0')
        self.build_code(right, prefix + '1')
        
    def encode(self, text):
        return ''.join(self.codes[char] for char in text)
        
    def decode(self, encoded_text):
        reverse_codes = {v: k for k, v in self.codes.items()}
        decoded = ''
        current = ''
        for bit in encoded_text:
            current += bit
            if current in reverse_codes:
                decoded += reverse_codes[current]
                current = ''
        return decoded

class Huffman:
    class Node:
        def __init__(self, symbol, freq):
            self.symbol = symbol
            self.freq = freq
            self.left = None
            self.right = None
            
    def __init__(self):
        self.codes = {}
        
    def build_tree(self, frequencies):
        nodes = [self.Node(symbol, freq) for symbol, freq in frequencies.items()]
        while len(nodes) > 1:
            nodes.sort(key=lambda x: x.freq)
            left = nodes.pop(0)
            right = nodes.pop(0)
            internal = self.Node(None, left.freq + right.freq)
            internal.left = left
            internal.right = right
            nodes.append(internal)
        return nodes[0]
        
    def generate_codes(self, node, code=''):
        if node.symbol is not None:
            self.codes[node.symbol] = code
            return
        self.generate_codes(node.left, code + '0')
        self.generate_codes(node.right, code + '1')
        
    def build_code(self, frequencies):
        root = self.build_tree(frequencies)
        self.generate_codes(root)
        
    def encode(self, text):
        return ''.join(self.codes[char] for char in text)
        
    def decode(self, encoded_text):
        reverse_codes = {v: k for k, v in self.codes.items()}
        decoded = ''
        current = ''
        for bit in encoded_text:
            current += bit
            if current in reverse_codes:
                decoded += reverse_codes[current]
                current = ''
        return decoded

class HammingCode:
    def __init__(self, k):
        self.k = k  # количество информационных разрядов
        self.r = self.calculate_r()  # количество проверочных разрядов
        self.n = self.k + self.r  # общая длина кода
        self.H = self.build_check_matrix()
        self.G = self.build_generator_matrix()
        
    def calculate_r(self):
        # Вычисление количества проверочных разрядов
        r = 1
        while 2**r < self.k + r + 1:
            r += 1
        return r
        
    def build_check_matrix(self):
        # Построение проверочной матрицы
        n = self.k + self.r
        H = np.zeros((self.r, n), dtype=int)
        
        # Заполняем все возможные ненулевые комбинации для первых k столбцов
        for i in range(self.k):
            col = i + 1
            for j in range(self.r):
                H[j, i] = (col >> j) & 1
                
        # Добавляем единичную матрицу справа
        for i in range(self.r):
            H[i, self.k + i] = 1
            
        return H
        
    def build_generator_matrix(self):
        # Построение порождающей матрицы
        G = np.zeros((self.k, self.n), dtype=int)
        
        # Единичная матрица слева
        for i in range(self.k):
            G[i, i] = 1
            
        # Дополнительные биты справа
        for i in range(self.k):
            for j in range(self.r):
                G[i, self.k + j] = self.H[j, i]
                
        return G
        
    def print_matrices(self):
        print("\nПорождающая матрица G:")
        print(self.G)
        print("\nПроверочная матрица H:")
        print(self.H)
        
    def encode(self, message):
        # Кодирование сообщения
        message_array = np.array([int(bit) for bit in message])
        print(f"\nИсходное сообщение в виде массива: {message_array}")
        
        encoded = np.dot(message_array, self.G) % 2
        print(f"Результат умножения на порождающую матрицу: {encoded}")
        
        return ''.join(map(str, encoded))
        
    def calculate_syndrome(self, received):
        # Вычисление синдрома
        received_array = np.array([int(bit) for bit in received])
        syndrome = np.dot(self.H, received_array) % 2
        
        # Преобразуем синдром в десятичное число для определения позиции ошибки
        syndrome_decimal = int(''.join(map(str, syndrome)), 2)
        
        print(f"\nПринятое сообщение в виде массива: {received_array}")
        print(f"Вычисленный синдром: {syndrome}")
        print(f"Синдром в десятичной системе: {syndrome_decimal}")
        
        return syndrome, syndrome_decimal
        
    def correct_error(self, received):
        # Исправление ошибки
        syndrome, syndrome_decimal = self.calculate_syndrome(received)
        
        if syndrome_decimal == 0:
            print("\nОшибок не обнаружено")
            return received
            
        # Находим позицию ошибки
        received_list = list(received)
        error_position = None
        
        for i in range(len(received_list)):
            if np.array_equal(syndrome, self.H[:, i]):
                error_position = i
                received_list[i] = str(1 - int(received_list[i]))
                break
                
        if error_position is not None:
            print(f"\nОбнаружена ошибка в позиции: {error_position}")
        else:
            print("\nПозиция ошибки не найдена")
            
        return ''.join(received_list)

def main():
    # Пример использования для обработки текста
    text = input("Введите текст для обработки: ")
    processor = TextProcessor(text)
    
    # Статистическая обработка
    print("\nСтатистическая обработка:")
    entropy = processor.calculate_entropy(processor.char_frequencies)
    uniform_length = processor.calculate_uniform_code_length(len(processor.char_frequencies))
    redundancy = processor.calculate_redundancy(entropy, uniform_length)
    
    print(f"Энтропия: {entropy:.2f} бит/символ")
    print(f"Длина равномерного кода: {uniform_length} бит")
    print(f"Избыточность: {redundancy:.2f}")
    
    # Кодирование методом Шеннона-Фано
    print("\nКодирование методом Шеннона-Фано:")
    shannon_fano = ShannonFano()
    sorted_freqs = sorted(processor.char_frequencies.items(), key=lambda x: x[1], reverse=True)
    shannon_fano.build_code(sorted_freqs)
    
    encoded_sf = shannon_fano.encode(text)
    decoded_sf = shannon_fano.decode(encoded_sf)
    
    print("Коды Шеннона-Фано:", shannon_fano.codes)
    print(f"Закодированный текст: {encoded_sf}")
    print(f"Декодированный текст: {decoded_sf}")
    
    # Кодирование методом Хаффмана
    print("\nКодирование методом Хаффмана:")
    huffman = Huffman()
    huffman.build_code(processor.char_frequencies)
    
    encoded_huff = huffman.encode(text)
    decoded_huff = huffman.decode(encoded_huff)
    
    print("Коды Хаффмана:", huffman.codes)
    print(f"Закодированный текст: {encoded_huff}")
    print(f"Декодированный текст: {decoded_huff}")
    
    # Код Хемминга
    print("\nКод Хемминга:")
    k = int(input("Введите количество информационных разрядов: "))
    message = input(f"Введите {k} битное сообщение: ")
    
    hamming = HammingCode(k)
    print(f"Количество проверочных разрядов: {hamming.r}")
    print(f"Общая длина кодового слова: {hamming.n}")
    
    # Вывод матриц
    hamming.print_matrices()
    
    # Кодирование
    encoded = hamming.encode(message)
    print(f"\nЗакодированное сообщение: {encoded}")
    
    # Внесение ошибки
    error_pos = int(input(f"\nВведите позицию для внесения ошибки (0-{hamming.n-1}): "))
    received = list(encoded)
    received[error_pos] = str(1 - int(received[error_pos]))
    received = ''.join(received)
    print(f"Сообщение с ошибкой: {received}")
    
    # Исправление ошибки
    corrected = hamming.correct_error(received)
    print(f"Исправленное сообщение: {corrected}")

if __name__ == "__main__":
    main()