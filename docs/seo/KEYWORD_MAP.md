# Keyword → URL map (current catalogue)

Method and limits (read first):
- **Demand evidence** = our own Search Console impressions over 90 days (2026-08-14 → 2026-11-12), `docs/seo/GSC_OPPORTUNITIES.json`. They understate real search volume because we rank at positions 40–95 for these terms. No paid keyword tool was available, so no monthly-volume numbers are invented. "n/d" = no measurable impression yet.
- **One primary intent per URL.** Categories own transactional queries ("… tunisie", "prix", "acheter"). Guides in `/conseils/*` own informational queries ("comment choisir", "quand prendre", "bienfaits"). Guides link up to their category; categories link down to the guides.
- Status: ✅ indexable now · ⏳ content ready, held (few in-stock/verified products) · ⛔ blocked (legal/claims review).

| URL | Primary query (intent) | Evidence (90d impr, avg pos) | Secondary queries | Supporting guides (informational owner) | Status / note |
|---|---|---|---|---|---|
| `/complements-alimentaires` | complément alimentaire tunisie (browse hub) | 211 impr, pos 64–66 | compléments alimentaires, vitamines et compléments | all `/conseils/*` | ✅ hub; ranks, no clicks. Needs hub copy + links to every child category |
| `/nutrition-sportive` | nutrition sportive tunisie (browse hub) | 136 impr, pos 67–77 | produits musculation tunisie | `prise-de-masse-tunisie-guide`, `complements-musculation-debutant` | ✅ hub; same need |
| `/whey-proteine` | whey tunisie / whey protein tunisie (transactional) | 502 impr across the whey/protein cluster, pos 58–77 | protéine tunisie, proteine whey | `whey-protein-tunisie-guide`, `quand-prendre-la-whey`, `whey-pour-debutant`, `combien-de-whey-par-jour` | ✅ **cannibalization**: "whey protein" currently ranks the guide (pos 70). Keep guide for "guide/quand prendre"; category owns "whey tunisie/prix" |
| `/whey-isolate` | whey isolate tunisie | n/d | isolat protéine, whey isolate prix | `whey-isolate-vs-concentrate` | ✅ pilot; content live; waiting for Google recrawl |
| `/creatine` | créatine monohydrate tunisie / prix | 114 impr, pos 82–92 | creatine tunisie | `meilleure-creatine-tunisie`, `comment-prendre-creatine`, `creatine-monohydrate-bienfaits-dosage`, `creapure-vs-creatine-monohydrate` | ✅ indexed; has thin legacy copy, rewrite next |
| `/eaa` | eaa tunisie (transactional) | n/d | acides aminés essentiels | `bcaa-ou-eaa` | ✅ pilot; Google had recorded a wrong canonical on 2026-11-07, now self |
| `/bcaa` | bcaa tunisie | n/d | bcaa prix | `bcaa-ou-eaa` | ✅ |
| `/acides-amines` | acides aminés / glutamine tunisie | n/d | l-glutamine, arginine, citrulline | `citrulline-arginine-beta-alanine` | ✅ pilot |
| `/pre-workout` | pre workout tunisie | few | meilleur pre workout | `meilleur-pre-workout-tunisie`, `comment-utiliser-pre-workout`, `pre-workout-sans-cafeine-pump` | ✅ |
| `/gainers-proteines` | gainer / mass gainer tunisie | few | prise de masse | `meilleur-gainer-tunisie`, `comment-prendre-un-mass-gainer`, `whey-ou-gainer-prise-de-masse` | ✅ |
| `/vitamines` | vitamines tunisie / multivitamines tunisie | 78 impr, pos 62–70 | vitamine d3, vitamine c, b12 | `vitamines-pour-sportifs-guide`, `multivitamines-sportifs`, `vitamine-d3-k2-tunisie` | ✅ content rewritten (Batch 5) |
| `/magnesium` | magnésium tunisie | 102 impr, pos 84–92 | glycinate/bisglycinate de magnésium | `types-de-magnesium-comparatif`, `magnesium-bisglycinate-bienfaits` | ✅ content rewritten (Batch 5) |
| `/omega-3` | oméga 3 tunisie prix | 78 impr, pos 68–78 | omega 3 epa dha, meilleur oméga 3 | `omega-3-tunisie-guide`, `comment-choisir-omega-3-epa-dha` | ✅ **cannibalization**: guide ranks for "omega 3" (pos 69) instead of the category; internal links added |
| `/zinc` | zinc prix tunisie / complément zinc | 33 impr, pos 27–87 | zinc bisglycinate | `zinc-bisglycinate-guide`, `zinc-sportif-musculation` | ✅ content rewritten (Batch 5) |
| `/ashwagandha` | ashwagandha tunisie | 23 impr, pos 40–90 | ashwagandha prix | `ashwagandha-tunisie-guide`, `comment-choisir-ashwagandha`, `quand-prendre-ashwagandha` | ✅ |
| `/collagene` | collagène tunisie | 5 impr | collagène marin | — (to write) | ⏳ content live, 2 in-stock products |
| `/l-carnitine` | l-carnitine tunisie | n/d | l carnitine prix | `l-carnitine-perte-graisse` | ⏳ content live |
| `/probiotiques` | probiotique tunisie prix | 9 impr, pos 84–98 | meilleur probiotique | — (to write) | ⏳ 1 verified indexable product; 433 in category |
| `/bruleurs-de-graisse` | brûleur de graisse tunisie | n/d | — | `bruleur-de-graisse-tunisie` | ⏳ claims-sensitive; content needs legal-safe review |
| `/materiel-de-musculation` | matériel musculation tunisie | n/d | — | — | ⛔ prices unverified (27 machines) |
| `/boosters-hormonaux` | — | — | — | — | ⛔ MK-677/DHEA-type products; do not index |
| `/immunite`, `/sommeil-stress`, `/plantes-et-herbes`, `/articulations`, `/digestion`, `/mineraux`, `/antioxydants` | various (no measured demand) | n/d | — | `routine-sommeil-recuperation` | ⏳ large (500–1,500 products) but no measured demand and mostly on-order; index only after content + verified products |

## Cannibalization register (from Search Console, non-brand, ≥10 impr)
| Query | Competing URLs | Decision |
|---|---|---|
| complément alimentaires tunisie | `/complements-alimentaires` (101) vs `/` (24) | Home must not target this term; hub owns it; add hub copy. |
| proteine anabolic tunisie | product page (76) vs `/whey-proteine` (41) | Product page wins for a brand query: acceptable; category links to it. |
| protection solaire | `/solaire` vs guide | `/solaire` is outside the current range: do nothing. |
| whey protein / proteine whey | guide vs `/whey-proteine` | Guide = informational; strengthen category title/H1 for "whey tunisie". |
| omega 3 | guide vs `/omega-3` | Category now links to both guides; guide links to category (already). |

## Rules enforced by `ops/seo/seo-regression.cjs`
Every sitemap URL: 200, indexable, self canonical, exactly one H1, no legacy host in metadata/`<link>`, valid Product/Offer, no rating markup without approved reviews.
