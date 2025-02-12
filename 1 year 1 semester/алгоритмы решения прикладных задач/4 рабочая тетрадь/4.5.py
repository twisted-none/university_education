# Напишите с использованием хэш-таблицы функцию, которая принимает массив строк и возвращает первое повторяющееся значение. 
# Например, в случае с массивом ["а", "b", "с", "d", "с", "е", "f"] эта функция должна возвратить "с", 
#так как оно встречается в массиве более одного раза. Убедитесь, что сложность этой функции - O(N).

def first_repeat(arr):
    hash_table = {}
    repeated_char = ''
    for i in arr:
        if i not in hash_table:
            hash_table[i] = arr.count(i)
        else:
            if not repeated_char:
                repeated_char = i

    return repeated_char, hash_table
arr = ["а", "b", "с", "d", "с", "е", "f"]

res, hash_table = first_repeat(arr)
print(res, hash_table, sep='\n')