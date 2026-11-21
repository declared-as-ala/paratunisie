# -*- coding: utf-8 -*-
import json

ARTIFACT_PATH = r"C:\Users\Ala\.gemini\antigravity\brain\ae7eb5e6-b2db-4c0c-9bed-751c188888bf\seo_100_articles_ar_report.md"

with open("scripts/editorial_manifest_100_ar.json", encoding="utf-8") as f:
    manifest = json.load(f)

lines = [
    "# تقرير نشر 100 مقال SEO بالدارجة التونسية — ParaTunisie",
    "",
    "> [!NOTE]",
    "> تم نشر **100 مقال جديد بالدارجة التونسية** بنجاح وإضافتها إلى المقالات الـ 149 الموجودة سابقاً ليصبح المجموع **249 مقالاً منشوراً** في قاعدة البيانات (`PUBLISHED`).",
    "",
    "## ملخص التحقق المباشر (Live Verification)",
    "",
    "- **إجمالي المقالات المنشورة في PostgreSQL:** `249` (149 فرنسي + 100 بالدارجة التونسية)",
    "- **خريطة الموقع (`sitemap.xml`):** `100/100` رابط عربي تونسي متوفر (`HTTP 200`)",
    "- **الفحص المباشر للروابط الـ 100 (`verify_100_articles_ar_live.py`):** `100/100 PASS` (`200 OK`، `dir=\"rtl\"`، `inLanguage: \"ar-TN\"`، `H1 = 1`، `self-canonical`، `Article` + `FAQPage` JSON-LD، رابط الفئة الأم، وصورة WebP `1200x675` بحالة `200 OK`)",
    "- **فحص تراجع السيو (`npm run seo:check`):** `807/807 checks passed` ضد `https://paratunisie.com`",
    "- **تحديثات الواجهة الأمامية (Frontend & RTL):**",
    "  - دعم الاتجاه من اليمين إلى اليسار (`dir=\"rtl\" lang=\"ar-TN\"`) في `src/app/conseils/[slug]/page.tsx`",
    "  - فلتر لغة (`الكل` / `Français` / `🇹🇳 بالدارجة التونسية`) ودعم `rtl` في بطاقات المقالات ضمن `src/components/blog/blog-hub-client.tsx`",
    "  - وسم `inLanguage: \"ar-TN\"` في `buildArticleSchema` ضمن `src/lib/seo/schema.ts`",
    "",
    "## جدول المقالات الـ 100 المنشورة بالدارجة التونسية",
    "",
    "| # | العنوان | الفئة | الكلمة المفتاحية | عدد الكلمات | الرابط المباشر |",
    "|---:|---|---|---|---:|---|",
]

for m in manifest:
    idx = m["index"]
    title = m["title"].replace("|", "—")
    cluster = m["cluster"]
    kw = m["primary_keyword"].replace("|", "—")
    wc = m.get("word_count", "-")
    slug = m["slug"]
    url = f"https://paratunisie.com/conseils/{slug}"
    lines.append(f"| {idx} | {title} | {cluster} | `{kw}` | {wc} | [{slug}]({url}) |")

with open(ARTIFACT_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print(f"Wrote {ARTIFACT_PATH} with {len(manifest)} rows.")
