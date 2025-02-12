# Задача «сумма двух». 
# Вернуть индексы двух чисел в неотсортирован¬ном массиве, которые в сумме дают заданное значение. 
# Решить задачу на основе хэш-таблицы. 
# Например, для массива [-1, 2, 3, 4, 7] и заданного значения 5 выводятся индексы 1 и 2 (поскольку 2+3=5).

n = list(map(int, input().split()))

dict_n = dict()

for i in range(len(n)):
    for j in range(i + 1, len(n)):
        if n[i] + n[j] not in dict_n:
            dict_n[n[i] + n[j]] = [[i, j]]
        else:
            dict_n[n[i] + n[j]].append([i, j])

dict_n = {k: v for k, v in sorted(dict_n.items(), key=lambda x: x[0])}

print(*dict_n[int(input())])