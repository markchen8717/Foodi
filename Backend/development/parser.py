import re
import json
in_lst = []
with open('nut.txt','r') as f:
    in_lst = f.readlines()
out_lst = []
for word in in_lst:
    word = word.strip()
    word = re.sub(r'\([^)]*\)', '', word)
    word = re.sub(r'\[[^]]*\]', '', word)
    out_lst.append(word)
with open("new_data.json", "w") as write_file:
    json.dump(out_lst, write_file, indent=4)