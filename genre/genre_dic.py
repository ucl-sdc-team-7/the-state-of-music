import csv
from collections import defaultdict
D=defaultdict(list)
csvfile=open('genre-list.csv')
reader= csv.DictReader(csvfile)  # Dictreader uses the first row as dictionary keys
for l in reader:                 # each row is in the form {k1 : v1, ... kn : vn}
    for k,v in l.items():  
        if v != '':
            D[k].append(v)
