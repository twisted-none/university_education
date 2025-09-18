import numpy as np

class HammingCodeMatrix:
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
        
    def encode(self, message):
        # Кодирование сообщения
        message_array = np.array([int(bit) for bit in message])
        encoded = np.dot(message_array, self.G) % 2
        return ''.join(map(str, encoded))
        
    def calculate_syndrome(self, received):
        # Вычисление синдрома
        received_array = np.array([int(bit) for bit in received])
        syndrome = np.dot(self.H, received_array) % 2
        syndrome_decimal = int(''.join(map(str, syndrome)), 2)
        return syndrome, syndrome_decimal
        
    def correct_error(self, received):
        # Исправление ошибки
        syndrome, syndrome_decimal = self.calculate_syndrome(received)
        
        if syndrome_decimal == 0:
            return received, "Ошибок не обнаружено"
            
        # Находим позицию ошибки
        received_list = list(received)
        error_position = None
        
        for i in range(len(received_list)):
            if np.array_equal(syndrome, self.H[:, i]):
                error_position = i
                received_list[i] = str(1 - int(received_list[i]))
                break
                
        message = "Ошибка не найдена" if error_position is None else f"Исправлена ошибка в позиции {error_position}"
        return ''.join(received_list), message

         
    def calculate_detailed_syndrome(self, received):
        """Подробное вычисление синдрома с выводом промежуточных шагов"""
        received_array = np.array([int(bit) for bit in received])
        print("\nВычисление синдрома матричным методом:")
        print(f"Принятое сообщение: {received}")
        print(f"Проверочная матрица H:\n{self.H}")
        
        # Вычисляем синдром с промежуточными шагами
        syndrome = np.zeros(self.r, dtype=int)
        for i in range(self.r):
            row_calc = []
            for j, bit in enumerate(received_array):
                if bit == 1:
                    row_calc.append(f"H[{i},{j}]={self.H[i,j]}")
            if row_calc:
                print(f"Строка {i+1}: {' ⊕ '.join(row_calc)} = {np.dot(self.H[i], received_array) % 2}")
            syndrome[i] = np.dot(self.H[i], received_array) % 2
            
        syndrome_decimal = int(''.join(map(str, syndrome)), 2)
        print(f"Итоговый синдром: {syndrome} (в десятичной системе: {syndrome_decimal})")
        return syndrome, syndrome_decimal

class HammingCodeTable:
    def __init__(self, k):
        self.k = k
        self.r = self.calculate_r()
        self.n = self.k + self.r
        self.table = self.build_table()
        
    def calculate_r(self):
        r = 1
        while 2**r <= self.k + r:
            r += 1
        return r
        
    def build_table(self):
        # Создаем таблицу с двоичным представлением номеров позиций
        table = []
        for i in range(self.r):
            row = [(j >> i) & 1 for j in range(1, self.n + 1)]
            table.append(row)
        return table
        
    def find_parity_positions(self):
        # Находим позиции проверочных битов
        parity_positions = []
        for i in range(self.n):
            ones_count = sum(row[i] for row in self.table)
            if ones_count == 1:
                parity_positions.append(i)
        return sorted(parity_positions)
        
    def encode(self, message):
        # Находим позиции проверочных битов
        parity_positions = self.find_parity_positions()
        
        # Размещаем информационные биты
        encoded = ['0'] * self.n
        msg_idx = 0
        for i in range(self.n):
            if i not in parity_positions:
                encoded[i] = message[msg_idx]
                msg_idx += 1
                
        # Вычисляем проверочные биты
        for i, pos in enumerate(parity_positions):
            parity = 0
            for j in range(self.n):
                if j != pos and encoded[j] == '1' and self.table[i][j] == 1:
                    parity ^= 1
            encoded[pos] = str(parity)
            
        return ''.join(encoded)
        
    def calculate_syndrome(self, received):
        syndrome = []
        for row in self.table:
            parity = 0
            for i, bit in enumerate(received):
                if int(bit) == 1 and row[i] == 1:
                    parity ^= 1
            syndrome.append(str(parity))
        return ''.join(syndrome)
        
    def correct_error(self, received):
        syndrome = self.calculate_syndrome(received)
        error_position = int(syndrome, 2) - 1
        
        if error_position < 0:
            return received, "Ошибок не обнаружено"
            
        if error_position >= len(received):
            return received, "Ошибка не может быть исправлена"
            
        received_list = list(received)
        received_list[error_position] = str(1 - int(received_list[error_position]))
        return ''.join(received_list), f"Исправлена ошибка в позиции {error_position}"

    def calculate_detailed_syndrome(self, received):
        """Подробное вычисление синдрома табличным методом"""
        print("\nВычисление синдрома табличным методом:")
        print("Вспомогательная таблица:")
        for row in self.table:
            print(row)
            
        syndrome = []
        received_bits = [int(bit) for bit in received]
        print(f"\nПринятое сообщение: {received}")
        
        for i, row in enumerate(self.table):
            calc_parts = []
            result = 0
            for j, (table_bit, received_bit) in enumerate(zip(row, received_bits)):
                if received_bit == 1 and table_bit == 1:
                    calc_parts.append(f"1")
                    result ^= 1
            
            if calc_parts:
                print(f"Строка {i+1}: {' ⊕ '.join(calc_parts)} = {result}")
            else:
                print(f"Строка {i+1}: 0")
            syndrome.append(str(result))
            
        syndrome_str = ''.join(syndrome)
        syndrome_decimal = int(syndrome_str, 2)
        print(f"Итоговый синдром: {syndrome_str} (в десятичной системе: {syndrome_decimal})")
        return syndrome_str, syndrome_decimal
def main():
    print("Программа кодирования Хэмминга с подробным вычислением синдрома")
    
    while True:
        print("\nВыберите метод:")
        print("1. Матричный метод")
        print("2. Табличный метод")
        print("0. Выход")
        
        choice = input("\nВаш выбор: ")
        
        if choice == "0":
            break
            
        if choice not in ["1", "2"]:
            print("Неверный выбор. Попробуйте снова.")
            continue
            
        try:
            k = int(input("Введите количество информационных разрядов: "))
            if k <= 0:
                print("Количество разрядов должно быть положительным числом")
                continue
                
            message = input(f"Введите {k} битное сообщение: ")
            if len(message) != k or not all(bit in '01' for bit in message):
                print(f"Сообщение должно содержать ровно {k} бит (0 или 1)")
                continue
                
        except ValueError:
            print("Ошибка ввода. Введите корректное число.")
            continue
            
        if choice == "1":
            hamming = HammingCodeMatrix(k)
            print("\nПорождающая матрица G:")
            print(hamming.G)
            print("\nПроверочная матрица H:")
            print(hamming.H)
        else:
            hamming = HammingCodeTable(k)
            print("\nВспомогательная таблица:")
            for row in hamming.table:
                print(row)
                
        encoded = hamming.encode(message)
        print(f"\nЗакодированное сообщение: {encoded}")
        
        try:
            error_pos = int(input(f"Введите позицию для внесения ошибки (0-{len(encoded)-1}): "))
            if error_pos < 0 or error_pos >= len(encoded):
                print("Неверная позиция ошибки")
                continue
        except ValueError:
            print("Ошибка ввода. Введите корректное число.")
            continue
            
        received = list(encoded)
        received[error_pos] = '1' if received[error_pos] == '0' else '0'
        received = ''.join(received)
        print(f"Сообщение с ошибкой: {received}")
        
        # Подробное вычисление синдрома
        syndrome, syndrome_decimal = hamming.calculate_detailed_syndrome(received)

if __name__ == "__main__":
    main()