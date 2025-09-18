

def binary_division(delimoe, delitel):
    
    chastnoe = 0
    ostatok = 0

    for i in range(31, -1, -1):
        if (ostatok + (delitel << i)) <= delimoe:
            ostatok += delitel << i
            chastnoe |= 1 << i

    ostatok = delimoe - (chastnoe * delitel)

    return chastnoe, ostatok

# Пример использования:
delimoe = int(input())
delitel = int(input())

chastnoe, ostatok = binary_division(delimoe, delitel)
print(f"Частное: {chastnoe}")
print(f"Остаток: {ostatok}")