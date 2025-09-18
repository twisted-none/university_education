# Написать программу для факторизации заданного с клавиатуры нечетного
# числа методом Ферма (указать простые множители и их кратность). Для
# анализа числа на простоту использовать решето Эратосфена

def resheto_eratosfera(n):
    lst = [2]
    lst.extend([i for i in range(3, n + 1, 2)])
    for i in range(len(lst)):
        for j in range(i + 1, len(lst)):
            if lst[i] != 0 and lst[j] % lst[i] == 0:
                lst[j] = 0
    lst = [i for i in lst if i != 0]
    return lst

def method_ferma(n):
    k = 1
    while k * k < n:
        k += 1

    if k * k == n:
        return [(k, 2)]

    while True:
        y_squared = k * k - n
        y = int(y_squared ** 0.5)
        if y * y == y_squared:
            break
        k += 1

    factors = [k + y, k - y]

    return factors

n = n1 = int(input())

prime_numbers = resheto_eratosfera(n)
factors = []

while n != 1:
    for factor in prime_numbers:
        if n % factor == 0:
            count = 0
            while n % factor == 0:
                n //= factor
                count += 1
            factors.append((factor, count))
print(f'{n1} = ', end='')
s = 1
for factor, count in factors:
    if s != len(factors):
        print(f"({factor} ** {count}) * ", end='')
    else:
        print(f"({factor} ** {count})")
    s += 1