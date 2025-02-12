#Дан целочисленный массив nums. Постройте целочисленный массив counts, где counts[i]— количество меньших элементов справа от nums[i].
#Пример:
#Ввод: nums = [5,2,6,1]
#Вывод: [2,1,1,0]
#Объяснение: 
#Справа от 5 находятся 2 меньших элемента (2 и 1).
#Справа от 2 находится только 1 элемент меньшего размера (1).
#Справа от 6 находится 1 элемент поменьше (1).
#Справа от 1 находится 0 элементов меньшего размера.

def binary_search(srt_lst, n):
        l, r = 0, len(srt_lst) - 1
        while l <= r:
            m = l + (r - l) // 2
            if srt_lst[m] < n:
                l = m + 1
            else:
                r = m - 1
        return l

def count_nums(nums):
    
    counts = []
    srt_lst = []
    
    for num in reversed(nums):
        i = binary_search(srt_lst, num)
        counts.append(i)
        srt_lst.insert(i, num)
    
    return list(reversed(counts))

# Пример использования:
nums = [9, 7, 6, 1]
result = count_nums(nums)
print(result)  # Вывод: [2, 1, 1, 0]
