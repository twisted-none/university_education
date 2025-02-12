def umn(num1, num2):
    n1 = len(num1)
    n2 = len(num2)
    result = [0] * (n1 + n2)
    for i in range(n1-1, -1, -1):
        carry = 0
        for j in range(n2-1, -1, -1):
            product = int(num1[i]) * int(num2[j]) + carry
            carry = (result[i + j + 1] + product) // 10
            result[i + j + 1] = (result[i + j + 1] + product) % 10
        result[i] += carry
    while len(result) > 1 and result[0] == 0:
        result.pop(0)
    return ''.join(map(str, result))

def karatsuba_method(first_num, second_num):
    str_first_num = str(first_num)
    str_second_num = str(second_num)

    if len(str_first_num) == 1 or len(str_second_num) == 1:
        return first_num * second_num

    n = max(len(str_first_num), len(str_second_num))
    half_n = n // 2

    a = first_num // 10 ** half_n
    b = first_num % (10 ** half_n)
    c = second_num // 10 ** half_n
    d = second_num % (10 ** half_n)

    ac = karatsuba_method(a, c)
    bd = karatsuba_method(b, d)
    ad_bc = karatsuba_method(a + b, c + d) - ac - bd

    result = ac * 10 ** (2 * half_n) + (ad_bc * 10 ** half_n) + bd
    return result

num1 = int(input())
num2 = int(input())
result_karatsuba = karatsuba_method(num1, num2)
result_stolbik = umn(str(num1), str(num2))


print(f"Умножение (Карацуба): {result_karatsuba}")
print(f"Умножение (Столбик): {result_stolbik}")