"""SQL for /whey-proteine at flagship level (Batch 10). UTF-8, LF. Same method as category-creatine-flagship.py.
Catalogue facts (2026-11-15): 168 published whey references from 51 brands; 11 indexable references shown in stock (Ultimate Nutrition
Prostar 907 g and 2.4 kg, Scenit Tantor 908 g and 2.267 kg, William Bonac Whey Ultimate and Whey Regime 2 kg, ProActive Anabolic Whey 80
2.25 kg, MuscleTech Nitro-Tech 1.81 kg, BioTechUSA 100% Pure Whey 2.27 kg, Optimum Nutrition Gold Standard 2.27 kg).
No dosage figures and no health effect are stated: the page explains how to compare, not what to expect.
"""
import sys

TITLE = "Whey protéine en Tunisie : prix & marques | ParaTunisie"
DESC = "Comparez les whey protéine en stock en Tunisie : prix au 100 g, formats de 900 g à 2,4 kg et guide d'achat. Livraison en 24 à 48 h, paiement à la livraison."
H1 = "Whey protéine en Tunisie"
INTRO = ("Gold Standard, Prostar, Nitro-Tech, Anabolic Whey, Tantor, 100% Pure Whey : comparez les whey en stock, du pot de 900 g aux formats de 2 kg et plus. "
         "Le tableau ramène chaque prix au 100 g et le guide explique comment lire une étiquette. Livraison en 24 à 48 h, paiement à la livraison.")

