# -*- coding: utf-8 -*-
import os
import json
from collections import defaultdict
from rich_section_helpers_ar import build_article_record_ar

os.makedirs("scripts/batches_ar", exist_ok=True)

with open("scripts/editorial_manifest_100_ar.json", encoding="utf-8") as f:
    manifest = json.load(f)

by_batch = defaultdict(list)
for spec in manifest:
    b = spec["batch"]
    art = build_article_record_ar(spec, b)
    by_batch[b].append(art)

for b in sorted(by_batch.keys()):
    out_path = f"scripts/batches_ar/batch_{b:02d}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(by_batch[b], f, ensure_ascii=False, indent=2)
    print(f"Generated {out_path} ({len(by_batch[b])} articles)")
