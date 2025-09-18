from random import randint

def gen(x):
    for _ in range(10):
        x = str(x**2)
        x = int(x[1:6])
        if len(str(x)) < 5:
            x = str(x).ljust(5, str(randint(1, 10)))
        x = int(x)
        print(x)
gen(int(input())) # вводим число для генерации