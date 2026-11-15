"""SQL for the flagship category /creatine (Batch 10). UTF-8, LF.

Sources used for the health wording (verified by search on 2026-11-15):
 - EFSA: authorised EU claim "increases physical performance in successive bursts of short-term, high-intensity exercise" for foods
   providing 3 g of creatine per day, for adults doing high-intensity exercise; separate 2016 opinion on muscle strength in adults over 55
   with resistance training (efsa.europa.eu/en/efsajournal/pub/4400).
 - ISSN position stand 2017 (Kreider et al., J Int Soc Sports Nutr 14:18): creatine is safe and well tolerated in healthy people;
   no compelling evidence of negative effects on kidney function; isolated case reports exist.
Catalogue facts (2026-11-15): 257 published creatine references (116 monohydrate, 14 micronised, 21 gummies, 27 capsules/tablets,
3 HCl, 3 Kre-Alkalyn, 5 liposomal, 1 Creapure, 57 blends); 13 shown in stock (8 brands).
Nothing about prices is hard-coded in the text: the live table gives them.
"""
import sys

TITLE = "Créatine en Tunisie : Prix, Marques & Guide | ParaTunisie"
DESC = "Comparez les créatines en stock en Tunisie : monohydrate, micronisée, prix au 100 g et guide d'achat. Livraison en 24 à 48 h, paiement à la livraison."
H1 = "Créatine en Tunisie"
INTRO = ("Poudre monohydrate, micronisée ou autres formes : comparez les créatines de Real Pharm, BioTechUSA, OstroVit, Optimum Nutrition, "
         "Quamtrax et d'autres marques. Le comparatif ramène chaque prix au 100 g et le guide explique comment choisir. "
         "Livraison en 24 à 48 h, paiement à la livraison.")

