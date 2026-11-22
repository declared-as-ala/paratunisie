"""SQL for /magnesium (Batch 10): deeper, claim-free guide. UTF-8, LF.
Verified wording: EFSA/SCF tolerable upper intake level of 250 mg per day for magnesium from supplements, fortified foods and water
(critical effect: osmotic diarrhoea). Nothing else about health effects is stated; bioavailability differences between forms are NOT
asserted (EFSA could not settle bioavailability for at least one form), so forms are compared on label facts and daily cost.
Catalogue facts (2026-11-15): 4 shown in stock (Muscle Care Magnesium + B6 and Magnesium + Calcium + B6, ProActive Magnesium Glycinate,
weightworld Magnesium Bisglycinate + B6); the rest on order (Thorne, Source Naturals, Doctor's Best, Vitamatic, Amazing Nutrition, ...).
"""
import sys

TITLE = "Magnésium en Tunisie : formes, prix et marques | ParaTunisie"
DESC = "Comparez les magnésiums en Tunisie : bisglycinate, glycinate, oxyde, avec ou sans vitamine B6. Guide pour lire l'étiquette. Livraison en 24 à 48 h."
H1 = "Magnésium en Tunisie"
INTRO = ("Bisglycinate, glycinate, oxyde, orotate ou formules associées à la vitamine B6 : comparez les compléments de magnésium de Muscle Care, ProActive, "
         "weightworld, Thorne, Doctor's Best et d'autres marques. Le guide explique comment lire une étiquette et comparer le coût par jour.")

