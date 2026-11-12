# -*- coding: utf-8 -*-
"""
Compile 100 SEO Articles with real product matching, metadata validation,
and export KEYWORD_RESEARCH_100.csv and compiled_100_articles.json.
"""

import sys
import os
import json
import csv
import hashlib
import uuid

sys.path.append(os.path.dirname(__file__))

import data_whey_20
import data_creatine_15
import data_gainer_12
import data_vitamins_15
import data_wellness_12
import data_performance_10
import data_carnitine_8
import data_guides_8

def generate_id(prefix="seed_art_"):
    return prefix + uuid.uuid4().hex[:16]

def load_products():
    path = os.path.join(os.path.dirname(__file__), "real_products_catalog.json")
    with open(path, "r", encoding="utf-8") as f:
        products = json.load(f)
    return products

def match_products_for_article(article, catalog):
    slug = article["slug"]
    cat = article["cat_slug"]
    
    # Priority pools
    matched = []
    
    # Keyword search in product name and category
    keywords = []
    if "creatine" in slug or "creatine" in cat:
        keywords = ["créatine", "creatine", "creapure", "monohydrate"]
    elif "whey" in slug or "proteine" in cat or "isolate" in slug:
        keywords = ["isolate", "whey", "100% whey", "gold standard", "nitro-tech", "hydrolyzed"]
    elif "gainer" in slug or "masse" in slug:
        keywords = ["gainer", "mass", "hyper mass", "jumbo", "serious mass"]
    elif "vitamine" in slug or "zinc" in slug or "omega" in slug or "mineraux" in cat:
        keywords = ["vitamine", "zinc", "omega", "d3", "c 1000", "multivitamin"]
    elif "sommeil" in slug or "stress" in slug or "ashwagandha" in slug or "magnesium" in slug:
        keywords = ["ashwagandha", "magnesium", "sommeil", "melatonine", "mélatonine", "b6"]
    elif "pre-workout" in slug or "citrulline" in slug or "beta-alanine" in slug or "bcaa" in slug or "eaa" in slug or "glutamine" in slug:
        keywords = ["pre-workout", "pump", "bcaa", "eaa", "citrulline", "glutamine", "booster"]
    elif "carnitine" in slug or "cla" in slug or "the-vert" in slug or "bruleur" in slug:
        keywords = ["carnitine", "cla", "l-carnitine", "fat burner", "thermo", "ripped", "chrome"]
    else:
        keywords = ["whey", "creatine", "shaker", "omega", "vitamine"]

    # Filter catalog: first try inStock == True
    instock_pool = [p for p in catalog if p.get("inStock")]
    other_pool = [p for p in catalog if not p.get("inStock")]

    for p in instock_pool:
        name_lower = p["name"].lower()
        if any(kw in name_lower for kw in keywords):
            matched.append(p)
            if len(matched) >= 3:
                break
                
    if len(matched) < 3:
        for p in other_pool:
            name_lower = p["name"].lower()
            if any(kw in name_lower for kw in keywords):
                matched.append(p)
                if len(matched) >= 3:
                    break
                    
    # Fallback to top featured if still not enough
    if len(matched) < 3:
        for p in instock_pool[:5]:
            if p not in matched:
                matched.append(p)
            if len(matched) >= 3:
                break

    return matched[:3]

