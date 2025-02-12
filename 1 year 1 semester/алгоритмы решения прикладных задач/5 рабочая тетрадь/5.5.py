# Написать программу с рекурсивной функцией для нахождения значения следующей функции 
# f(1) = 1
# f(2n) = n
# f(2n + 1) = f(n) + f(n + 1)

def func(n):
    if n == 1: return 1
    if n % 2 == 0: return func(n // 2)
    if n % 2 == 1: return func(n // 2) + func(n // 2 + 1)

print(func(int(input())))
