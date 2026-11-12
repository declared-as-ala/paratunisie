import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

content = open("scripts/protein_streamed.html", encoding="utf-8").read()
chunks = content.split("--- CHUNK ---")
ch1 = chunks[1].replace("><", ">\n<")
lines = ch1.split("\n")
print("--- CHUNK 1 LINES 220 TO 336 ---")
for idx in range(220, 336):
    print(f"{idx}: {lines[idx][:200]}")

for c in [2, 3, 4]:
    print(f"\n--- CHUNK {c} ---")
    for line in chunks[c].replace("><", ">\n<").split("\n")[:100]:
        print(line[:200])
