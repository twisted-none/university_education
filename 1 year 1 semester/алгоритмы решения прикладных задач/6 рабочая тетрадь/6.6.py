def quicksort(arr):
    if len(arr) <= 1:
        return arr
    else:
        pivot = arr[len(arr) // 2]
        less = [x for x in arr if x < pivot]
        equal = [x for x in arr if x == pivot]
        greater = [x for x in arr if x > pivot]
        return quicksort(less) + equal + quicksort(greater)
 
my_array = [64, 34, 25, 12, 22, 11, 90]
sorted_array = quicksort(my_array)
print("Отсортированный массив:", sorted_array)