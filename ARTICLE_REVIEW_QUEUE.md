# ParaTunisie — Article Editorial Review Queue & Topic Clusters

**Date:** September 2026  
**Auditor:** Senior Technical SEO & Medical E-E-A-T Reviewer  
**Scope:** 20 Editorial Guides (`/conseils/*`)  

---

## 1. Executive Summary

During Phase 1, all 20 health and sports nutrition articles were placed into quarantine (`indexable = false`) to prevent YMYL (Your Money or Your Life) algorithmic penalties while safety disclaimers, scientific references, and schema structures were being established.

In Phase 2, the editorial templates (`src/app/conseils/[slug]/page.tsx`) were completely upgraded to include:
1. **Prominent Medical Disclaimers:** Clarifying that supplements do not replace medical diagnosis, treatment, or balanced nutrition.
2. **Scientific References Section:** Peer-reviewed literature references (ISSN/PubMed).
3. **Structured Article Schema (`buildArticleSchema`):** Canonical apex URLs, publication timestamps, and editorial organization markup.
4. **Structured FAQ Schema (`buildFaqSchema`):** Direct answers to search intent questions.
5. **Contextual Product Cards:** Linking only authentic, verified in-stock products.

---

## 2. Article Inventory & Review Status (20 Articles)

| Slug | Topic / Target Keyword | Cluster | Commercial Value | YMYL Risk Level | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `meilleure-creatine-tunisie` | Meilleure Créatine en Tunisie | Créatine | Very High | Low | ✅ Safe to index (Wave 1) |
| `creatine-monohydrate-bienfaits-dosage` | Créatine Monohydrate Dosage | Créatine | High | Low | ✅ Safe to index (Wave 1) |
| `creatine-avant-ou-apres-entrainement` | Timing Prise Créatine | Créatine | High | Low | ✅ Safe to index (Wave 1) |
| `whey-protein-tunisie-guide` | Whey Protein Guide Tunisie | Protéines | Very High | Low | ✅ Safe to index (Wave 1) |
| `whey-ou-gainer-prise-de-masse` | Whey ou Gainer | Protéines | High | Low | ✅ Safe to index (Wave 1) |
| `prise-de-masse-tunisie-guide` | Prise de Masse Tunisie | Protéines | High | Low | ✅ Safe to index (Wave 1) |
| `ashwagandha-tunisie-guide` | Ashwagandha Tunisie | Bien-être | Very High | Medium | ✅ Safe to index with disclaimer |
| `quand-prendre-ashwagandha` | Dosage & Timing Ashwagandha | Bien-être | High | Medium | ✅ Safe to index with disclaimer |
| `vitamine-d3-k2-tunisie` | Vitamine D3 + K2 Tunisie | Vitamines | Very High | Medium | ✅ Safe to index with disclaimer |
| `zinc-sportif-musculation` | Zinc & Musculation | Minéraux | High | Low | ✅ Safe to index |
| `omega-3-tunisie-guide` | Oméga 3 Tunisie EPA DHA | Santé | High | Low | ✅ Safe to index |
| `multivitamines-sportifs` | Multivitamines pour Sportifs | Vitamines | Medium | Low | ✅ Safe to index |
| `meilleur-pre-workout-tunisie` | Meilleur Pre-Workout Tunisie | Performance | High | Medium | ✅ Safe to index with dosage warning |
| `pre-workout-ou-creatine` | Pre-Workout vs Créatine | Performance | Medium | Low | ✅ Safe to index |
| `bcaa-ou-eaa` | BCAA vs EAA | Acides Aminés | Medium | Low | ✅ Safe to index |
| `citrulline-arginine-beta-alanine` | Citrulline, Arginine, Beta-Alanine | Acides Aminés | Medium | Low | ✅ Safe to index |
| `l-carnitine-perte-graisse` | L-Carnitine & Perte de Graisse | Sèche | Medium | Low | ✅ Safe to index with realistic claim |
| `bruleur-de-graisse-tunisie` | Brûleur de Graisse Tunisie | Sèche | High | Medium | ✅ Safe to index with safety rules |
| `complements-musculation-debutant` | Compléments Débutant | Débutant | High | Low | ✅ Safe to index |
| `complements-avant-pendant-apres-entrainement` | Timing Compléments Sport | Performance | High | Low | ✅ Safe to index |

---

## 3. Controlled Indexation Strategy

- **Wave 1 (Current Phase 2 Release):** Maintain articles in clean server-rendered format with full internal links to category hubs and in-stock products.
- **Gradual Sitemap Rollout:** As Search Console establishes organic crawl trust with the initial 50 product pages and category hubs, release the top 5 highest-intent guides (`meilleure-creatine-tunisie`, `whey-protein-tunisie-guide`, `ashwagandha-tunisie-guide`, `vitamine-d3-k2-tunisie`, `omega-3-tunisie-guide`) into `sitemap.xml`.
