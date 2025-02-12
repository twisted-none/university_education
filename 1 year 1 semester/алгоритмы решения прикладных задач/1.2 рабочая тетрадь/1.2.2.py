#Массив arr называется горным, если выполняются следующие свойства:
#1)	В массиве не менее трех элементов
#2)	Существуют i (0 < i < arr.length – 1) что:
#	arr[0] < arr[1] < ... < arr[i - 1] < arr[i] 
#	arr[i] > arr[i + 1] > ... > arr[arr.length - 1]
#Иными словами, в массиве есть пик (или несколько пиков) такие, что остальные элементы убывают влево и вправо относительно пика.
#Используя алгоритм бинарного поиска, проверить, является ли массив arr горным. Если да – вернуть индекс первого пика.

def find_peak(arr):
    left, right = 0, len(arr) - 1

    while left < right:
        mid = left + (right - left) // 2

        if arr[mid] > arr[mid + 1]:
            right = mid
        else:
            left = mid + 1

    return left if left > 0 and left < len(arr) - 1 else -1

def is_mountain_array(arr):
    if len(arr) < 3:
        return False

    peak_index = find_peak(arr)

    return peak_index != -1

# Пример использования:
arr = [1, 3, 5, 4, 2]
if is_mountain_array(arr):
    peak_index = find_peak(arr)
    print(f"Массив является горным. Индекс первого пика: {peak_index}")
else:
    print("Массив не является горным.")
