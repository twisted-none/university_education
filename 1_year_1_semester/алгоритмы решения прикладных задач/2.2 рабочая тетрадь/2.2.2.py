# Дано положительное целое число a, найдите наименьшее положительное
# целое число b, умножение каждой цифры которого равно a. 
# Например дано число а=256, для него наименьшее положительное цело b=488 (4*8*8 = 256).

n = int(input())
def simple(n):
    for i in range(2, int(n ** 0.5)):
        if n % i == 0: return 1
    return 0

s = []
while n > 1:
    x = simple(n)
    if x or n < 8:
        for i in range(9, 1, -1):
            if n % i == 0:
                s.append(str(i))
                n //= i
                break
        else:
            break
    else:
        break
if n == 1 and s != []:
    print(''.join(sorted(s)))
elif n == 1 and s == []:
    print(1)
else:
    print(0)