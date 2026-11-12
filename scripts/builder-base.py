# -*- coding: utf-8 -*-
import json
import os
import sys

# Load framework and product catalog
sys.path.append("c:/Users/Ala/Desktop/parapharmacie/scripts")
from collections import Counter

with open("c:/Users/Ala/Desktop/parapharmacie/scripts/real_products_catalog.json", "r", encoding="utf-8") as f:
    products_catalog = json.load(f)

by_cat = {}
for p in products_catalog:
    c = p.get("category_slug")
    if c not in by_cat:
        by_cat[c] = []
    by_cat[c].append(p)

def match_products(category_slug, keywords, count=2):
    pool = by_cat.get(category_slug, [])
    if not pool:
        for fallback in ["whey-proteine", "creatine", "vitamines", "magnesium", "nutrition-sportive"]:
            if fallback in by_cat:
                pool.extend(by_cat[fallback][:10])
    
    scored = []
    kws = [k.lower() for k in keywords if len(k) > 2]
    for p in pool:
        score = 0
        name_lower = p["name"].lower()
        for kw in kws:
            if kw in name_lower:
                score += 3
        if p.get("inStock"):
            score += 4
        scored.append((score, p))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [{"id": item[1]["id"], "slug": item[1]["slug"], "name": item[1]["name"], "brand": item[1].get("brand_name", "")} for item in scored[:count]]

articles = []

def make_article(slug, category, cat_slug, title, h1, target_kw, sec_kws, excerpt, author, reviewer, read_time, sections, faqs):
    prods = match_products(cat_slug, [target_kw] + sec_kws, count=2)
    meta_desc = excerpt
    if len(meta_desc) > 250:
        meta_desc = meta_desc[:247] + "..."
    
    content_blocks = []
    for heading, paragraph in sections:
        content_blocks.append({"type": "heading", "text": heading})
        content_blocks.append({"type": "paragraph", "text": paragraph})
        
    return {
        "slug": slug,
        "title": title,
        "h1": h1,
        "category": category,
        "category_slug": cat_slug,
        "targetKeyword": target_kw,
        "secondaryKeywords": sec_kws,
        "excerpt": excerpt,
        "seoTitle": f"{title} | ParaTunisie",
        "metaDescription": meta_desc,
        "canonicalUrl": f"https://paratunisie.com/conseils/{slug}",
        "ogTitle": title,
        "ogDescription": meta_desc,
        "featuredImage": f"/assets/blog/{slug}.webp",
        "imageAlt": title,
        "authorName": author,
        "expertReviewer": reviewer,
        "readTime": read_time,
        "date": "2026-10-29",
        "status": "DRAFT",
        "indexable": True,
        "content": json.dumps(content_blocks, ensure_ascii=False),
        "products": prods,
        "faqs": [{"question": q, "answer": a, "position": idx + 1} for idx, (q, a) in enumerate(faqs)]
    }

print("Base builder script created.")
