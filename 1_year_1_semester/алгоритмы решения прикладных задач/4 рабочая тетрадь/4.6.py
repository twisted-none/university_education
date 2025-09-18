# Напишите с использованием хэш-таблицы функцию, которая возвращает первый неповторяющийся символ в строке. 
# Например, в строке "minimum" есть 
# два неповторяющихся символа - "n" и "u ", поэтому ваша функция должна возвратить "n", так как он встречается первым. 
# Временная сложность вашей функции должна быть равна O(N).

def first_unrepeat_char(arr):
    hash_table = {}
    unrepeat_char = ''
    for i in arr:
        if i not in hash_table:
            hash_table[i] = arr.count(i)
            if hash_table[i] == 1 and not unrepeat_char:
                unrepeat_char = i
    return unrepeat_char, hash_table

arr = "minimum"
res, hash_table = first_unrepeat_char(arr)

print(res, hash_table, sep='\n')