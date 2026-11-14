"""Generates SQL for the Batch 5 category content (vitamines, magnesium, omega-3, zinc).
Writes with LF endings (CRLF breaks the FAQ parser). Run: python category-content-batch5.py > out.sql
Content rules: no invented benefits, reviews or certifications; only well-established facts about forms, label
reading and general safety. Demand evidence: docs/seo/GSC_OPPORTUNITIES.json (90-day Search Console data).
"""
import sys

C = {}

C["vitamines"] = dict(
    title="Vitamines et multivitamines en Tunisie | ParaTunisie",
    desc="Vitamines D3, C, B12, multivitamines et formules ciblées : comparez marques, dosages et formats en Tunisie. Livraison 24–48h, paiement à la livraison.",
    h1="Vitamines et multivitamines en Tunisie",
    intro="Multivitamines, vitamine D3, vitamine C, vitamines du groupe B, K2 : retrouvez les compléments vitaminés de marques comme Swanson, Solgar, NOW Foods ou NaturesPlus. Comparez les dosages, les formes et les formats avant de choisir.",
    body="""## Comment choisir ses vitamines

Un complément vitaminé ne remplace pas une alimentation variée : il peut aider à combler un apport insuffisant identifié, pas à « booster » une alimentation déjà complète. Avant d'acheter, repérez ce dont vous avez réellement besoin plutôt que de prendre un produit au hasard.

Points à comparer sur chaque fiche :

- **Le dosage par prise** et le pourcentage des apports de référence indiqué sur l'étiquette. Plus n'est pas toujours mieux.
- **La forme de la vitamine** : par exemple D3 (cholécalciférol) plutôt que D2, ou B12 sous forme de méthylcobalamine ou de cyanocobalamine, selon la formule.
- **Le format** : comprimés, gélules, gommes ou liquide. Le nombre de prises par jour change le coût réel par mois.
- **Les ingrédients associés** : excipients, édulcorants, allergènes éventuels (soja, gluten, lait).
- **Le prix par jour de cure**, en divisant le prix du flacon par le nombre de doses.

Les vitamines liposolubles (A, D, E, K) peuvent s'accumuler dans l'organisme : respectez toujours la dose indiquée et ne cumulez pas plusieurs produits qui en contiennent sans vérifier le total.

Pour compléter votre sélection, consultez nos [magnésium](/magnesium), nos [oméga-3](/omega-3), nos [zinc](/zinc) ou l'ensemble des [compléments alimentaires](/complements-alimentaires). Nos [conseils](/conseils) détaillent aussi les bases de la supplémentation.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Les informations de composition et de posologie figurent sur chaque fiche produit.

Ces produits sont des compléments alimentaires. Demandez conseil à un professionnel de santé en cas de grossesse, d'allaitement, de pathologie ou de traitement en cours.

## Questions fréquentes

### Faut-il prendre des vitamines tous les jours ?

Cela dépend de votre alimentation et de vos besoins. Suivez la posologie du fabricant et, en cas de doute ou de traitement, demandez l'avis d'un professionnel de santé.

### Quelle différence entre une multivitamine et une vitamine seule ?

Une multivitamine associe plusieurs vitamines et parfois des minéraux dans une même prise. Une vitamine seule, comme la D3 ou la C, permet de cibler un apport précis.

### Comment comparer deux produits de vitamines ?

Comparez le dosage par prise, la forme de la vitamine, le nombre de doses par flacon et la liste des ingrédients, pas seulement le prix.""",
)

