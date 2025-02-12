import time
import random
 
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
 
def binary_insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
 
        left, right = 0, i - 1
        while left <= right:
            mid = (left + right) // 2
            if key < arr[mid]:
                right = mid - 1
            else:
                left = mid + 1
 
        for j in range(i - 1, left - 1, -1):
            arr[j + 1] = arr[j]
 
        arr[left] = key

my_array = [random.randint(1, 100) for _ in range(10**4)]

start_time = time.time()
insertion_sort(my_array.copy())
end_time = time.time()
print(f"Время работы обычного insertion_sort: {end_time - start_time:.6f} сек")
 
start_time = time.time()
binary_insertion_sort(my_array.copy())
end_time = time.time()
print(f"Время работы binary_insertion_sort: {end_time - start_time:.6f} сек")