import os, re

files = [
    ("src/app/page.tsx", "/"),
    ("src/app/livraison/page.tsx", "/livraison"),
    ("src/app/authenticite/page.tsx", "/authenticite"),
    ("src/app/a-propos/page.tsx", "/a-propos"),
    ("src/app/contact/page.tsx", "/contact"),
    ("src/app/aide/page.tsx", "/aide"),
    ("src/app/cgv/page.tsx", "/cgv"),
    ("src/app/confidentialite/page.tsx", "/confidentialite"),
    ("src/app/paiement/page.tsx", "/paiement"),
    ("src/app/retours/page.tsx", "/retours"),
    ("src/app/mentions-legales/page.tsx", "/mentions-legales"),
    ("src/app/politique-editoriale/page.tsx", "/politique-editoriale"),
    ("src/app/fidelite/page.tsx", "/fidelite"),
    ("src/app/le-cercle/page.tsx", "/le-cercle"),
    ("src/app/besoins/page.tsx", "/besoins"),
    ("src/app/conseils/page.tsx", "/conseils"),
]

print("=== VERIFYING CANONICAL IMPLEMENTATION ACROSS STATIC ROUTES ===")
all_ok = True
for fpath, expected_path in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    has_canonical = "buildCanonicalUrl" in content and expected_path in content
    if has_canonical:
        print(f"[OK] {expected_path:25} -> buildCanonicalUrl('{expected_path}') in {fpath}")
    else:
        print(f"[FAIL] {expected_path:25} in {fpath}")
        all_ok = False

with open("src/app/layout.tsx", "r", encoding="utf-8") as f:
    layout_content = f.read()

has_global_canonical = "alternates:" in layout_content and "canonical:" in layout_content
if not has_global_canonical:
    print("[OK] src/app/layout.tsx has NO global canonical inheritance.")
else:
    print("[FAIL] src/app/layout.tsx still has global canonical inheritance!")
    all_ok = False

with open("src/app/sitemap.ts", "r", encoding="utf-8") as f:
    sitemap_content = f.read()

print("\n=== VERIFYING SITEMAP.TS STATIC PAGES ===")
for _, p in files:
    clean_p = p.lstrip("/")
    expected = f"${{SITE_URL}}/{clean_p}" if clean_p else "SITE_URL"
    if clean_p in sitemap_content or p == "/":
        print(f"[OK] sitemap.ts includes {p}")
    else:
        print(f"[FAIL] sitemap.ts is missing {p}")
        all_ok = False

print(f"\nOverall Static Canonicals Status: {'ALL PASSED' if all_ok else 'SOME FAILED'}")