C["magnesium"] = dict(
    title="Magnésium en Tunisie : bisglycinate, citrate | ParaTunisie",
    desc="Magnésium bisglycinate, citrate, glycinate, avec ou sans B6 : comparez formes, dosages et marques en Tunisie. Livraison 24–48h, paiement à la livraison.",
    h1="Magnésium en Tunisie",
    intro="Bisglycinate, glycinate, citrate, malate, oxyde ou formules avec vitamine B6 : le magnésium existe sous de nombreuses formes. Comparez les références de marques comme Source Naturals, NOW Foods, Nutricost ou Bluebonnet pour trouver celle qui correspond à vos besoins.",
    body="""## Choisir son magnésium : la forme compte

Le magnésium est un minéral présent dans l'alimentation (légumes verts, oléagineux, céréales complètes, légumineuses). Les compléments diffèrent surtout par leur **forme chimique** :

- **Bisglycinate / glycinate** : magnésium lié à un acide aminé, souvent choisi pour sa bonne tolérance digestive.
- **Citrate** : forme courante et bien connue, dont l'effet sur le transit peut être marqué chez certaines personnes.
- **Malate** : magnésium associé à l'acide malique.
- **Oxyde** : forme très concentrée en magnésium élémentaire, généralement moins bien absorbée.
- **Avec vitamine B6** : certaines formules associent les deux ; vérifiez la dose de B6 sur l'étiquette.

Regardez surtout la quantité de **magnésium élémentaire** par prise (et non le poids total de la gélule ou du comprimé), le nombre de prises par jour et le nombre de doses du pot.

Les personnes ayant une insuffisance rénale ou prenant certains traitements doivent demander l'avis d'un professionnel de santé avant toute supplémentation. Ne dépassez pas la dose indiquée par le fabricant.

Pour aller plus loin, consultez nos [vitamines](/vitamines), nos [zinc](/zinc), nos [oméga-3](/omega-3) ou l'ensemble des [compléments alimentaires](/complements-alimentaires), ainsi que nos [conseils](/conseils).

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. La composition détaillée et la posologie sont indiquées sur chaque fiche produit.

Les compléments alimentaires ne remplacent pas une alimentation variée et équilibrée.

## Questions fréquentes

### Quelle forme de magnésium choisir ?

Il n'y a pas de forme universelle. Le bisglycinate est apprécié pour sa tolérance, le citrate est très répandu, l'oxyde est concentré mais moins bien absorbé. Comparez la teneur en magnésium élémentaire.

### Pourquoi certains magnésiums contiennent-ils de la vitamine B6 ?

Certaines formules associent les deux nutriments. Vérifiez la dose de B6 sur l'étiquette et évitez de cumuler plusieurs produits qui en contiennent.

### Peut-on prendre du magnésium en continu ?

Suivez la posologie du fabricant. En cas de pathologie, de traitement ou de grossesse, demandez l'avis d'un professionnel de santé.""",
)

C["omega-3"] = dict(
    title="Oméga-3 EPA et DHA en Tunisie | ParaTunisie",
    desc="Oméga-3 EPA et DHA, huile de poisson, krill ou algue : comparez dosages, formes et marques (Carlson, NOW Foods, Nordic Naturals) en Tunisie. Livraison 24–48h.",
    h1="Oméga-3 EPA et DHA en Tunisie",
    intro="Huile de poisson, huile de foie de morue, krill ou formules à base d'algues : comparez les oméga-3 de marques comme Carlson, NOW Foods, Barlean's, Nordic Naturals ou Micro Ingredients, en capsules ou en liquide.",
    body="""## Lire l'étiquette d'un oméga-3

La mention « 1000 mg d'huile de poisson » ne dit pas combien d'oméga-3 actifs vous apportez. Ce qui compte, c'est la quantité d'**EPA** et de **DHA** par prise, indiquée au dos du produit.

Quelques repères pour comparer :

- **EPA + DHA par dose** : additionnez-les, puis divisez le prix du pot par le nombre de doses pour obtenir un coût par jour réaliste.
- **Source** : huile de poisson, huile de foie de morue, krill ou algue (alternative sans poisson). Les teneurs en EPA et DHA diffèrent selon la source.
- **Forme** : triglycérides naturels ou re-estérifiés, ou esters éthyliques. Les fiches indiquent la forme quand le fabricant la précise.
- **Format** : capsules molles, gélules ou liquide (le goût et la praticité varient).
- **Fraîcheur et conservation** : les huiles s'oxydent ; respectez les conditions de conservation indiquées.

Les personnes sous traitement anticoagulant, ayant une allergie au poisson ou enceintes doivent demander l'avis d'un professionnel de santé avant de choisir un complément.

Complétez votre sélection avec nos [vitamines](/vitamines), nos [magnésium](/magnesium), nos [zinc](/zinc) ou les [compléments alimentaires](/complements-alimentaires). Notre [guide oméga-3](/conseils/omega-3-tunisie-guide) détaille les bases.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Les informations de composition et de posologie sont sur chaque fiche.

Ces produits sont des compléments alimentaires et ne remplacent pas une alimentation variée.

## Questions fréquentes

### Quelle est la différence entre EPA et DHA ?

Ce sont les deux principaux acides gras oméga-3 à longue chaîne présents dans les poissons gras. Les produits en contiennent des proportions différentes : comparez-les sur l'étiquette.

### Huile de poisson ou huile d'algue ?

L'huile de poisson est la source la plus courante. L'huile d'algue est une alternative d'origine végétale pour celles et ceux qui évitent le poisson.

### Comment comparer deux oméga-3 ?

Comparez la quantité d'EPA et de DHA par dose, le nombre de doses par pot, la source et la forme, plutôt que le seul poids d'huile.""",
)

