# Вам предоставляется отсортированный целочисленный массив arr, содержащий 1 и простые числа, где все целые числа arr уникальны. Вам также дается целое число k.
# Для каждых i и j, где 0 <= i < j < длина arr, мы рассматриваем дробь arr[i] / arr[j].
# Посчитайте k-ю наименьшую рассматриваемую дробь для массива arr. Представьте ответ в виде массива целых чисел размером 2, где answer[0] == arr[i] и answer[1] == arr[j].
# Оцените сложность получившегося алгоритма. 

n, k = list(map(int, input().split())), int(input())

lst_of_fractions = []

for i in range(0, len(n) - 1):
    for j in range(i + 1, len(n)):
        lst_of_fractions.append([n[i]/n[j], n[i], n[j]])

lst_of_fractions = sorted(lst_of_fractions, key=lambda x: x[0])

print(lst_of_fractions[k-1][1:])
print(round(lst_of_fractions[k-1][0], 3))