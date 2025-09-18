# Переписать программу из рабочей тетради 1 для нахождения корня уравнения методом половинного деления, реализовав метод через рекурсивную процедуру 
# (вариант тот же, что и в рабочей тетради 1, см. подсказки в слайдах с лекции)

def recursive_sqrt_finder(l, r, a):
    
    m = (r + l) // 2
    
    if m ** 2 == a:
        return m

    if m ** 2 > a:
        return recursive_sqrt_finder(l, m, a)
    else:
        return recursive_sqrt_finder(m, r, a)

n = int(input())
print(recursive_sqrt_finder(0, max(n, 1), n))