alph = 'АБОРС'

count = 0

for i1 in alph:
    for i2 in alph:
        for i3 in 'АБОС':
            for i4 in 'АБОС':
                word = i1 + i2 + i3 + i4
                count += 1

print(count)