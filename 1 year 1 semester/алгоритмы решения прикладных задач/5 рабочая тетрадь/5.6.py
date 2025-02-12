# У нас есть список с числами и другими списками, в которых тоже есть числа и списки:
# Напишите на Python рекурсивную функцию, которая выводит все числа (только числа). 

def find_all_numbers(lst, lst_new=None):
    if lst_new is None:
        lst_new = []

    if len(lst) != 0:
        if isinstance(lst[0], int):
            lst_new.append(lst[0])
        else:
            find_all_numbers(lst[0], lst_new)
    else:
        return lst_new
    return find_all_numbers(lst[1:], lst_new)

print(find_all_numbers([1, [2, 3, 4], [5, [6, [7, [8, 9]]]], 10]))