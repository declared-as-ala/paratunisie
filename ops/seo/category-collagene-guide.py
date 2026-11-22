"""SQL for /collagene (Batch 10): upgraded, claim-free guide, then made indexable (eligibility checked 2026-11-15):
6 indexable products from 6 real brands (Scenit, Real Pharm, Advance Physician Formulas, Biosil, California Gold Nutrition, Youtheory),
2 shown in stock, no restricted product. NO health effect is stated: I could not verify any collagen health claim, so the page only
explains forms, labels and price comparison.
"""
import sys

TITLE = "Collagène en Tunisie : prix, formes et marques | ParaTunisie"
DESC = "Compléments de collagène en Tunisie : poudre, comprimés et gélules. Comparez les marques, la composition et le prix au 100 g. Livraison en 24 à 48 h."
H1 = "Collagène en Tunisie"
INTRO = ("Poudre de peptides de collagène, comprimés ou gélules : comparez les compléments de collagène de Scenit, Real Pharm, California Gold Nutrition, "
         "Youtheory et d'autres marques. Le guide explique comment lire une étiquette et le tableau ramène les poudres au prix pour 100 g.")

BODY = """Les compléments de collagène sont proposés sous plusieurs formes et avec des compositions très différentes. Ce guide vous aide à les comparer sur des critères vérifiables : la forme, la composition indiquée sur l'étiquette et le prix au gramme. Il ne décrit aucun effet attendu : aucune allégation de santé n'est formulée ici.

## Le collagène en complément alimentaire

Le collagène est une protéine présente naturellement dans l'organisme et dans les produits d'origine animale. Les compléments proposés en parapharmacie sont le plus souvent à base de **peptides de collagène** (collagène hydrolysé), d'origine marine ou bovine selon la marque. Ce sont des compléments alimentaires : ils ne remplacent ni une alimentation variée ni un avis médical.

## Quelles formes trouve-t-on ?

- **Poudre** : peptides de collagène à diluer dans une boisson, avec ou sans arôme. C'est la forme qui se prête le mieux à la comparaison de prix.
- **Comprimés et gélules** : pratiques à emporter ; plusieurs unités par jour sont souvent nécessaires, comparez donc le coût par jour plutôt que le prix du flacon.
- **Formules associées** : certains produits ajoutent d'autres ingrédients (par exemple de la vitamine C ou de l'acide hyaluronique selon les références). Ils sont indiqués sur l'étiquette : lisez-les, car ils changent la composition et le prix.

## Lire l'étiquette d'un complément de collagène

- **La quantité de collagène par portion** et la taille de la portion, pour calculer le prix par portion.
- **L'origine annoncée** (marine, bovine) : elle est précisée par la marque. Un collagène d'origine marine implique la présence de poisson, à vérifier en cas d'allergie.
- **Les ingrédients ajoutés** : arômes, édulcorants, vitamines, autres actifs.
- **Les mentions de qualité** : une mention n'est pas une garantie de résultat ; privilégiez les informations précises et vérifiables de l'étiquette.

## Comparer les prix

Pour comparer deux poudres de formats différents, ramenez leur prix à 100 g : prix du pot ÷ poids en grammes × 100. Le tableau ci-dessous le fait pour les références affichées en stock.

{{comparatif}}

## Choisir selon votre profil

- **Vous voulez une poudre en format intermédiaire** : [Scenit Nutrition Best Collagen Premium 350 g](/produits/best-collagen-premium-350g-scenit-nutrition) ou [Real Pharm Collagen Marine 300 g](/produits/collagen-marine-300g-real-pharm).
- **Vous préférez un grand format ou un collagène marin importé** : [California Gold Nutrition CollagenUP 1 kg](/produits/california-gold-nutrition-collagenup-hydrolyzed-marine-collagen-peptides-with-hyaluronic-acid-and-vitamin-c-sans-arome-1-kg) ou [Advance Physician Formulas Marine Collagen Peptides 175 g](/produits/advance-physician-formulas-wild-caught-marine-collagen-peptides-175-g), proposés sur commande : le bouton « Demander ce produit » donne le prix et le délai avant tout engagement.
- **Vous préférez les comprimés ou les gélules** : [Youtheory Men Collagen 160 comprimés](/produits/youtheory-men-collagen-160-comprimes) ou [Biosil Advanced Collagen Generator 60 capsules](/produits/biosil-advanced-collagen-generator-60-original-capsules), sur commande.

## Précautions

Demandez l'avis d'un médecin ou d'un pharmacien en cas de maladie, de traitement en cours, d'allergie (notamment au poisson pour les collagènes marins), de grossesse ou d'allaitement. Les compléments ne sont pas destinés aux mineurs. Respectez la posologie indiquée par le fabricant.

## Pour aller plus loin

Retrouvez l'ensemble des [compléments alimentaires](/complements-alimentaires), les [vitamines](/vitamines) et notre page [authenticité](/authenticite). Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison : voir [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Quelle différence entre collagène marin et bovin ?

Il s'agit de l'origine de la matière première annoncée par la marque. Le marin implique du poisson, à vérifier en cas d'allergie. Comparez surtout la quantité par portion et le prix.

### Poudre, comprimés ou gélules : que choisir ?

La poudre se compare facilement au prix pour 100 g. Les comprimés et gélules sont pratiques mais demandent plusieurs unités par jour : comparez le coût par jour.

### Que signifient « peptides » ou « hydrolysé » ?

Ces termes désignent un collagène fragmenté en petites chaînes pour être plus facile à dissoudre. Ils décrivent la forme du produit, pas un résultat.

### Comment comparer deux compléments de collagène ?

Regardez la quantité de collagène par portion, le nombre de portions du pot, les ingrédients ajoutés et le prix au 100 g ou par portion. Le tableau de cette page le fait pour les poudres en stock.

### Le collagène remplace-t-il une alimentation équilibrée ?

Non. C'est un complément alimentaire, qui ne remplace ni une alimentation variée ni un avis médical.

### Où acheter du collagène en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager."""

KEYWORDS = ["collagène tunisie", "collagène poudre tunisie", "collagène marin tunisie", "prix collagène tunisie"]


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


kw = "[" + ",".join('"%s"' % k for k in KEYWORDS) + "]"
assert len(TITLE) <= 62 and 90 <= len(DESC) <= 160, (len(TITLE), len(DESC))
out = [
    "\\o /dev/null",
    'create table if not exists _wave_backup_cat_collagene as select id, slug, indexable, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","ogTitle","ogDescription","updatedAt" from "Category" where slug = \'collagene\';',
    "\\o",
    'update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoKeywords"=%s,"ogTitle"=%s,"ogDescription"=%s,"seoIsCustom"=true,indexable=true,"updatedAt"=now() where slug=\'collagene\';' % (q(TITLE), q(DESC), q(H1), q(INTRO), q(BODY), q(kw), q(TITLE), q(DESC)),
    'select slug, indexable, length("seoContent") from "Category" where slug=\'collagene\';',
]
print(f"-- title {len(TITLE)} desc {len(DESC)} words {len(BODY.split())}", file=sys.stderr)
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
