def shell_sort(arr):
    n = len(arr)
    gap = n // 2
 
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
 
my_array = [64, 34, 25, 12, 22, 11, 90]
shell_sort(my_array)
print("Отсортированный массив:", my_array)