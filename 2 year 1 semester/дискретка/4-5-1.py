a = int(input())
b = int(input())

xor_result = a ^ b

hamming_distance = 0
print(bin(a)[2:])
print(bin(b)[2:])

print(f"Кодовое расстояние: {bin(xor_result)[2:].count('1')} ")

while xor_result:
    hamming_distance += xor_result & 1
    xor_result >>= 1

print(f"Кодовое расстояние: {hamming_distance}")