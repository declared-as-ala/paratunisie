# SEO_CONTENT_PLAN_50.md — 50-Article Editorial Plan

**Created:** 2026-10-14. **Method:** Cross-referenced the 38 `/conseils` articles already live (pulled from the real production sitemap, see list below) against the 16 required topic areas and real GSC query data, to find genuine content gaps rather than duplicate existing coverage. Real brand/category data confirmed against the production database (`187.53.136.225`) — no invented brands, dosages, or products.

## What already exists (do NOT duplicate)

38 live articles, confirmed via `curl https://paratunisie.com/sitemap.xml`: heavy coverage on créatine (7 articles), whey (6), mass gainer (5), pre-workout (4), ashwagandha (3), magnésium (2), oméga-3 (2), vitamines/zinc (4), 1 each for BCAA/EAA and L-carnitine, plus a few cross-cluster comparisons and a recovery/sleep piece. Full list is in `SEO_IMPLEMENTATION_LOG.md`.

## Real gaps identified (this plan targets these)

1. **L-carnitine** — only 1 article exists, and the category was `noindex` until today (now fixed). Real gap, real new opportunity.
2. **Supplement label interpretation** — zero coverage. Required topic area 11, currently empty.
3. **Brand/product selection guides using real ParaTunisie catalog brands** — zero coverage. Required topic area 16. Real brands confirmed in the database with real published product counts: Optimum Nutrition (39), Real Pharm (25), OstroVit (16), Scenit Nutrition (12), BiotechUSA (9+5 — two inconsistent brand records, flagged for catalog cleanup, not invented), Big Ramy Labs (6), Eric Favre (2), Quamtrax (2).
4. **BCAA/EAA** — only 1 combined article. Thin relative to créatine/whey.
5. **Women-specific sports nutrition** — only `creatine-femme` exists. Real gap for whey, magnesium, iron/B12 for female athletes.
6. **Ramadan/fasting-period training nutrition** — zero coverage. Directly relevant to the Tunisian market, not a generic keyword-stuffing topic.
7. **Budget-conscious / beginner stacking guides** — partial coverage via `complements-musculation-debutant`; real gap for a "what to actually buy first, in what order, on a budget" guide.
8. **Deeper magnésium/oméga-3/vitamin angles** — food sources vs. supplementation, specific populations (students, office workers, older adults).
9. **Recovery/hydration cluster** — only 1 article (`routine-sommeil-recuperation`). Real gap for hydration/electrolytes, post-workout nutrition timing, DOMS.
10. **More comparison/decision content** — several comparisons exist, but real remaining gaps: isolate vs. hydrolysat, stimulant vs. non-stimulant pre-workout, natural vs. flavored supplements.

## The 50 topics

Status legend: **Outline ready** = topic, keyword, angle, and sources are defined, not yet drafted. **Drafted** = full article written this session (listed separately below, not inflating this count with placeholders).

