def make_arr(num):
    return [int(i) for i in str(num)]

def plus(num1, num2):
    arr1 = make_arr(num1)
    arr2 = make_arr(num2)

    result = []
    ostatok = 0
    while arr1 or arr2:
        d1 = arr1.pop() if arr1 else 0
        d2 = arr2.pop() if arr2 else 0
        summ = d1 + d2 + ostatok
        result.insert(0, summ % 10)
        ostatok = summ // 10

    if ostatok:
        result.insert(0, ostatok)

    return int(''.join(map(str, result)))

def minus(num1, num2):
    arr1 = make_arr(num1)
    arr2 = make_arr(num2)

    sign = 1
    if num1 < num2:
        sign = -1
        arr1, arr2 = arr2, arr1

    result = []
    borrow = 0
    
    while arr1 or arr2:
        d1 = arr1.pop() if arr1 else 0
        d2 = arr2.pop() if arr2 else 0
        difference = d1 - d2 - borrow
    
        if difference < 0:
    
            difference += 10
            borrow = 1
    
        else:
            borrow = 0
    
        result.insert(0, difference)

    while result[0] == 0 and len(result) > 1:
        result.pop(0)

    return sign * int(''.join(map(str, result)))

# Пример использования:
num1 = int(input())
num2 = int(input())
sum_result = plus(num1, num2)
diff_result = minus(num1, num2)

print(f"Сумма: {sum_result}")
print(f"Разность: {diff_result}")
