# Написать рекурсивную подпрограмму вычисления чисел Фибоначчи.        
# Xn=Xn-1+Xn-2;    X0=1;   X1=1 (см. подсказки в слайдах с лекции)

def fib(n):
    if n in (0, 1):
        return 1
    return fib(n - 1) + fib(n - 2)

n = int(input())

print(fib(n))