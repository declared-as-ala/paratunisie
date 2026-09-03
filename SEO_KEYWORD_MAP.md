# ParaTunisie SEO Keyword Map

Date: 2026-09-04
Market/language: Tunisia, French
Method: live Google-result sampling for commercial French queries plus current catalog architecture. No search-volume figures are claimed because no first-party Search Console or paid keyword-volume export was supplied.

## Mapping rules

- One primary commercial intent per indexable collection URL.
- Product-detail pages target the exact product + brand + format; they do not target generic category head terms.
- Editorial pages answer comparison/how-to questions and link to the matching commercial collection; they must not reuse the collection's exact title/H1.
- Filter, sort, search and pagination URLs are `noindex,follow` with the clean collection canonical.
- A brand page is indexable only while it has at least one eligible indexable product.
- Do not publish claims such as “best”, “official”, “certified”, medical outcomes, or numeric price ranges unless they are supported and dated.

## Core URL map

| URL | Search intent | Primary target | Secondary/supporting terms | Recommended title | H1 | Meta-description direction |
|---|---|---|---|---|---|---|
| `/` | Store discovery | parapharmacie en ligne Tunisie | compléments alimentaires Tunisie; nutrition sportive Tunisie; livraison Tunisie | ParaTunisie — Parapharmacie en ligne en Tunisie | Parapharmacie en ligne et nutrition sportive en Tunisie | Describe the real ranges, current delivery area and cash-on-delivery without superlatives. |
| `/shop` | Browse all products | compléments alimentaires Tunisie | parapharmacie Tunisie prix; nutrition sportive prix | Compléments alimentaires en Tunisie — Prix & catalogue | Compléments alimentaires et parapharmacie | Emphasize current prices, formats, stock state and category filters. |
| `/creatine` | Buy/compare | créatine Tunisie | créatine monohydrate Tunisie; prix créatine Tunisie; acheter créatine | Créatine en Tunisie — Monohydrate, prix & formats | Créatine en Tunisie | Compare real brands, formats, current prices and availability; link to the buying guide. |
| `/whey-proteine` | Buy/compare | whey protéine Tunisie | whey Tunisie prix; whey isolate Tunisie; protéine musculation Tunisie | Whey protéine en Tunisie — Prix, formats & marques | Whey protéine en Tunisie | Explain concentrate/isolate as product types, then show real price and stock data. |
| `/whey-isolate` | Buy a subtype | whey isolate Tunisie | isolate protéine Tunisie; whey sans lactose Tunisie | Whey isolate en Tunisie — Prix & formats | Whey isolate en Tunisie | Keep scope strictly to products classified as isolate; do not duplicate `/whey-proteine`. |
| `/gainers-proteines` | Buy/compare | mass gainer Tunisie | gainer Tunisie prix; prise de masse gainer; gainer protéine | Mass gainer en Tunisie — Prix, formats & marques | Mass gainers en Tunisie | Show only genuine mass-gainer formulas; explain how to compare label calories/protein/carbohydrates without outcome promises. |
| `/pre-workout` | Buy/compare | pre workout Tunisie | booster entraînement Tunisie; pre workout prix; avec/sans caféine | Pre-workout en Tunisie — Prix & formules | Pre-workout en Tunisie | Invite comparison of caffeine, listed ingredients, serving size and warnings. |
| `/bcaa` | Buy/compare | BCAA Tunisie | BCAA prix Tunisie; acides aminés branchés | BCAA en Tunisie — Prix & formats | BCAA en Tunisie | Compare ratios and formats only where shown on labels. |
| `/eaa` | Buy subtype | EAA Tunisie | acides aminés essentiels Tunisie; EAA prix | EAA en Tunisie — Acides aminés essentiels | EAA en Tunisie | Keep separate from BCAA by explaining the product-label distinction. |
| `/amino-acides` | Browse broader class | acides aminés Tunisie | compléments acides aminés; glutamine; arginine | Acides aminés en Tunisie — Catalogue & prix | Acides aminés en Tunisie | Broad hub linking to BCAA, EAA, citrulline and other valid child collections. |
| `/vitamines` | Buy/browse | vitamines Tunisie | compléments vitamines Tunisie; multivitamines Tunisie; prix vitamines | Vitamines en Tunisie — Prix, formats & marques | Vitamines en Tunisie | Describe available vitamin types and label-based comparison; avoid deficiency/treatment claims. |
| `/magnesium` | Buy | magnésium Tunisie | magnésium prix Tunisie; magnésium B6 | Magnésium en Tunisie — Prix & formats | Magnésium en Tunisie | Compare form, quantity and label dosage; include supplement disclaimer. |
| `/zinc` | Buy | zinc Tunisie | zinc prix Tunisie; complément zinc | Zinc en Tunisie — Prix & formats | Zinc en Tunisie | Focus on product form, quantity, current price and directions on label. |
| `/omega-3` | Buy | omega 3 Tunisie | omega 3 prix Tunisie; huile de poisson Tunisie; EPA DHA | Oméga 3 en Tunisie — Prix & formats | Oméga 3 en Tunisie | Compare EPA/DHA only where product data provides it; no cardiovascular treatment promises. |
| `/ashwagandha` | Buy/compare | ashwagandha Tunisie | ashwagandha prix Tunisie; withanolides; gélules ashwagandha | Ashwagandha en Tunisie — Prix, extraits & formats | Ashwagandha en Tunisie | Compare extract, label strength and format; avoid cortisol, anxiety or sleep-treatment claims. |
| `/l-carnitine` | Buy | L-carnitine Tunisie | carnitine prix Tunisie; carnitine liquide | L-carnitine en Tunisie — Prix & formats | L-carnitine en Tunisie | Describe formats and instructions only; do not promise fat loss. |
| `/bruleurs-de-graisse` | Browse a marketed class | brûleur de graisse Tunisie | compléments minceur Tunisie; thermogénique Tunisie | Compléments minceur en Tunisie — Prix & informations | Compléments minceur en Tunisie | Use neutral product-class language, clear warnings and no guaranteed weight-loss claims. |
| `/accessoires` | Buy equipment | accessoires musculation Tunisie | shaker Tunisie; ceinture musculation; gants musculation | Accessoires de musculation en Tunisie | Accessoires de sport et musculation | Cover real equipment types, prices and stock. |
| `/marques` | Brand discovery | marques compléments alimentaires Tunisie | marques nutrition sportive; marques parapharmacie | Marques de compléments & parapharmacie — ParaTunisie | Marques du catalogue ParaTunisie | Render brand links and product counts in initial HTML; no “official” status unless documented. |
| `/conseils` | Informational hub | conseils compléments alimentaires | guide créatine; guide whey; nutrition sportive | Guides nutrition sportive & compléments — ParaTunisie | Guides et conseils | Describe editorial scope, review process, dates and authorship. |

