# Blog cover sourcing task (ParaTunisie, French health & sports-nutrition store)

For EACH article in your group file, find ONE real, relevant, premium editorial photograph on Pexels (preferred) or Unsplash/Pixabay, download it, verify it, and save an optimized cover.

## Method (use only these steps)
1. WebSearch with `allowed_domains` = ["pexels.com"] (then unsplash.com / pixabay.com if nothing suitable) and a precise English query for the article's subject. Result URLs look like https://www.pexels.com/photo/<description>-<ID>/ .
2. Download ONLY the image CDN file by ID: `https://images.pexels.com/photos/<ID>/pexels-photo-<ID>.jpeg?auto=compress&cs=tinysrgb&w=1920` (curl, plain default user agent). For Unsplash use the photo's images.unsplash.com URL only if you can read it from a search result; otherwise skip Unsplash. Do not scrape, do not spoof browsers, do not use any site that returns 403.
3. LOOK at every candidate with the Read tool (make a small preview JPEG first). Accept only if: sharp, well composed, natural soft lighting, relevant to the article subject, NO text, NO visible brand names/logos/packaging labels, NO watermark, no before/after, nothing implying a medical outcome. Reject and search again otherwise. People are allowed only when relevant (e.g. sport), natural and non-explicit.
4. Convert with Pillow: crop to 16:9 centered (keep the subject), resize to 1600x900, save WebP quality 78 to `C:/Users/Ala/Desktop/parapharmacie/ops/blog-covers/work/out/<slug>.webp` (target < 200 KB; lower quality if larger). Use Python with `-I` is NOT needed for your own script. Download raw files to `C:/Users/Ala/Desktop/parapharmacie/ops/blog-covers/work/raw/<slug>.jpg`.
5. Each article needs a DIFFERENT photo (no photo ID reused across the whole project; other agents handle other groups, so also prefer distinctive subjects).

## Content rules
- Match the TITLE, not a supplement brand. Examples: iron+vitamin C -> citrus + spinach/lentils/peppers; creatine -> scoop of white powder / gym context without brand; whey -> protein shake/shaker in training context; magnesium -> nuts and seeds, leafy greens; omega-3 -> salmon/fish, walnuts; collagen -> neutral skincare/nutrition scene; probiotics -> yogurt/fermented foods; sleep -> calm bedroom; authenticity -> hands inspecting a plain bottle/label (no readable brand); storage in heat -> kitchen cabinet/pantry shelf with plain jars; price comparison -> calculator/notebook with groceries or shopping.
- Never imply the pictured food/product contains the supplement discussed unless accurate.

## Output
Write `C:/Users/Ala/Desktop/parapharmacie/ops/blog-covers/work/result_<group>.json`: a list of objects
{"slug","file":"<slug>.webp","provider":"Pexels|Unsplash|Pixabay","photo_id","photo_page_url","photographer","license":"Pexels License|Unsplash License|Pixabay Content License","alt_fr":"description française factuelle de ce que montre la photo (pas de promesse santé), 8-18 mots","bytes","verified_no_text":true}
Be honest: if you could not find an acceptable photo for a slug, omit it and list it under a separate key in a second file result_<group>_missing.json with the reason. Take photographer names from the Pexels photo page (WebSearch result titles/description may include it; if you cannot determine the photographer, put "unknown"). Do not invent data.
Report back: count done, count missing, any problems.