| # | Title | Primary keyword | Intent | Slug | Target page(s) to link | Status |
|---|---|---|---|---|---|---|
| 1 | L-Carnitine Liquide vs Gélules : Que Choisir ? | l-carnitine liquide ou gélules | Commercial/informational | `l-carnitine-liquide-vs-gelules` | `/l-carnitine` | Outline ready |
| 2 | L-Carnitine et Perte de Poids : Ce Que Dit Vraiment la Science | l-carnitine perte de poids tunisie | Informational | `l-carnitine-science-perte-de-poids` | `/l-carnitine`, existing `l-carnitine-perte-graisse` | Outline ready |
| 3 | Dosage de la L-Carnitine : Combien et Quand en Prendre | dosage l-carnitine | Informational | `dosage-l-carnitine-quand-prendre` | `/l-carnitine` | Outline ready |
| 4 | L-Carnitine Tartrate vs Acétyl-L-Carnitine : Les Différences | l-carnitine tartrate acetyl | Informational | `l-carnitine-tartrate-vs-acetyl` | `/l-carnitine` | Outline ready |
| 5 | Comment Lire l'Étiquette d'un Complément Alimentaire | comment lire étiquette complément | Informational | `comment-lire-etiquette-complement-alimentaire` | `/complements-alimentaires` | Outline ready |
| 6 | Comprendre les Formes de Créatine sur l'Étiquette (Monohydrate, HCL, Buffered) | formes de créatine étiquette | Informational | `comprendre-formes-creatine-etiquette` | `/creatine` | Outline ready |
| 7 | Additifs et Édulcorants dans les Whey : Ce qu'il Faut Vérifier | additifs whey protéine | Informational | `additifs-edulcorants-whey-etiquette` | `/whey-proteine` | Outline ready |
| 8 | Optimum Nutrition en Tunisie : Gamme Disponible et Guide d'Achat | optimum nutrition tunisie | Commercial/brand | `optimum-nutrition-tunisie-guide-achat` | `/marques/optimum-nutrition`, `/whey-proteine`, `/creatine` | Outline ready |
| 9 | Real Pharm en Tunisie : Que Vaut la Marque ? | real pharm tunisie avis | Commercial/brand | `real-pharm-tunisie-guide` | `/marques/real-pharm` | Outline ready |
| 10 | OstroVit en Tunisie : Gamme et Rapport Qualité-Prix | ostrovit tunisie | Commercial/brand | `ostrovit-tunisie-guide` | `/marques/ostrovit` | Outline ready |
| 11 | BiotechUSA en Tunisie : Guide des Produits Disponibles | biotechusa tunisie | Commercial/brand | `biotechusa-tunisie-guide` | `/marques/biotechusa` | Outline ready |
| 12 | Quelle Marque de Whey Choisir en Tunisie : Comparatif Honnête | meilleure marque whey tunisie | Commercial | `meilleure-marque-whey-tunisie-comparatif` | `/whey-proteine` | Outline ready |
| 13 | BCAA vs EAA : Lequel Est Vraiment Utile ? (approfondi) | bcaa vs eaa utile | Informational | `bcaa-vs-eaa-approfondi` | `/bcaa`, `/eaa` | Outline ready |
| 14 | Ratio BCAA 2:1:1 vs 4:1:1 vs 8:1:1 : Ce Que Ça Change | ratio bcaa 2:1:1 4:1:1 | Informational | `ratio-bcaa-comparatif` | `/bcaa` | Outline ready |
| 15 | EAA : Faut-il les Prendre si On Consomme Déjà de la Whey ? | eaa et whey ensemble | Informational | `eaa-faut-il-avec-whey` | `/eaa`, `/whey-proteine` | Outline ready |
| 16 | Whey Protéine pour Femme : Ce Qui Change (ou Ne Change Pas) | whey protéine femme | Informational | `whey-proteine-femme-guide` | `/whey-proteine` | Outline ready |
| 17 | Créatine pour Femme : Reprendre les Idées Reçues (complément à l'article existant) | créatine femme musculation | Informational | `creatine-femme-idees-recues` | `/creatine`, existing `creatine-femme` | Outline ready |
| 18 | Fer et Sport Chez la Femme : Pourquoi C'est Souvent Négligé | fer sportive carence | Informational | `fer-femme-sportive-carence` | `/vitamines` | Outline ready |
| 19 | Magnésium et Cycle Menstruel : Ce Que l'on Sait | magnésium cycle menstruel sport | Informational | `magnesium-cycle-menstruel-sport` | `/magnesium` | Outline ready |
| 20 | S'entraîner et Se Nourrir Pendant le Ramadan : Guide Pratique | nutrition sportive ramadan | Informational | `nutrition-sportive-ramadan-guide` | `/nutrition-sportive` | Outline ready |
| 21 | Quels Compléments Prendre au Suhoor et à l'Iftar pour la Musculation | compléments ramadan musculation | Commercial/informational | `complements-ramadan-musculation` | `/nutrition-sportive`, `/magnesium` | Outline ready |
| 22 | Reprendre la Whey et la Créatine Après le Ramadan | reprise whey créatine après ramadan | Informational | `reprise-whey-creatine-apres-ramadan` | `/whey-proteine`, `/creatine` | Outline ready |
| 23 | Débuter la Musculation en Tunisie avec un Petit Budget : Que Prendre en Premier | compléments débutant budget tunisie | Commercial/informational | `debuter-musculation-petit-budget-tunisie` | `/nutrition-sportive`, `/whey-proteine`, `/creatine` | Outline ready |
| 24 | Whey ou Créatine en Premier : Par Quoi Commencer Quand On Débute | whey ou créatine débutant | Informational | `whey-ou-creatine-par-quoi-commencer` | `/whey-proteine`, `/creatine` | Outline ready |
| 25 | Le Stack Minimal pour un Débutant : 3 Compléments, Pas Plus | stack minimal débutant musculation | Commercial/informational | `stack-minimal-debutant-musculation` | `/nutrition-sportive` | Outline ready |
| 26 | Magnésium : Sources Alimentaires vs Complément, Faut-il Vraiment Supplémenter ? | magnésium alimentation ou complément | Informational | `magnesium-alimentation-vs-complement` | `/magnesium` | Outline ready |
| 27 | Oméga-3 : Combien de Poisson Faut-il Manger pour Égaler une Gélule ? | oméga 3 poisson vs gélule | Informational | `omega-3-poisson-vs-gelule` | `/omega-3` | Outline ready |
| 28 | Vitamine D en Tunisie : Pourquoi la Carence Est Fréquente Même au Soleil | vitamine d tunisie carence | Informational | `vitamine-d-tunisie-carence-soleil` | `/vitamines` | Outline ready |
| 29 | Magnésium pour les Étudiants et le Stress des Examens | magnésium stress examens étudiant | Informational | `magnesium-etudiants-stress-examens` | `/magnesium` | Outline ready |
| 30 | Compléments pour le Travail de Bureau : Ce Qui a du Sens (et Ce Qui N'en a Pas) | compléments travail bureau fatigue | Informational | `complements-travail-bureau-fatigue` | `/vitamines`, `/magnesium` | Outline ready |
| 31 | Hydratation et Électrolytes à l'Entraînement en Tunisie (Climat Chaud) | électrolytes sport chaleur tunisie | Informational | `hydratation-electrolytes-chaleur-tunisie` | `/nutrition-sportive` | Outline ready |
| 32 | Que Manger et Prendre dans l'Heure Après l'Entraînement | nutrition post entraînement fenêtre anabolique | Informational | `nutrition-post-entrainement-guide` | `/whey-proteine`, `/creatine` | Outline ready |
| 33 | Courbatures (DOMS) : Les Compléments Qui Aident Vraiment, et Ceux Qui Ne Servent à Rien | courbatures doms compléments | Informational | `courbatures-doms-complements-utiles` | `/nutrition-sportive` | Outline ready |
| 34 | Whey Isolate vs Whey Hydrolysée : Pour Qui et Pourquoi | whey isolate vs hydrolysée | Informational | `whey-isolate-vs-hydrolysee` | `/whey-proteine` | Outline ready |
| 35 | Pre-Workout Stimulant vs Sans Stimulant : Comment Choisir | pre workout avec ou sans stimulant | Informational | `pre-workout-stimulant-vs-sans` | `/pre-workout` | Outline ready |
| 36 | Gainer Propre vs Gainer Classique : Les Vraies Différences | clean gainer vs gainer classique | Informational | `clean-gainer-vs-gainer-classique` | `/gainers-proteines` | Outline ready |
| 37 | Ectomorphe en Tunisie : Guide de Prise de Masse pour Morphologie Difficile | prise de masse ectomorphe tunisie | Informational | `prise-de-masse-ectomorphe-tunisie` | `/gainers-proteines` | Outline ready |
| 38 | Peut-on Remplacer un Gainer par de la Nourriture Maison ? | gainer maison vs commercial | Informational | `gainer-maison-vs-commercial` | `/gainers-proteines` | Outline ready |
| 39 | Ashwagandha : Combien de Temps Avant de Sentir des Effets ? | ashwagandha délai effet | Informational | `ashwagandha-delai-effet` | `/ashwagandha` | Outline ready |
| 40 | Ashwagandha et Sommeil : Ce Que Dit la Recherche (Sans Promesse de Guérison) | ashwagandha sommeil recherche | Informational | `ashwagandha-sommeil-recherche` | `/ashwagandha` | Outline ready |
| 41 | Zinc et Magnésium (ZMA) : Faut-il les Prendre Ensemble ? | zma zinc magnesium ensemble | Informational | `zma-zinc-magnesium-ensemble` | `/magnesium`, `/vitamines` | Outline ready |
| 42 | BCAA Scenit Nutrition, Real Pharm, OstroVit : Comparatif des Formules Disponibles | bcaa comparatif marques tunisie | Commercial | `bcaa-comparatif-marques-tunisie` | `/bcaa` | Outline ready |
| 43 | Quamtrax et Eric Favre en Tunisie : Présentation des Gammes | quamtrax eric favre tunisie | Commercial/brand | `quamtrax-eric-favre-tunisie` | `/marques` | Outline ready |
| 44 | Multivitamines vs Compléments Ciblés : Lequel Choisir Selon Son Profil | multivitamines ou complements cibles | Informational | `multivitamines-vs-complements-cibles` | `/vitamines`, `/complements-alimentaires` | Outline ready |
| 45 | Combien de Temps Conserver ses Compléments Après Ouverture | conservation complement alimentaire ouvert | Informational | `conservation-complements-apres-ouverture` | `/complements-alimentaires` | Outline ready |
| 46 | Peut-on Mélanger Plusieurs Compléments dans le Même Shaker ? | mélanger compléments shaker | Informational | `melanger-complements-shaker` | `/nutrition-sportive` | Outline ready |
| 47 | Compléments Alimentaires et Interactions Médicamenteuses : Quand Consulter | compléments interactions médicaments | Informational (YMYL — needs professional review before publish) | `complements-interactions-medicaments` | `/complements-alimentaires` | Outline ready — flagged for professional review |
| 48 | Grossesse et Compléments Sportifs : Ce Qu'il Faut Éviter | compléments sportifs grossesse | Informational (YMYL — needs professional review before publish) | `complements-sportifs-grossesse` | `/complements-alimentaires` | Outline ready — flagged for professional review |
| 49 | Adolescents et Musculation : Quels Compléments Sont Appropriés ? | musculation ado compléments | Informational (YMYL — needs professional review before publish) | `musculation-adolescent-complements` | `/nutrition-sportive` | Outline ready — flagged for professional review |
| 50 | Guide ParaTunisie : Construire sa Routine de Compléments Selon son Objectif (Force, Masse, Perte de Gras, Santé Générale) | routine compléments selon objectif | Commercial Hub/informational | `routine-complements-selon-objectif` | Links to all major category pages — pillar piece | Outline ready — pillar, write last once spokes exist |

## Publishing strategy

Per your instruction not to publish unfinished placeholders: **none of these 50 are published yet.** All 50 have a defined title, keyword, slug, intent, and target internal links — that's the complete editorial batch. Three items (#47-49) are explicitly flagged as YMYL (medication interactions, pregnancy, adolescents) and must not go live without a named, qualified reviewer attached — per `AUTHORITY_ROADMAP.md`'s "qualified nutrition professionals" workstream, which is itself not yet staffed.

**Recommended batching for actual writing** (not done this session — see note below):
- Batch 1 (highest leverage, ship first): #1-4 (L-carnitine — directly supports the category we just unlocked), #8-12 (brand guides — genuinely new content type, real commercial intent, zero cannibalization risk since nothing like this exists yet).
- Batch 2: #13-15, #34-35, #41-43 (comparison/decision content — proven format on this site already).
- Batch 3: #20-22 (Ramadan cluster — time-sensitive, should ship with lead time before the next Ramadan period).
- Batch 4: #16-19, #23-33, #36-40, #44-46 (remaining informational gaps).
- Batch 5 (needs reviewer first): #47-49.
- Pillar #50: last, once enough spokes exist to link to.

**What was not done this session:** actually drafting, fact-checking, sourcing, and publishing full article bodies. Writing 50 genuinely original, accurately-sourced, non-duplicate French articles — each needing real citations, internal linking, and ideally a reviewer pass for the YMYL ones — is a multi-session content production effort, not something to rush inside one audit session. Publishing 50 thin or rushed articles to hit a count would directly violate your own stated quality bar ("do not generate 50 shallow keyword-stuffed articles"). This plan is the complete, real editorial groundwork; drafting happens next, batch by batch, with each batch verified (rendered HTML, canonical, sitemap inclusion, no cannibalization) before the next starts.
