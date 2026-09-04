import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

with open("scripts/next_f_creatine.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Find the HTML description section
match = re.search(r'<h1><strong>💥.*?</div>', text)
if match:
    clean_html = match.group(0).encode('utf-8').decode('unicode_escape', 'ignore')
    print("=== FULL PRODUCT DESCRIPTION HTML ===")
    print(clean_html)
else:
    # Look for "Optimisez vos performances"
    idx = text.find("Optimisez vos performances")
    if idx != -1:
        print(text[idx-50:idx+2500])
