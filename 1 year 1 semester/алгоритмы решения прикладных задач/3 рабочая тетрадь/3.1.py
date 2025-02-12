def greatestproduct(array):
    
    max1 = max(array[0], array[1])
    max2 = min(array[0], array[1])

    for i in range(2, len(array)):
        if array[i] > max1:
            max2 = max1
            max1 = array[i]
        elif array[i] > max2:
            max2 = array[i]

    return max1 * max2

print(greatestproduct([6, 2, 3, 4, 5]))