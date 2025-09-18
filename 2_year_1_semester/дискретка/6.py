
import random
import math

def sieve_of_eratosthenes(n):
    """Implementation of Sieve of Eratosthenes algorithm."""
    sieve = [True] * n
    sieve[0] = sieve[1] = False
    
    for i in range(2, int(math.sqrt(n)) + 1):
        if sieve[i]:
            for j in range(i * i, n, i):
                sieve[j] = False
    
    return [i for i in range(n) if sieve[i]]

def fermat_factorization(n):
    """Fermat's factorization method."""
    if n % 2 == 0:
        return 2, n // 2
    
    a = math.ceil(math.sqrt(n))
    b2 = a * a - n
    
    while math.isqrt(b2) ** 2 != b2:
        a += 1
        b2 = a * a - n
    
    b = math.isqrt(b2)
    return a - b, a + b

def jacobi_symbol(a, n):
    """Calculate Jacobi symbol."""
    if a == 0:
        return 0
    if a == 1:
        return 1
    
    if a % 2 == 0:
        return jacobi_symbol(a // 2, n) * (-1 if n % 8 in [3, 5] else 1)
    
    return jacobi_symbol(n % a, a) * (-1 if a % 4 == 3 and n % 4 == 3 else 1)

def solovay_strassen_test(n, k=10):
    """Solovay-Strassen primality test."""
    if n == 2:
        return True
    if n < 2 or n % 2 == 0:
        return False
    
    for _ in range(k):
        a = random.randrange(2, n)
        x = pow(a, (n-1)//2, n)
        if x != 1 and x != n-1:
            return False
        j = jacobi_symbol(a, n)
        if j % n != x:
            return False
    return True

def lehmann_test(n, k=10):
    """Lehmann primality test."""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    
    for _ in range(k):
        a = random.randrange(2, n)
        x = pow(a, (n-1)//2, n)
        if x != 1 and x != n-1:
            return False
    return True

def miller_rabin_test(n, k=10):
    """Miller-Rabin primality test."""
    if n == 2:
        return True
    if n < 2 or n % 2 == 0:
        return False
    
    r, s = 0, n - 1
    while s % 2 == 0:
        r += 1
        s //= 2
    
    for _ in range(k):
        a = random.randrange(2, n-1)
        x = pow(a, s, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True

def main():
    primes_under_256 = sieve_of_eratosthenes(256)
    print("Простые числа меньше 256:", primes_under_256)
    
    test_numbers = [random.randint(2**1024, 2**2048) for _ in range(4)]
    for n in test_numbers:
        if n % 2 == 0 or any(n % p == 0 for p in primes_under_256 if p * p <= n):
            print(f"{n} - составное число")
            continue
            
        try:
            p, q = fermat_factorization(n)
            print(f"{n} = {p} × {q} (составное)")
        except Exception:
            print(f"{n} вероятно простое")
    
    large_prime = random.randint(2**1024, 2**2048)
    print(f"\nТестирование числа {large_prime}:")
    print(f"Тест Соловея-Штрассена: {'вероятно простое' if solovay_strassen_test(large_prime) else 'составное'}")
    print(f"Тест Леманна: {'вероятно простое' if lehmann_test(large_prime) else 'составное'}")
    print(f"Тест Рабина-Миллера: {'вероятно простое' if miller_rabin_test(large_prime) else 'составное'}")

if __name__ == "__main__":
    main()