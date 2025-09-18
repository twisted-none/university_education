# наибольший общий делитель четырех чисел метолом вычитания
def f(x):
    while len(set(x)) != 1:
        index_1 = x.index(max(x))
        index_2 = x.index(min(x))
        x[index_1] -= x[index_2]
    print(x)

x = list(map(int, input().split()))
f(x)