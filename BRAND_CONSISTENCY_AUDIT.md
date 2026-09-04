# ParaTunisie — Brand Consistency & Entity SEO Audit

**Date:** September 2026  
**Auditor:** Senior Technical SEO Engineer, Brand SEO Strategist & E-E-A-T Specialist  
**Target Entity:** ParaTunisie (`https://paratunisie.com/`)  
**Primary Brand Keywords:** `paratunisie`, `para tunisie`, `para tunisie.com`, `para tunis`  

---

## 1. Executive Summary & Brand Positioning

Google previously received mixed and contradictory signals about what ParaTunisie is:
- Some pages described it as a legacy dermocosmetics & skincare parapharmacy (face, body, baby, hair).
- Other pages described it as a sports nutrition and supplement retailer.
- Some legacy sections implied the presence of in-house pharmacists / health professionals or claimed unsupported "leader / référence / 100% garanti" titles.

### Canonical Business Positioning (The Single Source of Truth)
> **"ParaTunisie est une plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires, le bien-être et une sélection de produits de parapharmacie."**

Core Entity Pillars:
1. **Business Model:** Tunisian E-commerce Store (Online Ordering, Home Delivery across 24 Governorates, Cash on Delivery).
2. **Core Catalog:** Sports Nutrition, Dietary Supplements, Wellness, Micronutrition, and Selected Parapharmacy Products.
3. **Brand Portfolio:** Major recognized international and specialized brands (*BioTechUSA, Optimum Nutrition, Real Pharm, Quamtrax, WeightWorld, Eric Favre, etc.*).
4. **No Fabricated Data:** No fake physical pharmacy addresses, no unverified medical staff personas, and no unsupported "exclusive / official distributor" badges.

---

## 2. Inconsistency Audit Matrix

| URL / File | Current Inconsistent / Risky Wording | Why It Is Inconsistent / Risky | Replacement Recommendation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`src/components/home/home-hero.tsx`** | *"Votre Parapharmacie en Ligne en Tunisie"* (H1) & generic eyebrow | H1 misses the primary brand name `ParaTunisie` and focuses only on generic pharmacy without nutrition/supplements. | Change H1 to: `ParaTunisie — Compléments, Nutrition Sportive & Bien-être en Tunisie` and Eyebrow to: `ParaTunisie • E-Commerce Nutrition & Compléments en Tunisie`. | 🟡 Pending Fix |
| **`src/lib/seo/metadata.ts`** & **`src/app/layout.tsx`** | *"ParaTunisie \| Parapharmacie en Ligne en Tunisie — Soins & Nutrition"* | Lacks explicit focus on supplements and nutrition sports; title template can cause branding drift. | Update default homepage title to: `ParaTunisie — Compléments Alimentaires & Nutrition Sportive en Tunisie`. | 🟡 Pending Fix |
| **`src/components/layout/site-footer.tsx`** | *"Votre parapharmacie en ligne en Tunisie : soins authentiques, conseils d'experts et livraison partout dans le pays."* | Claims unverified "conseils d'experts" and overlooks sports nutrition core. | Replace with canonical positioning: *"ParaTunisie est une plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires, le bien-être et une sélection de produits de parapharmacie."* | 🟡 Pending Fix |
| **`src/components/home/home-split-feature.tsx`** | *"Sélectionnés par des professionnels de la santé et du sport en Tunisie..."* | Implies certified clinical/pharmaceutical staff without verified credentials. | Replace with: *"ParaTunisie sélectionne des compléments alimentaires et produits de nutrition sportive issus de grandes marques reconnues pour accompagner vos entraînements et votre bien-être au quotidien."* | 🟡 Pending Fix |
| **`src/components/home/home-seo-section.tsx`** | *"ParaTunisie : Votre Parapharmacie et Nutrition Sportive de Référence en Tunisie"* | "de Référence" is an unsupported leadership superlative. | Change to: *"ParaTunisie : Compléments Alimentaires, Nutrition Sportive & Bien-être en Tunisie"*. | 🟡 Pending Fix |
| **`src/components/shop/shop-seo-content.tsx`** | Heavy legacy copy on *"soins visage, corps et cheveux, protections solaires, hygiène quotidienne, univers bébé & maman"* | The active catalog is 95%+ sports nutrition and supplements. Over-focusing on baby/hair in Shop SEO copy confuses Google about current catalog reality. | Rebalance Shop SEO copy and FAQ to reflect sports nutrition, dietary supplements, vitamins, wellness, and selected parapharmacy items. | 🟡 Pending Fix |
| **`src/app/aide/page.tsx`** | *"Nos conseillers sont disponibles pour vous guider dans le choix de vos soins."* | Implies medical counselors rather than customer service. | Replace with: *"Notre service client est à votre disposition par WhatsApp et par téléphone pour répondre à vos questions sur vos commandes et produits."* | 🟡 Pending Fix |
| **`src/app/a-propos/page.tsx`** | Contains minor phrasing variations | Needs to strictly adopt the canonical business positioning without exaggerating distributor relationships. | Refine to exact canonical business description, detailing online ordering, Tunisia delivery, and recognized brand catalog. | 🟡 Pending Fix |
| **`src/lib/config/company.ts`** | `commercialName: "ParaTunisie — Parapharmacie & Nutrition Sportive en Tunisie"` | Needs full consistency across `Organization` JSON-LD schema, footer, and metadata. | Align with canonical business description and verified contact channels. | 🟡 Pending Fix |
| **`src/lib/seo/schema.ts`** | `buildOrganizationSchema` | Must ensure `OnlineStore` / `Organization` uses verified properties (`name: "ParaTunisie"`, phone `+216 97 991 266`, verified social URLs, no fake physical address). | Standardize entity JSON-LD and ensure clean `sameAs` links. | 🟡 Pending Fix |

---

## 3. Brand Entity Association Plan

```text
Branded Query: "para tunisie" / "paratunisie" / "para tunisie.com"
                                │
                                ▼
               Canonical Homepage (https://paratunisie.com/)
                                │
   ┌────────────────────────────┼────────────────────────────┐
   ▼                            ▼                            ▼
Online Store Entity      Primary Categories           Trust & Company
- Organization Schema    - /creatine                  - /a-propos
- WebSite Schema         - /whey-proteine             - /contact
- Verified Socials       - /pack-anti-stress          - /politique-editoriale
                         - /marques                   - /livraison
```

---

## 4. Execution Steps

1. **Homepage Brand Refresh**: Update `home-hero.tsx` (H1, Eyebrow, CTA) and `home-seo-section.tsx`.
2. **Shop SEO Rebalancing**: Update `shop-seo-content.tsx` and `SHOP_FAQ`.
3. **Footer & Help Center Uniformity**: Update `site-footer.tsx` and `src/app/aide/page.tsx`.
4. **About Page & Schema Alignment**: Update `a-propos/page.tsx`, `company.ts`, and `schema.ts`.
5. **Sitewide Metadata Sync**: Update `src/lib/seo/metadata.ts` and `layout.tsx`.
6. **Testing & Deployment**: Run lint, TypeScript, tests, build, deploy, and verify live HTML on `https://paratunisie.com/`.
