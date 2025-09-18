def umn(num1, num2):
    n1 = len(num1)
    n2 = len(num2)

    result = [0] * (n1 + n2)
    
    for i in range(n1-1, -1, -1):
        ostatok = 0
    
        for j in range(n2-1, -1, -1):
    
            product = int(num1[i]) * int(num2[j]) + ostatok
            ostatok = (result[i + j + 1] + product) // 10
            result[i + j + 1] = (result[i + j + 1] + product) % 10
    
        result[i] += ostatok
    
    while len(result) > 1 and result[0] == 0:
        result.pop(0)
    
    return ''.join(map(str, result))

number1 = input()
number2 = input()

result = umn(number1, number2)
print(result)