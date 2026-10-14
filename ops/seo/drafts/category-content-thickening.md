# Category Content Drafts — Magnésium, Vitamines, Compléments Alimentaires

**Status:** Draft, ready for review — not applied to the database. Written to replace/extend the current thin content (magnésium 441 chars, vitamines 494 chars, compléments-alimentaires has NULL `seoContent` — a near-catalogue-wide hub with zero body text).

---

## `/magnesium`

**seoContent (replacement):**

Le magnésium est un minéral impliqué dans plus de 300 réactions enzymatiques dans l'organisme : fonction musculaire, transmission nerveuse, régulation du rythme cardiaque et production d'énergie. Chez les sportifs, les apports peuvent être insuffisants du fait des pertes par la sueur et d'une consommation parfois plus élevée par l'effort physique.

**Les formes de magnésium disponibles**

Les produits de cette catégorie se présentent sous différentes formes (bisglycinate, citrate, oxyde, marin), chacune avec un profil d'absorption et de tolérance digestive différent — consultez la fiche de chaque produit pour connaître la forme exacte et vérifier si elle correspond à vos besoins. Le bisglycinate est généralement associé à une meilleure tolérance digestive ; l'oxyde est une forme moins coûteuse mais moins bien absorbée. Ne présumez pas de la forme à partir du seul nom commercial — vérifiez l'étiquette.

**Magnésium et vitamine B6**

Plusieurs produits associent magnésium et vitamine B6, cette dernière participant au métabolisme normal du système nerveux. Cette association est courante mais ne remplace pas un avis médical en cas de carence suspectée.

**Comment choisir**

- Vérifiez la quantité de magnésium élément (et non la quantité totale du composé) indiquée par portion.
- Si la tolérance digestive est une priorité, privilégiez les formes citrate ou bisglycinate plutôt que l'oxyde.
- Respectez la posologie indiquée sur l'emballage du produit choisi.

En cas de doute, de grossesse, de traitement médical en cours ou de pathologie rénale, demandez conseil à un professionnel de santé avant toute supplémentation.

---

## `/vitamines`

**seoContent (replacement):**

Cette catégorie regroupe des vitamines et formules multivitaminées destinées à compléter l'alimentation quotidienne — notamment pour les sportifs, dont les besoins en micronutriments peuvent différer légèrement selon le niveau d'activité.

**Vitamine D**

La vitamine D est fréquemment déficitaire même dans les régions ensoleillées, l'exposition solaire directe de la peau étant souvent insuffisante au quotidien (vêtements, horaires de travail, usage de protection solaire). Elle est souvent associée à la vitamine K2 dans les formulations combinées disponibles ici.

**Vitamines du groupe B**

Impliquées dans le métabolisme énergétique, elles sont présentes isolément ou dans des complexes multivitaminés.

**Multivitamines généralistes vs. vitamines ciblées**

Si vous avez une carence identifiée (par exemple, confirmée par une analyse sanguine), une vitamine ciblée à dose adaptée est généralement plus pertinente qu'une multivitamine généraliste à faible dosage par nutriment. Les multivitamines conviennent davantage à une couverture nutritionnelle générale en l'absence de carence spécifique connue.

**Comment choisir**

- Vérifiez les unités de dosage (UI, mg, µg) et comparez-les aux apports de référence, pas seulement au nombre de comprimés.
- Pour la vitamine D, le dosage varie fortement d'un produit à l'autre (400 UI à 5000 UI et plus) — adaptez au besoin réel, idéalement avec un avis professionnel.

Une supplémentation vitaminique ne remplace pas une alimentation variée ; en cas de carence suspectée ou de traitement médical en cours, consultez un professionnel de santé.

---

## `/complements-alimentaires`

**seoContent (new — this field is currently empty/NULL):**

ParaTunisie réunit un large choix de compléments alimentaires en Tunisie : nutrition sportive (whey, créatine, gainers, pre-workout, BCAA/EAA), bien-être (ashwagandha, magnésium, mélatonine), et vitamines/minéraux (vitamine D, oméga-3, zinc, fer). Cette page centralise l'accès aux sous-catégories ; chacune dispose de son propre guide d'achat détaillé.

**Comment s'orienter dans cette catégorie**

- **Objectif sportif** (force, masse, récupération) → `/nutrition-sportive`, `/creatine`, `/whey-proteine`
- **Bien-être et gestion du stress** → `/ashwagandha`, `/magnesium`
- **Couverture nutritionnelle générale** → `/vitamines`, `/omega-3`

**Comment choisir un complément alimentaire en général**

- Vérifiez la composition complète, pas seulement l'allégation marketing du produit.
- Respectez les doses indiquées — plus n'est pas toujours synonyme de mieux.
- Un complément alimentaire complète une alimentation déjà équilibrée ; il ne la remplace pas, et ne remplace pas davantage un traitement médical.

En cas de grossesse, allaitement, traitement médical en cours ou pathologie connue, demandez conseil à un professionnel de santé avant toute prise.

---

## Application (not yet run — needs your go-ahead, same permission wall as other DB content changes)

```sql
UPDATE "Category" SET "seoContent" = $$<magnesium text above>$$ WHERE slug = 'magnesium';
UPDATE "Category" SET "seoContent" = $$<vitamines text above>$$ WHERE slug = 'vitamines';
UPDATE "Category" SET "seoContent" = $$<complements-alimentaires text above>$$ WHERE slug = 'complements-alimentaires';
```
Then restart `paratunisie-api`, and rebuild `paratunisie-web` if these pages are statically generated (confirmed stale-build behavior found earlier for `/creatine`/`/ashwagandha` — check the same way before assuming a restart alone is enough).
