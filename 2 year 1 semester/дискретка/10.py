import random
from typing import List

def generate_large_prime(bit_length: int = 256) -> int:
    """Генерация большого простого числа."""
    while True:
        # Генерируем большое нечетное число
        candidate = random.getrandbits(bit_length)
        # Устанавливаем старший бит для обеспечения нужной длины
        candidate |= (1 << (bit_length - 1)) | 1
        
        # Проверка простоты тестом Миллера-Рабина
        if is_prime(candidate):
            return candidate

def is_prime(n: int, k: int = 40) -> bool:
    """Тест Миллера-Рабина для проверки простоты числа."""
    if n <= 1 or n == 4:
        return False
    if n <= 3:
        return True
    
    # Разложение n-1 на множители вида 2^r * d
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    
    # Тест k раз
    for _ in range(k):
        a = random.randint(2, n - 2)
        x = pow(a, d, n)
        
        if x == 1 or x == n - 1:
            continue
        
        is_composite = True
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                is_composite = False
                break
        
        if is_composite:
            return False
    
    return True

def generate_primes(k: int, m: int) -> List[int]:
    """
    Генерация простых чисел по алгоритму GENPR.
    
    :param k: Длина массива
    :param m: Нечетное целое число
    :return: Список простых чисел
    """
    # Инициализация
    n = (m + 2**((k-2)//2))
    
    # Создаем массив для отсеивания
    A = [1] * k
    d = 2
    
    while d**2 <= n:
        # Находим минимальное j такое, что (j*m + d) % 2 != 0
        if d != 2:
            j = 1
            while (j * m + d) % (2 * d) != 0:
                j += 1
        else:
            j = 1
        
        # Вычеркивание составных чисел
        for i in range(j, k, d):
            A[i] = 0
        
        # Изменение d
        d += 1 if d % 6 != 1 else 3
    
    # Получение простых чисел
    primes = []
    for i in range(1, k):
        if A[i] == 1:
            prime = 2**(m+2*i-1)
            primes.append(prime)
    
    return primes

def modular_exponentiation(a: int, k: int, m: int) -> int:
    """
    Возведение a в степень k по модулю m.
    
    :param a: Основание
    :param k: Показатель степени
    :param m: Модуль
    :return: Результат (a^k) mod m
    """
    # Инициализация
    A, B = a, 1
    K = k
    
    while K > 0:
        # Если младший бит 1
        if K % 2 == 1:
            B = (B * A) % m
        
        # Возведение в квадрат
        A = (A * A) % m
        K //= 2
    
    return B

def main():
    # Генерируем два больших простых числа
    p = generate_large_prime(512)
    q = generate_large_prime(512)
    
    print(f"Первое число p: {p}")
    print(f"Второе число q: {q}")
    
    # Операции с большими числами
    # Сложение
    sum_result = p + q
    print(f"Сложение: {p} + {q} = {sum_result}")
    
    # Вычитание
    sub_result = p - q
    print(f"Вычитание: {p} - {q} = {sub_result}")
    
    # Умножение
    mul_result = p * q
    print(f"Умножение: {p} * {q} = {mul_result}")
    
    # Деление
    div_result = p // q
    print(f"Деление (целочисленное): {p} // {q} = {div_result}")
    
    # Остаток от деления
    mod_result = p % q
    print(f"Остаток от деления: {p} % {q} = {mod_result}")
    
    # Возведение в степень по модулю
    exp_result = modular_exponentiation(p, 17, q)
    print(f"Возведение в степень по модулю: {p}^17 mod {q} = {exp_result}")
    
    # Генерация простых чисел по алгоритму GENPR
    print("\nПростые числа по алгоритму GENPR:")
    primes = generate_primes(6, 17)
    print(primes)

if __name__ == "__main__":
    main()