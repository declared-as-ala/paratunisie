# Competitor benchmarking — Tunisia (evidence and limits)

## How this was produced
- Competitors were identified from live web-search results for the target queries ("whey protein tunisie prix", "magnésium tunisie prix", "compléments alimentaires tunisie", "parapharmacie en ligne tunisie", "nutrition sportive tunisie").
- **Limit:** the search tool is US-based, so it cannot show the exact Tunisian SERP or our rank against each competitor. Position claims below come only from our own Search Console data. Technical facts come from one public GET per page (`ops/seo/competitor_snapshot.py`, `docs/seo/COMPETITOR_SNAPSHOT.json`) on 2026-11-14. Re-run it to refresh.
- No competitor traffic or backlink figures are claimed: no tool for those was available.

## Who actually appears for our queries
| Competitor | Type | Evidence |
|---|---|---|
| **primini.tn** | Price-comparison engine | Dominates price/product queries in the results (magnésium, whey, zinc). Lists **1,662** vitamin/supplement products across shops. |
| **Parapharmacie.tn**, **Parapharm.tn**, **Para Pharmacie Express**, **Parapharmacie plus**, **Tunisiepara.com**, **lagrandepara.tn** | Online parapharmacies | Appear for supplements; Parapharm.tn advertises 24–48 h delivery and cash on delivery (same promise as ours). |
| **impactnutrition.com.tn** | Sports-nutrition brand + shop | Appears for whey/impact queries; has a physical showroom. |
| Foreign shops (Atida, nu3, Fitnessboutique, Decathlon, desertcart) | Not Tunisian | Appear in results but do not target Tunisia. Not direct competitors. |

## Technical snapshot (public pages, 2026-11-14)
| Page | TTFB | HTML | Visible words | H1 | H2 | Links | Schema |
|---|---|---|---|---|---|---|---|
| paratunisie `/vitamines` | 1.11 s | 44 KB | 2,057 | 1 | 10 | 204 | BreadcrumbList, CollectionPage, FAQ answers |
| paratunisie `/magnesium` | 0.88 s | 43 KB | 1,977 | 1 | 10 | 142 | same |
| paratunisie `/whey-proteine` | 0.90 s | 42 KB | 1,644 | 1 | 7 | 123 | BreadcrumbList, CollectionPage |
| primini (vitamines+compl.) | 0.94 s | 46 KB | 1,038 | 1 | 5 | 78 | BreadcrumbList, **FAQPage, ItemList** |
| primini (alimentation du sportif) | 0.53 s | 43 KB | 1,297 | 1 | 8 | 39 | BreadcrumbList, **FAQPage, ItemList** |
| parapharmacie.tn (home) | 1.00 s | 71 KB | 2,834 | 1 | 21 | 329 | OnlineStore, Person, ImageObject |
| parapharm.tn (home) | 0.92 s | 55 KB | 3,825 | 1 | 22 | 419 | OnlineStore (no canonical) |
| tunisiepara.com (home) | 0.79 s | 152 KB | 16,917 | 0 | 6 | 1,576 | Organization, BreadcrumbList |
| impactnutrition.com.tn (home) | 1.19 s | 89 KB | 689 | 0 | 18 | 82 | Organization, SearchAction |
| lagrandepara.tn | 403 to automated requests | – | – | – | – | – | not measurable |

Reading: our server response time is **in line with competitors, not worse** (0.5–1.2 s all round). Our category pages now carry as much or more on-page text than primini's comparison pages and have valid structured data. We have no performance lead, however; see the Core Web Vitals results below.

## Gap analysis (what separates us from ranking)
1. **Authority, not markup.** We rank 60–95 for the head terms with equal technical hygiene. The gap is link/brand authority and depth: primini aggregates 1,662 supplement listings from several online pharmacies; the parapharmacies listed above are established shops (Parapharmacie.tn says it was created in 2019). We cannot out-aggregate them; we can out-specialise on sports nutrition and imported brands (NOW, Swanson, Optimum, Dymatize …) that Tunisian pharmacies rarely stock.
2. **Intent coverage.** Competitors rank on **price comparison** and **brand + product**. Our unique angle is imported sports-nutrition and supplements with cash on delivery and 24–48 h delivery. Pages that should capture it: category hubs (done for 9), product pages for brand+product queries (301 product URLs are now indexable and in the sitemap; Google has not confirmed indexing).
3. **Trust signals.** Business News (May 2026) reports legal action over ~60 online supplements and warns that some sold online contain active drugs. A visible compliance/authenticity stance is a differentiator: we already have `/authenticite`, `/politique-editoriale`, `/retours`. Action: link these from category pages (without unverifiable claims) and keep restricted compounds off indexed pages (gate added).
4. **FAQ/ItemList structured data.** Primini ships FAQPage + ItemList on category pages; we now ship FAQPage + ItemList + BreadcrumbList on the rewritten categories.
5. **Internal linking.** Competitor home pages carry 300–1,500 links; our category pages 120–200. Done this batch: category ↔ guide links. Next: hub pages → all child categories; product pages → parent category and sibling brand.
6. **Performance.** No competitor advantage to copy; our lab mobile score is poor (see below). Fixing it is a ranking and conversion lever, not a catch-up.

## What would not work
- Redirecting old dermo-pharmacy URLs to our categories (no equivalent products, soft-404 risk).
- Mass-indexing the 11,124 clean-but-on-order products: they dilute quality and mostly cannot be bought immediately.
- Competing with primini on price comparison.

## Next competitive actions (ordered)
1. Finish hub copy for `/complements-alimentaires` and `/nutrition-sportive` (211 + 136 impressions already, rank 64–77).
2. Rewrite `/creatine` and `/whey-proteine` (highest measured demand; legacy 400-char copy).
3. Add guides for categories with demand but no guide (collagène, probiotiques).
4. Link authenticity/compliance pages from categories.
5. Re-run `competitor_snapshot.py` monthly; add a rank tracker (GSC position is the only source today).