BODY = """Il existe beaucoup de compléments de magnésium, avec des formes, des dosages et des prix très différents. Ce guide vous aide à les comparer sur des critères vérifiables : la forme annoncée, la quantité de magnésium réellement apportée par prise, les ingrédients associés et le coût par jour. Il ne promet aucun effet : aucune allégation de santé n'est formulée ici.

## Le magnésium en complément alimentaire

Le magnésium est un minéral présent dans l'alimentation. En complément, il est associé à une autre substance pour former un « sel » : bisglycinate, glycinate, citrate, oxyde, orotate et bien d'autres. Ce sont des compléments alimentaires : ils ne remplacent ni une alimentation variée ni un avis médical.

## Les formes que l'on rencontre dans le catalogue

- **Bisglycinate et glycinate** : le magnésium est associé à la glycine, un acide aminé. On les trouve chez ProActive, weightworld, Thorne, Source Naturals ou Doctor's Best.
- **Oxyde** : une forme courante et souvent économique, par exemple chez Amazing Nutrition.
- **Orotate, L-thréonate, formules à plusieurs sels** : des formes plus spécifiques, proposées par quelques marques (Vitamatic, Source Naturals Magtein, Micro Ingredients).
- **Magnésium + vitamine B6** : des formules associées, comme celles de Muscle Care ou de weightworld, à comparer sur leur composition complète.
- **Calcium + magnésium** : des formules combinées, dont la quantité de magnésium par prise est plus faible que celle d'un produit simple ; lisez la composition.

Les marques mettent parfois en avant des différences d'absorption entre ces formes. Les sources que nous avons consultées ne permettent pas de les classer de façon définitive : nous ne présentons donc aucune forme comme « meilleure » et vous invitons à comparer des critères objectifs.

## Lire l'étiquette : le chiffre qui compte

- **La quantité de magnésium (élément)** par dose : une étiquette peut indiquer le poids du « sel » (par exemple 1 000 mg de bisglycinate) et non celui du magnésium qu'il contient. Cherchez la ligne « magnésium » exprimée en mg.
- **Le nombre d'unités par dose** : certains produits demandent plusieurs gélules ou comprimés par jour.
- **Les ingrédients associés** : vitamine B6, calcium, zinc, arômes, édulcorants.
- **Les allergènes et excipients**, si vous y êtes sensible.

## Comparer les prix : le coût par jour

Pour une même quantité de magnésium, le prix du flacon ne suffit pas à comparer : il faut tenir compte du nombre de jours qu'il couvre. Le calcul est simple : prix du flacon ÷ nombre de jours de traitement indiqué sur l'étiquette. Comparez ensuite des produits qui apportent des quantités de magnésium comparables par jour. Les prix varient selon la marque, la forme et le circuit d'import ; le prix affiché sur chaque fiche fait foi.

## Combien de magnésium en complément ?

Suivez la posologie indiquée par le fabricant. Pour le magnésium apporté par les compléments, les aliments enrichis et l'eau, l'Union européenne (sur avis du Comité scientifique de l'alimentation, repris par l'EFSA) retient une limite supérieure de sécurité de 250 mg par jour, établie à partir de l'effet limitant observé : la diarrhée osmotique. Cette limite ne concerne pas le magnésium apporté naturellement par l'alimentation. Ne cumulez pas plusieurs produits sans vérifier la quantité totale de magnésium.

## Précautions

Demandez l'avis d'un médecin ou d'un pharmacien avant de commencer en cas de maladie, notamment rénale, de traitement en cours (le magnésium peut interagir avec certains médicaments), de grossesse ou d'allaitement. Les compléments ne sont pas destinés aux mineurs.

## Choisir selon votre profil

- **Vous voulez une référence affichée en stock** : [Muscle Care Magnesium + Vitamine B6, 90 comprimés](/produits/magnesium-vitamin-b6-90-tablets), [Muscle Care Magnesium + Calcium + Vitamine B6](/produits/magnesiumcalcium-vitamin-b6-90-tablet-muscle-care), [ProActive Magnesium Glycinate, 90 capsules](/produits/magnesium-glycinate-90-caps-proactive) ou [weightworld Magnesium Bisglycinate + B6](/produits/magnesium-bisglycinate-vitamine-b6-1422mg-weightworld).
- **Vous cherchez du glycinate de marques internationales** : [Thorne Magnesium Glycinate 90 gélules](/produits/thorne-magnesium-glycinate-90-gelules) ou [180 gélules](/produits/thorne-magnesium-glycinate-180-gelules), ou [Source Naturals Magnesium Bis-Glycinate 120 comprimés](/produits/source-naturals-magnesium-bis-glycinate-120-comprimes), proposés sur commande : le bouton « Demander ce produit » donne le prix et le délai avant tout engagement.
- **Vous voulez un produit à base de plusieurs formes** : [Doctor's Best High Absorption Magnesium, 120 gélules végétales](/produits/doctor-s-best-high-absorption-magnesium-120-gelules-vegetales), sur commande.

## Pour aller plus loin

Voyez aussi le [zinc](/zinc), les [vitamines](/vitamines), l'[ashwagandha](/ashwagandha) et l'ensemble des [compléments alimentaires](/complements-alimentaires). Nos guides détaillent les formes : [types de magnésium](/conseils/types-de-magnesium-comparatif) et [magnésium bisglycinate](/conseils/magnesium-bisglycinate-bienfaits). Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison : voir [livraison](/livraison), [retours](/retours) et [authenticité](/authenticite).

## Questions fréquentes

### Quelle forme de magnésium choisir ?

Il n'existe pas de forme universellement « meilleure ». Comparez la quantité de magnésium (élément) par dose, la composition complète, la facilité de prise et le coût par jour.

### Comment comparer deux compléments de magnésium ?

Repérez la quantité de magnésium en mg par dose sur l'étiquette, le nombre de doses par jour et le nombre de jours que couvre le flacon, puis calculez le coût par jour.

### Quelle est la limite pour le magnésium en complément ?

L'Union européenne retient une limite supérieure de 250 mg par jour pour le magnésium issu des compléments, des aliments enrichis et de l'eau. Respectez la posologie du produit et ne cumulez pas plusieurs compléments sans vérifier le total.

### Le magnésium avec vitamine B6 est-il différent ?

C'est une formule associée : la composition change, donc la quantité de magnésium par dose aussi. Lisez l'étiquette complète.

### Le magnésium convient-il à tout le monde ?

Non. En cas de maladie, notamment rénale, de traitement en cours, de grossesse ou d'allaitement, demandez l'avis d'un médecin ou d'un pharmacien. Les compléments ne sont pas destinés aux mineurs.

### Où acheter du magnésium en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager."""

KEYWORDS = ["magnésium tunisie", "magnésium bisglycinate tunisie", "complément magnésium tunisie", "prix magnésium tunisie"]


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


kw = "[" + ",".join('"%s"' % k for k in KEYWORDS) + "]"
assert len(TITLE) <= 62 and 90 <= len(DESC) <= 160, (len(TITLE), len(DESC))
out = [
    "\\o /dev/null",
    'create table if not exists _wave_backup_cat_magnesium as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","ogTitle","ogDescription","updatedAt" from "Category" where slug = \'magnesium\';',
    "\\o",
    'update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoKeywords"=%s,"ogTitle"=%s,"ogDescription"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'magnesium\';' % (q(TITLE), q(DESC), q(H1), q(INTRO), q(BODY), q(kw), q(TITLE), q(DESC)),
    'select slug, indexable, length("seoContent") from "Category" where slug=\'magnesium\';',
]
print(f"-- title {len(TITLE)} desc {len(DESC)} words {len(BODY.split())}", file=sys.stderr)
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