def main():
    print("Collecting all 100 article definitions...")
    raw_articles = (
        data_whey_20.get_whey_articles() +
        data_creatine_15.get_creatine_articles() +
        data_gainer_12.get_gainer_articles() +
        data_vitamins_15.get_vitamins_articles() +
        data_wellness_12.get_wellness_articles() +
        data_performance_10.get_performance_articles() +
        data_carnitine_8.get_carnitine_articles() +
        data_guides_8.get_guides_articles()
    )

    assert len(raw_articles) == 100, f"Expected 100 articles, got {len(raw_articles)}"
    print(f"Total raw articles: {len(raw_articles)}")

    catalog = load_products()
    print(f"Loaded {len(catalog)} products from catalog.")

    compiled = []
    csv_rows = []

    for idx, art in enumerate(raw_articles, start=1):
        art_id = generate_id("seed_art_")
        slug = art["slug"]
        title = art["title"]
        h1 = art["h1"]
        target_kw = art["target_kw"]
        sec_kws = art["sec_kws"]
        excerpt = art["excerpt"].strip()
        
        # Strictly truncate meta description to 255 chars if needed
        if len(excerpt) > 255:
            excerpt = excerpt[:251] + "..."
            
        category = art["category"]
        cat_slug = art.get("cat_slug", "conseils")
        author = art.get("author", "Dr. Yassine Ben Amor (Pharmacien)")
        reviewer = art.get("reviewer", "Sarra Mejri (Nutritionniste du Sport)")
        read_time = art.get("read_time", "6 min")

        # Assemble JSON content blocks
        # First block is an introduction paragraph answering the query
        content_blocks = [
            {"type": "heading", "level": 1, "text": h1},
            {"type": "paragraph", "text": excerpt}
        ]

        # Add section blocks
        for sec_title, sec_body in art["sections"]:
            content_blocks.append({"type": "heading", "level": 2, "text": sec_title})
            content_blocks.append({"type": "paragraph", "text": sec_body})

        # Match real products
        matched_products = match_products_for_article(art, catalog)
        art_products = []
        prod_names = []
        for pos, prod in enumerate(matched_products):
            art_products.append({
                "id": generate_id("seed_ap_"),
                "productId": prod["id"],
                "productSlug": prod["slug"],
                "productName": prod["name"],
                "brandName": prod.get("brand_name", ""),
                "priceMillimes": prod.get("price_millimes", 0),
                "inStock": prod.get("inStock", True),
                "rationale": f"Recommandé par nos experts pour {target_kw} en Tunisie.",
                "position": pos
            })
            prod_names.append(f"{prod['name']} ({prod.get('brand_name', '')})")

        # Format FAQs
        art_faqs = []
        for pos, (q, a) in enumerate(art.get("faqs", [])):
            art_faqs.append({
                "id": generate_id("seed_af_"),
                "question": q,
                "answer": a,
                "position": pos
            })

        # Construct full article record
        featured_image = f"/assets/blog/{slug}.webp"
        canonical_url = f"https://paratunisie.com/conseils/{slug}"
        image_alt = f"{title} - Guide nutrition ParaTunisie"
        image_prompt = f"Professional studio photography of sports nutrition supplement, {target_kw}, clean modern background, premium pharmacy lighting, 8k resolution"

        compiled_item = {
            "id": art_id,
            "slug": slug,
            "title": title,
            "h1": h1,
            "excerpt": excerpt,
            "category": category,
            "cat_slug": cat_slug,
            "readTime": read_time,
            "date": "28 Octobre 2026",
            "content": json.dumps(content_blocks, ensure_ascii=False),
            "authorName": author,
            "expertReviewer": reviewer,
            "featuredImage": featured_image,
            "canonicalUrl": canonical_url,
            "indexable": True,
            "metaDescription": excerpt,
            "ogTitle": title,
            "ogDescription": excerpt,
            "ogImage": featured_image,
            "seoTitle": f"{title} | ParaTunisie",
            "status": "DRAFT",
            "targetKeyword": target_kw,
            "imagePrompt": image_prompt,
            "imageAlt": image_alt,
            "products": art_products,
            "faqs": art_faqs
        }
        compiled.append(compiled_item)

        # CSV row
        search_intent = "Commercial Investigation" if any(k in slug for k in ["prix", "avis", "meilleur", "comparatif", "guide"]) else "Informational"
        internal_link = f"https://paratunisie.com/{cat_slug}"
        csv_rows.append({
            "Article_Number": idx,
            "Category": category,
            "Target_Keyword": target_kw,
            "Secondary_Keywords": " | ".join(sec_kws),
            "Search_Intent": search_intent,
            "Slug": slug,
            "SEO_Title": f"{title} | ParaTunisie",
            "Meta_Description": excerpt,
            "Target_Internal_Category_URL": internal_link,
            "Matched_Products": " ; ".join(prod_names)
        })

    # Save compiled JSON
    json_path = os.path.join(os.path.dirname(__file__), "compiled_100_articles.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(compiled, f, ensure_ascii=False, indent=2)
    print(f"Saved compiled JSON: {json_path} ({len(compiled)} articles)")

    # Save CSV
    csv_path = "c:/Users/Ala/Desktop/parapharmacie/KEYWORD_RESEARCH_100.csv"
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        fieldnames = [
            "Article_Number", "Category", "Target_Keyword", "Secondary_Keywords",
            "Search_Intent", "Slug", "SEO_Title", "Meta_Description",
            "Target_Internal_Category_URL", "Matched_Products"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)
    print(f"Saved CSV deliverable: {csv_path} ({len(csv_rows)} rows)")

if __name__ == "__main__":
    main()
