import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

with open("scripts/next_f_creatine.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Search for "description_fr" or long text chunks
pos = 0
while True:
    idx = text.find("Creatine Monohydrate 150g de Real Pharm", pos)
    if idx == -1:
        break
    print(f"--- MATCH AT {idx} ---")
    print(text[max(0, idx-100):min(len(text), idx+1500)])
    pos = idx + 1