BODY = """La whey est la poudre de protéines la plus répandue en musculation et en fitness. Ce guide explique comment choisir sans vous laisser guider par la seule face avant du pot : la différence entre concentrée, isolat et hydrolysée, ce qu'il faut lire sur l'étiquette et comment comparer les prix de formats différents. Les références en stock sont affichées au-dessus, avec leur prix en dinars tunisiens.

## La whey, de quoi parle-t-on ?

La whey (ou protéine de lactosérum) est l'une des protéines du lait, séparée lors de la fabrication du fromage puis transformée en poudre. On la mélange à de l'eau ou à du lait. C'est un complément alimentaire : il permet de compléter l'apport en protéines quand l'alimentation n'y suffit pas, mais il ne remplace pas un repas équilibré.

## Concentrée, isolat ou hydrolysée ?

Trois mots reviennent sur les pots. Voici ce qu'ils désignent, sans promesse sur les résultats :

- **Whey concentrée** : la forme la plus courante et généralement la plus abordable. Elle contient les protéines du lactosérum accompagnées d'un peu de lactose et de matières grasses.
- **Whey isolate (isolat)** : plus filtrée, elle affiche en général une proportion de protéines plus élevée et moins de lactose, de lipides et de glucides par portion. Notre catégorie [whey isolate](/whey-isolate) et le guide [isolate ou concentrate](/conseils/whey-isolate-vs-concentrate) détaillent la différence.
- **Whey hydrolysée** : les protéines sont fragmentées en peptides plus petits par un procédé enzymatique. C'est une forme plus rare et en général plus chère.

Beaucoup de références n'indiquent pas le type de whey dans leur nom : vérifiez-le toujours sur la fiche et sur l'étiquette.

## Lire une étiquette de whey

Quatre lignes comptent plus que la photo du pot :

- **Les protéines par portion** et la **taille de la portion** : deux marques peuvent annoncer une portion de 25 g ou de 33 g, ce qui change le nombre de portions du pot.
- **La liste des ingrédients** : arômes, édulcorants, épaississants, et présence de lactose ou d'additifs si vous y êtes sensible.
- **Les allergènes** : la whey est un produit laitier.
- **Le nombre de portions** : il permet de calculer le prix par portion.

## Comparer les prix : le coût au gramme et par portion

Un pot de 900 g et un pot de 2,27 kg ne se comparent pas à l'œil. Deux calculs suffisent :

- **Le prix pour 100 g de poudre** : prix du pot ÷ poids en grammes × 100.
- **Le prix par portion** : prix du pot ÷ nombre de portions annoncé.

Le tableau ci-dessous applique le premier calcul aux whey actuellement affichées en stock.

{{comparatif}}

Attention : c'est le prix de la **poudre**, pas celui des protéines. Une whey à 80 % de protéines et une autre à 90 % n'apportent pas la même quantité de protéines pour 100 g ; si la fiche indique le pourcentage ou les grammes de protéines par portion, ramenez-y votre comparaison.

## Combien en prendre et quand ?

Les besoins en protéines dépendent du poids, de l'activité et de l'alimentation, et la whey n'est qu'une source parmi d'autres. Nos guides détaillent ces points : [combien de whey par jour](/conseils/combien-de-whey-par-jour), [quand prendre la whey](/conseils/quand-prendre-la-whey) et [whey pour débutant](/conseils/whey-pour-debutant). Suivez la portion indiquée sur l'emballage et demandez l'avis d'un professionnel de santé en cas de doute.

## Choisir selon votre profil

- **Vous testez une marque avec un petit budget** : les pots de 900 g environ, comme [Ultimate Nutrition Prostar 907 g](/produits/prostar-100-whey-protein-907g) ou [Scenit Tantor 908 g](/produits/tantor-whey-protein-908-g-scenit-nutrition).
- **Vous voulez une référence mondialement connue** : [Optimum Nutrition Gold Standard 2,27 kg](/produits/100-whey-gold-standard-2-27kg) ou [BioTechUSA 100% Pure Whey 2,27 kg](/produits/100-pure-whey-2-27kg-biotech-usa).
- **Vous achetez en grand format pour un usage régulier** : [ProActive Anabolic Whey 80 2,25 kg](/produits/anabolic-whey-80-2-25kg-proactive), [William Bonac Whey Ultimate 2 kg](/produits/whey-ultimate-2kg-william-bonac), [William Bonac Whey Régime 2 kg](/produits/whey-regime-2kg-william-bonac), [Ultimate Nutrition Prostar 2,4 kg](/produits/prostar-100-whey-protein-2-4kg) ou [Scenit Tantor 2,267 kg](/produits/tantor-whey-protein-2267-g-scenit-nutrition).
- **Vous cherchez une alternative plus filtrée** : voyez la catégorie [whey isolate](/whey-isolate).
- **Vous voulez prendre de la masse** : comparez avec les [gainers](/gainers-proteines), plus riches en glucides et en calories.

## Précautions

Évitez la whey en cas d'allergie aux protéines de lait. En cas d'intolérance au lactose, d'une maladie, notamment rénale, d'un traitement en cours, de grossesse ou d'allaitement, demandez l'avis d'un médecin ou d'un pharmacien. Les compléments ne sont pas destinés aux mineurs.

## Les marques disponibles

Parmi les marques dont des whey sont affichées en stock : [Optimum Nutrition](/marques/optimum-nutrition), [BioTechUSA](/marques/biotech-usa), [Ultimate Nutrition](/marques/ultimate-nutrition), [William Bonac](/marques/william-bonac), [ProActive](/marques/proactive) et [MuscleTech](/marques/muscletech). Chaque page de marque regroupe ses références et leur état de stock.

## Associer la whey à d'autres produits

La [créatine](/creatine) est un produit distinct, souvent associée à la whey dans une routine de musculation. Pour les acides aminés, comparez les [BCAA](/bcaa) et les [EAA](/eaa). Retrouvez l'ensemble de l'offre dans la [nutrition sportive](/nutrition-sportive), et notre [guide complet de la whey en Tunisie](/conseils/whey-protein-tunisie-guide).

## Livraison, paiement et authenticité

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Les conditions sont détaillées sur nos pages [livraison](/livraison) et [retours](/retours), et notre démarche sur la page [authenticité](/authenticite).

## Questions fréquentes

### Quelle est la meilleure whey protéine ?

Il n'y a pas de meilleure whey pour tout le monde. Comparez les protéines par portion, la liste des ingrédients, le prix au 100 g et le prix par portion, puis choisissez le format qui correspond à votre consommation.

### Whey concentrée ou isolat : laquelle choisir ?

L'isolat est plus filtré et affiche en général davantage de protéines et moins de lactose par portion ; la concentrée est souvent plus abordable. Lisez le tableau nutritionnel de chaque produit.

### Comment comparer le prix de deux whey ?

Calculez le prix pour 100 g de poudre et le prix par portion, puis rapportez-les au pourcentage de protéines si la fiche l'indique. Le tableau de cette page applique le premier calcul aux références en stock.

### Combien de whey faut-il prendre par jour ?

Cela dépend de votre alimentation, de votre poids et de votre activité. La whey complète l'apport en protéines sans le remplacer ; suivez la portion indiquée par le fabricant et demandez conseil en cas de doute.

### Quand prendre sa whey ?

Pour la plupart des pratiquants, ce qui compte est l'apport total de la journée. Notre guide sur le bon moment pour prendre la whey détaille les situations courantes.

### La whey convient-elle aux personnes intolérantes au lactose ?

La whey est un produit laitier. Les isolats contiennent en général moins de lactose, mais vérifiez l'étiquette et demandez l'avis d'un professionnel de santé en cas d'intolérance ou d'allergie.

### Où acheter de la whey en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager.

### Whey ou gainer : quelle différence ?

La whey apporte surtout des protéines ; le gainer ajoute beaucoup de glucides et de calories. Notre guide whey ou gainer pour prendre de la masse détaille le choix."""

KEYWORDS = ["whey tunisie", "whey protein tunisie", "protéine whey tunisie", "whey protéine prix tunisie", "gold standard whey tunisie", "anabolic whey tunisie"]


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


kw = "[" + ",".join('"%s"' % k for k in KEYWORDS) + "]"
assert len(TITLE) <= 62 and 90 <= len(DESC) <= 160, (len(TITLE), len(DESC))
out = [
    "\\o /dev/null",
    'create table if not exists _wave_backup_cat_whey as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","ogTitle","ogDescription","imageAlt","updatedAt" from "Category" where slug = \'whey-proteine\';',
    "\\o",
    'update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoKeywords"=%s,"ogTitle"=%s,"ogDescription"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'whey-proteine\';' % (q(TITLE), q(DESC), q(H1), q(INTRO), q(BODY), q(kw), q(TITLE), q(DESC)),
    'select slug, indexable, length("seoContent") from "Category" where slug=\'whey-proteine\';',
]
print(f"-- title {len(TITLE)} desc {len(DESC)} intro {len(INTRO)} words {len(BODY.split())}", file=sys.stderr)
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