## Product and brand templates

| Page type | Primary target pattern | Title pattern | H1 pattern | Index rule |
|---|---|---|---|---|
| Product | `{exact product name} {brand} Tunisie` | `{Exact product name} — Prix en Tunisie | ParaTunisie` | Exact normalized product name | Index only if published, uniquely titled, substantial, correctly classified, priced, internally imaged and availability-consistent. |
| Brand | `{brand} Tunisie` | `{Brand} en Tunisie — Produits & prix | ParaTunisie` | `{Brand} en Tunisie` | Index only with at least one eligible product and useful unique brand copy. |
| Article | Question/comparison intent | Natural question or comparison + `| ParaTunisie` | Article subject, not the commercial collection H1 | Index only with named/dated authorship, sources where claims require them, and no unsupported medical advice. |

## Cannibalization assignments

- `/creatine` owns “créatine Tunisie”; `/conseils/meilleure-creatine-tunisie` owns comparison/selection questions and must link to `/creatine`.
- `/whey-proteine` owns “whey protéine Tunisie”; whey guides own “comment choisir”, “prix comparatif”, or ingredient questions.
- `/gainers-proteines` owns “mass gainer Tunisie”; broader `/nutrition-sportive` must not use Mass Gainer as its H1/title.
- `/vitamines` is the broad vitamin hub; `/zinc`, `/magnesium`, and `/omega-3` own their exact ingredient terms.
- `/shop` owns broad catalog intent; homepage owns brand/store intent, not every category keyword.

## SERP observations used

The sampled Tunisian results consistently used combinations of the product class, “Tunisie”, “prix”, brands/formats and delivery. Examples observed on 2026-09-04 include Protein.tn and local category pages for whey/pre-workout/mass-gainer, Muscle Rock Nutrition for whey/créatine, GainLab for créatine/mass-gainer, Vitamin Shop Tunisia for whey/mass-gainer, and Primini for vitamin/complément price-comparison intent. These are directional observations, not traffic or volume estimates.
