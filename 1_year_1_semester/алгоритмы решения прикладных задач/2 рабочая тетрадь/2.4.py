x = int(input())
num = 2 ** x - 1

def test(x):
    if x == 1: return 4
    else: return test(x-1) ** 2 - 2

print('yes' if test(x-1) % num == 0 else 'no')