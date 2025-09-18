# Написать программу для факторизации заданного с клавиатуры числа
#методом простого перебора (указать простые множители и их кратность).
#Для анализа числа на простоту использовать решето Эратосфена

def resheto(n):
    lst = [i for i in range(2, n + 1)]
    for i in range(len(lst)):
        for j in range(i + 1, len(lst)):
            if lst[i] != 0:
                if lst[j] % lst[i] == 0:
                    lst[j] = 0
    lst = [i for i in lst if i != 0]
    return lst

def f(n):
    lst = resheto(n)
    d = dict()
    for i in lst:
        while n % i == 0:
            if i not in d:
                d[i] = 1
            else:
                d[i] += 1
            n //= i
    return d

x = int(input())
d_osn = f(x)

print(f'{x} = ', end='')
d = list(d_osn.keys())
for i in range(len(d)):
    if d_osn[d[i]] != 1 and i != len(d) - 1:
        print(f'({d[i]} ** {d_osn[d[i]]}) * ', end='')
    elif d_osn[d[i]] != 1 and i == len(d) - 1:
        print(f'({d[i]} ** {d_osn[d[i]]})', end='')
    elif d_osn[d[i]] == 1 and i == len(d) - 1:
        print(f'{d[i]}', end='')
    else:
        print(f'{d[i]} * ', end='')