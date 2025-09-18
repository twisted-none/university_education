def sundaram(n):
    b=list()
    a = [0] * n
    i=k=j=0
    while 3*i+1 < n:
        while k < n and j <= i:
            a[k] = 1
            j+=1
            k = i+j+2*i*j
        i+=1
        k=j=0
    
    for i in range(1,n):
          if a[i] == 0:
              b.append(2 * i + 1)
    return b

print(sundaram(int(input()))) # количество нечетных делителей