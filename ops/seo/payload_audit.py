"""Measures which JSON fields dominate the serialized (RSC) payload inside a saved page.
usage: python ops/seo/payload_audit.py page.html
"""
import re
import sys

html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
print("total KB:", len(html) // 1024)
# Next.js embeds JSON inside JS strings, so quotes appear escaped as \"
for key in ["description", "seoDescription", "seoContent", "seoIntro", "ogDescription", "ogImage", "seoTitle",
            "seoKeywords", "benefit", "usage", "variants", "images", "seoFaq", "name"]:
    pattern = re.compile(r'\\"' + key + r'\\":\\"(.*?)\\"(?:,|\})')
    vals = pattern.findall(html)
    print(f"{key:16} occurrences={len(vals):4} approx KB={sum(len(v) for v in vals) // 1024}")
scripts = re.findall(r"<script[^>]*>[\s\S]*?</script>", html)
print("inline <script> KB:", sum(len(s) for s in scripts) // 1024)
