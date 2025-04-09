count = {"G": 44444, "Z": 444, "C": 4424, "D": 4441111}

print(max(count, key=count.get), count[max(count, key=count.get)])