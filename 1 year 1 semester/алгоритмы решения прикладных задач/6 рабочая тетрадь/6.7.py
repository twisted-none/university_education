import time
import random

def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
 
def cocktail_sort(arr):
    n = len(arr)
    swapped = True
    start = 0
    end = n-1
 
    while (swapped == True):
        swapped = False
        for i in range(start, end):
            if (arr[i] > arr[i + 1]):
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        if (swapped == False):
            break
        end = end-1
        for i in range(end-1, start-1, -1):
            if (arr[i] > arr[i + 1]):
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        start = start + 1
 
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
 
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
 
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
 
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    else:
        pivot = arr[len(arr) // 2]
        less = [x for x in arr if x < pivot]
        equal = [x for x in arr if x == pivot]
        greater = [x for x in arr if x > pivot]
        return quicksort(less) + equal + quicksort(greater)
 
def measure_time(sort_function, array):
    start_time = time.time()
    sort_function(array)
    end_time = time.time()
    return end_time - start_time
 
small_array = [random.randint(1, 100) for _ in range(10)]
 
big_array = [random.randint(1, 10000) for _ in range(10000)]
 
algorithms = [
        bubble_sort,
        cocktail_sort,
        insertion_sort,
        selection_sort,
        shell_sort,
        quicksort
    ]
 
for algorithm in algorithms:
    time_small = measure_time(algorithm, small_array.copy())
    time_big = measure_time(algorithm, big_array.copy())
    print(f"{algorithm.__name__}: Маленький массив: {time_small}, Большой массив {time_big}")