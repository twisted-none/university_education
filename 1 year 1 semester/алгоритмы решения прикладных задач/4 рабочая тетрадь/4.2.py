n = input()

dict_of_n = dict()

for i in n:
    if i not in dict_of_n:
        dict_of_n[i] = n.count(i)
print(dict_of_n)