# Написать программу с рекурсивной функцией для нахождения суммы цифр числа.

def sum_digits(n, sum_n=0):
    if len(n) == 1:
        return sum_n + int(n)
    return sum_digits(n[:-1], sum_n + int(n[-1]))

n = input()
print(sum_digits(n))