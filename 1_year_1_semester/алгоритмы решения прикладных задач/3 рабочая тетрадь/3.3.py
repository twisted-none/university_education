def binary_addition(num1, num2):
    max_len = max(len(num1), len(num2))
    num1 = num1.zfill(max_len)
    num2 = num2.zfill(max_len)

    ostatok = 0
    result = []

    for i in range(max_len - 1, -1, -1):
        bit_sum = int(num1[i]) + int(num2[i]) + ostatok
        result.insert(0, str(bit_sum % 2))
        ostatok = bit_sum // 2

    if ostatok:
        result.insert(0, str(ostatok))

    return int(''.join(result), 2)

# Пример использования
bin_num1 = bin(int(input()))[2:]
bin_num2 = bin(int(input()))[2:]
result = binary_addition(bin_num1, bin_num2)
print(result)