C["zinc"] = dict(
    title="Zinc en Tunisie : bisglycinate, picolinate | ParaTunisie",
    desc="Compléments de zinc : bisglycinate, picolinate, citrate, gluconate. Comparez dosages et marques (NOW Foods, Nutricost, Solaray) en Tunisie. Livraison 24–48h.",
    h1="Zinc en Tunisie",
    intro="Bisglycinate, picolinate, citrate, gluconate ou formules associées au cuivre ou à la vitamine C : comparez les compléments de zinc de marques comme NOW Foods, Nutricost, Nature's Life, 21st Century ou Solaray.",
    body="""## Choisir un complément de zinc

Le zinc est un oligo-élément présent dans la viande, les fruits de mer, les légumineuses et les graines. Les compléments se distinguent par leur **forme** (bisglycinate, picolinate, citrate, gluconate, oxyde) et par la **quantité de zinc élémentaire** par prise, qui est la valeur à comparer.

À vérifier avant d'acheter :

- **La dose de zinc élémentaire** par gélule ou comprimé, et non le poids du sel de zinc.
- **Le nombre de doses** du flacon, pour calculer un coût par jour.
- **L'association éventuelle avec du cuivre** : une prise prolongée de zinc peut perturber l'équilibre en cuivre, d'où l'intérêt de lire attentivement la composition.
- **Le format** : gélules, comprimés, pastilles ou liquide.

La limite supérieure de sécurité fixée par l'EFSA pour les adultes est de 25 mg de zinc par jour, tous apports confondus : évitez de cumuler plusieurs produits qui en contiennent. Demandez l'avis d'un professionnel de santé en cas de traitement, de grossesse ou de pathologie.

Découvrez aussi nos [magnésium](/magnesium), nos [vitamines](/vitamines), nos [oméga-3](/omega-3) et l'ensemble des [compléments alimentaires](/complements-alimentaires). Les formules ZMA sont regroupées dans la catégorie [ZMA](/zma). Nos [conseils](/conseils) complètent la sélection.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. La composition et la posologie sont indiquées sur chaque fiche.

Les compléments alimentaires ne remplacent pas une alimentation variée et équilibrée.

## Questions fréquentes

### Quelle forme de zinc choisir ?

Il n'y a pas de forme unique recommandée. Bisglycinate, picolinate, citrate et gluconate sont courants ; comparez surtout la dose de zinc élémentaire et la tolérance.

### Peut-on dépasser la dose indiquée ?

Non. L'EFSA fixe une limite supérieure de 25 mg par jour pour les adultes, tous apports confondus. Respectez toujours la posologie du fabricant.

### Le zinc se prend-il avec du cuivre ?

Certaines formules associent les deux. Lisez la composition et demandez conseil à un professionnel de santé en cas de doute.""",
)


def q(s: str) -> str:
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_catcontent2 as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for k, v in C.items():
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), k))
    print(f"-- {k}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.write("\n".join(out) + "\n")
