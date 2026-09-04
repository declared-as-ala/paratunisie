import re
import json
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

with open("scripts/next_f_creatine.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Look for full product JSON or HTML description
desc_match = re.search(r'💥\s*CREATINE MONOHYDRATE.*?(?=\\n\\n|<|")', text, re.DOTALL)
if desc_match:
    print("=== EXTRACTED DESCRIPTION CHUNK ===")
    print(desc_match.group(0)[:1000])

# Search for all mentions of description or Real Pharm
print("\n=== ALL REAL PHARM TEXTS ===")
for m in re.finditer(r'(Real Pharm.*?)(?="|\})', text, re.IGNORECASE):
    print("-", m.group(1)[:200])

# Search for flavors / aromas / variations
aromes = re.findall(r'(Pomme|Citron|Orange|Neutre|Sans saveur|Fruit Punch|Pastèque|Cola|Blue Raspberry|Nature|Watermelon|Lemon)', text, re.IGNORECASE)
print("\n=== FOUND AROMES ===")
print(set(aromes))
