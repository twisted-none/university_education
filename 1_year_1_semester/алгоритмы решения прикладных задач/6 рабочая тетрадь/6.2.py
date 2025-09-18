def cocktail_sort(arr):
    n = len(arr)
    swapped = True
    start = 0
    end = n-1
 
    while swapped:
        swapped = False
 
        for i in range(start, end):
            if (arr[i] > arr[i + 1]):
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
 
        if (swapped == False):
            break
 
        end -= 1
 
        for i in range(end-1, start-1, -1):
            if (arr[i] > arr[i + 1]):
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
 
        start += 1
 
my_array = [64, 34, 25, 12, 22, 11, 90]
cocktail_sort(my_array)
print("Отсортированный массив:", my_array)