BODY = """La créatine est l'un des compléments les plus utilisés en musculation et dans les sports de force. Ce guide vous aide à choisir : quelle forme, quel format, comment comparer les prix sans vous tromper et à quoi faire attention. Les produits en stock sont affichés au-dessus, avec leur prix en dinars tunisiens ; le tableau comparatif plus bas ramène chaque référence au prix pour 100 g.

## La créatine, de quoi parle-t-on ?

La créatine est une molécule que l'organisme fabrique lui-même et que l'on trouve aussi dans certains aliments d'origine animale comme la viande et le poisson. En complément alimentaire, elle se présente le plus souvent en poudre, mais aussi en gélules, en comprimés ou en gommes. C'est un complément alimentaire : il ne remplace ni une alimentation variée ni un avis médical, et il ne soigne aucune maladie.

## Ce que disent les sources fiables

Deux repères utiles pour distinguer les faits du marketing :

- **L'Autorité européenne de sécurité des aliments (EFSA)** a évalué la créatine. Une allégation est autorisée dans l'Union européenne : la créatine, à raison de 3 g par jour, peut augmenter la performance physique lors de séries successives d'exercices de haute intensité et de courte durée, chez les adultes qui pratiquent ce type d'exercice. Un avis distinct de 2016 concerne la force musculaire des adultes de plus de 55 ans, en association avec un entraînement de résistance.
- **La prise de position 2017 de la Société internationale de nutrition sportive (ISSN)** conclut que la créatine est bien tolérée chez les personnes en bonne santé aux doses usuelles, et qu'il n'existe pas de preuve convaincante d'un effet négatif sur la fonction rénale chez les sujets sains, tout en mentionnant l'existence de cas isolés rapportés.

Ces éléments décrivent ce que la science établit en général ; ils ne garantissent aucun résultat individuel et ne remplacent pas l'avis d'un professionnel de santé.

## Quelle forme de créatine choisir ?

Toutes les créatines ne se présentent pas de la même façon. Voici les formes que l'on rencontre dans notre catalogue, de la plus courante à la plus spécifique :

- **Monohydrate en poudre** : c'est la forme de référence et de loin la plus représentée, avec plus d'une centaine de références. Les poudres monohydrate actuellement en stock viennent de Real Pharm, BioTechUSA, OstroVit, Quamtrax, William Bonac, Kevin Levrone, Challenger Nutrition et Optimum Nutrition.
- **Créatine micronisée** : la même molécule, réduite en poudre plus fine pour se mélanger plus facilement. Optimum Nutrition la propose en [317 g](/produits/micronised-creatine-optimum-nutrition-317g) et en [634 g](/produits/micronised-creatine-powder-634g-optimum-nutrition).
- **Mention de matière première (par exemple Creapure)** : certaines marques indiquent la matière première utilisée. Notre guide [Creapure ou créatine monohydrate classique](/conseils/creapure-vs-creatine-monohydrate) explique ce que cette mention signifie et ce qu'elle ne garantit pas.
- **Gélules et comprimés** : pratiques en déplacement et sans goût, mais il faut souvent plusieurs gélules pour atteindre une dose ; comparez le coût par dose et non le prix du flacon.
- **Gommes à mâcher** : faciles à prendre, généralement plus chères, avec une quantité de créatine par gomme à vérifier sur l'étiquette.
- **HCl, Kre-Alkalyn, liposomale** : des formes alternatives mises en avant par leurs marques. Les sources citées plus haut portent sur la créatine en général, et nous n'avons pas de source fiable à citer pour affirmer qu'elles surpassent le monohydrate : pour ces références, le prix par dose reste le critère le plus objectif.
- **Mélanges** (créatine avec HMB, collagène, NAD+ ou une formule énergie) : lisez la composition, car la quantité de créatine par dose peut être inférieure à celle d'un produit simple.

Les poudres sont les références affichées en stock ; les gommes, gélules, comprimés et mélanges sont en général proposés sur commande, avec l'état indiqué sur chaque fiche.

## Comparer les prix : le coût au gramme et par dose

Le prix d'un pot ne dit rien tant qu'on ne connaît pas son contenu. Deux calculs simples suffisent :

- **Le prix pour 100 g** : prix du pot ÷ poids en grammes × 100.
- **Le coût par dose** : une dose de 3 g est la quantité de référence de l'allégation européenne citée plus haut. Un pot de 300 g contient donc 100 doses de 3 g, un pot de 500 g environ 166 doses. À titre d'exemple chiffré, un pot de 300 g à 100 DT revient à 1 DT par dose, et un pot de 500 g à 149 DT à environ 0,90 DT par dose.

Le tableau ci-dessous applique ce calcul aux références actuellement en stock.

{{comparatif}}

Retenez deux choses. Un petit format permet d'essayer une marque sans gros budget ; un grand format est plus économique à l'usage, à condition d'être sûr de votre choix. Et comparez toujours des produits de même nature : une poudre pure et un mélange n'apportent pas la même quantité de créatine par dose.

## Comment prendre la créatine ?

La dose la plus souvent citée est de 3 à 5 g par jour, et 3 g correspond à la quantité de l'allégation européenne. Elle se mélange à de l'eau ou à une boisson de votre choix. Ce qui compte pour la plupart des protocoles, c'est une prise régulière : notre guide [créatine avant ou après l'entraînement](/conseils/creatine-avant-ou-apres-entrainement) détaille la question du moment, et [combien de temps prendre de la créatine](/conseils/combien-de-temps-prendre-creatine) répond à la question de la durée.

Certains protocoles prévoient une phase de charge de quelques jours à dose plus élevée ; elle n'est pas indispensable. Suivez toujours la posologie indiquée sur l'emballage du produit que vous choisissez, et buvez suffisamment d'eau au cours de la journée. Pour le détail, voir [comment prendre la créatine](/conseils/comment-prendre-creatine) et [créatine monohydrate : bienfaits et dosage](/conseils/creatine-monohydrate-bienfaits-dosage).

## À qui s'adresse la créatine, et quelles précautions ?

L'allégation européenne vise les adultes qui pratiquent des exercices intenses et répétés. Demandez l'avis d'un médecin ou d'un pharmacien avant de commencer si vous avez une maladie, notamment rénale, si vous suivez un traitement, si vous êtes enceinte ou si vous allaitez. Les compléments ne sont pas destinés aux mineurs. Notre page [créatine pour femme](/conseils/creatine-femme) répond aux questions les plus fréquentes sur ce sujet.

## Choisir selon votre profil

- **Vous testez une marque ou vous débutez** : un petit format comme la [créatine Real Pharm 150 g](/produits/creatine-monohydrate-150gr-real-pharm) limite l'investissement de départ.
- **Vous voulez un usage régulier au meilleur prix au 100 g** : regardez les formats de 500 g, par exemple [OstroVit](/produits/creatine-monohydrate-ostrovit-500gr), [Real Pharm](/produits/creatine-monohydrate-500gr-real-pharm), [Quamtrax](/produits/creatine-monohydrate-500g-quamtrax), [William Bonac Mono Lift](/produits/mono-lift-william-bonac-signature-500-g) ou [BioTechUSA](/produits/100-creatine-monohydrate-500g-biotech-usa), puis confirmez avec le tableau.
- **Vous préférez une poudre micronisée** : [Optimum Nutrition en 317 g](/produits/micronised-creatine-optimum-nutrition-317g) ou [en 634 g](/produits/micronised-creatine-powder-634g-optimum-nutrition).
- **Vous voulez une marque internationale en format intermédiaire** : [BioTechUSA 300 g](/produits/100-creatine-monohydrate-300g-biotech-usa), [Kevin Levrone Gold Creatine 300 g](/produits/gold-creatine-kevin-levrone-300-g) ou [Challenger Nutrition 300 g](/produits/creatine-300gr-challenger-nutrition).
- **Vous ne voulez pas de poudre** : les gélules, comprimés et gommes sont proposés sur commande ; le bouton « Demander ce produit » de chaque fiche permet de connaître le prix et le délai avant de vous engager.

## Les marques disponibles

Le catalogue compte plus de 250 références de créatine. Parmi les marques dont des poudres sont affichées en stock : [Optimum Nutrition](/marques/optimum-nutrition), [BioTechUSA](/marques/biotech-usa), [Real Pharm](/marques/real-pharm), [OstroVit](/marques/ostrovit), [Quamtrax](/marques/quamtrax), [William Bonac](/marques/william-bonac), [Kevin Levrone](/marques/kevin-levrone) et [Challenger Nutrition](/marques/challenger-nutrition). Chaque page de marque regroupe ses références et leur état de stock.

## Associer la créatine à d'autres produits

La créatine ne remplace pas un apport suffisant en protéines : voyez la [whey protéine](/whey-proteine) ou la [whey isolate](/whey-isolate). Pour les acides aminés, comparez les [BCAA](/bcaa) et les [EAA](/eaa) ; pour la prise avant l'effort, les [pre-workout](/pre-workout) et notre guide [pre-workout ou créatine](/conseils/pre-workout-ou-creatine). Retrouvez l'ensemble de l'offre dans la [nutrition sportive](/nutrition-sportive), et notre [comparatif complet sur la créatine en Tunisie](/conseils/meilleure-creatine-tunisie).

## Livraison, paiement et authenticité

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Les conditions sont détaillées sur nos pages [livraison](/livraison) et [retours](/retours), et notre démarche sur la page [authenticité](/authenticite).

## Questions fréquentes

### Quelle est la meilleure créatine ?

Il n'existe pas de « meilleure » créatine pour tout le monde. La forme de référence est le monohydrate ; ensuite, les critères objectifs sont le prix au 100 g ou par dose, la clarté de l'étiquette et le format adapté à votre usage. Le comparatif de cette page applique ces critères aux références en stock.

### Créatine monohydrate ou micronisée : quelle différence ?

C'est la même molécule. La poudre micronisée est simplement plus fine, ce qui peut faciliter le mélange dans l'eau. Comparez surtout le prix par dose.

### Comment comparer le prix de deux créatines ?

Calculez le prix pour 100 g (prix ÷ poids × 100) ou le coût par dose de 3 g (prix ÷ nombre de doses du pot). Le tableau comparatif de cette page le fait pour vous pour les références en stock.

### Quelle dose de créatine prendre par jour ?

La dose la plus souvent citée est de 3 à 5 g par jour, 3 g étant la quantité de l'allégation européenne. Suivez la posologie du fabricant et demandez conseil à un professionnel de santé en cas de doute.

### Faut-il faire une phase de charge ?

Certains protocoles en prévoient une, mais elle n'est pas indispensable. Une prise quotidienne régulière suffit pour la plupart des pratiquants.

### Quand prendre la créatine : avant ou après l'entraînement ?

Pour la plupart des protocoles, la régularité compte plus que le moment exact. Notre guide créatine avant ou après l'entraînement détaille les différents cas.

### La créatine est-elle sans danger ?

D'après la prise de position 2017 de l'ISSN, elle est bien tolérée chez les personnes en bonne santé aux doses usuelles, sans preuve convaincante d'effet négatif sur les reins chez les sujets sains. Demandez l'avis d'un médecin en cas de maladie, notamment rénale, de traitement en cours, de grossesse ou d'allaitement.

### Quelle différence entre la créatine et la whey ?

La whey est une source de protéines ; la créatine est une molécule distincte. Ce ne sont pas des produits interchangeables : consultez nos catégories whey protéine et créatine pour comparer chacun selon son usage.

### Où acheter de la créatine en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager.

### Les gommes et les gélules valent-elles la poudre ?

Elles sont plus pratiques mais souvent plus chères pour une même quantité de créatine. Vérifiez la quantité par dose et comparez le coût par dose avec celui d'une poudre."""

KEYWORDS = ["créatine tunisie", "créatine monohydrate prix tunisie", "créatine monohydrate tunisie", "prix créatine", "acheter créatine", "créatine micronisée"]


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


kw = "[" + ",".join('"%s"' % k for k in KEYWORDS) + "]"
out = [
    "\\o /dev/null",
    'create table if not exists _wave_backup_cat_flagship as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","ogTitle","ogDescription","imageAlt","updatedAt" from "Category" where slug = \'creatine\';',
    "\\o",
    'update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoKeywords"=%s,"ogTitle"=%s,"ogDescription"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'creatine\';' % (q(TITLE), q(DESC), q(H1), q(INTRO), q(BODY), q(kw), q(TITLE), q(DESC)),
    'select slug, indexable, length("seoContent") from "Category" where slug=\'creatine\';',
]
print(f"-- title {len(TITLE)} desc {len(DESC)} intro {len(INTRO)} words {len(BODY.split())}", file=sys.stderr)
assert len(TITLE) <= 60 and 90 <= len(DESC) <= 160
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
