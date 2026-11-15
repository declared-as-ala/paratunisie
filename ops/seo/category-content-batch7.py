"""SQL for /bcaa, /gainers-proteines, /pre-workout (Batch 7). UTF-8, LF. Facts = brands/formats of published + indexable products.
Demand (Search Console 90d): gainer queries land on product pages (levro legendary mass, real mass); pre workout queries on psychotic;
bcaa on mrm bcaa. No dosage prescription, no performance or medical claim."""
import sys

C = {}
C["bcaa"] = dict(
    title="BCAA en Tunisie : marques, formats et prix | ParaTunisie",
    desc="BCAA en poudre ou en gélules : Xtend, Real Pharm et autres marques. Comparez les formats, les arômes et les ingrédients avant de choisir. Livraison en Tunisie.",
    h1="BCAA en Tunisie",
    intro="Les BCAA (leucine, isoleucine, valine) sont des acides aminés vendus en poudre ou en gélules. Comparez les références de ParaTunisie, de Xtend à Real Pharm, avec livraison partout en Tunisie.",
    body="""## Choisir ses BCAA

Les BCAA regroupent trois acides aminés : la leucine, l'isoleucine et la valine. Pour comparer deux produits, regardez l'étiquette :

1. **Le ratio** leucine / isoleucine / valine (par exemple 2:1:1 ou 8:1:1) et la quantité de chaque acide aminé par portion.
2. **La forme** : poudre à diluer ou gélules. La poudre se dose plus facilement, les gélules se transportent mieux.
3. **Les ingrédients ajoutés** : arômes, édulcorants, électrolytes, vitamines.
4. **Le prix par portion** : divisez le prix du produit par le nombre de portions indiqué.

## Les références du catalogue

La sélection comprend notamment [Xtend BCAA (420 g)](/produits/xtend-bcaa-420g) et [Real Pharm BCAA 8:1:1 (400 g)](/produits/bcaa-8-1-1-400g-real-pharm). L'état de stock affiché sur chaque fiche fait foi.

## BCAA ou EAA ?

Les EAA contiennent les neuf acides aminés essentiels, dont les trois BCAA. Notre guide [BCAA ou EAA](/conseils/bcaa-ou-eaa) explique la différence, et la catégorie [EAA](/eaa) regroupe ces produits. Pour d'autres acides aminés (glutamine, arginine, citrulline), voyez [acides aminés](/acides-amines) et le guide [citrulline, arginine et bêta-alanine](/conseils/citrulline-arginine-beta-alanine).

## Compléter sa routine

Les acides aminés ne remplacent pas un apport suffisant en protéines : retrouvez la [whey protéine](/whey-proteine), la [whey isolate](/whey-isolate), la [créatine](/creatine) ou toute la [nutrition sportive](/nutrition-sportive).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. Respectez la posologie indiquée par le fabricant et demandez l'avis d'un professionnel de santé en cas de pathologie, de grossesse, d'allaitement ou de traitement en cours.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Que signifie BCAA ?

C'est l'abréviation anglaise de « branched-chain amino acids », les acides aminés à chaîne ramifiée : leucine, isoleucine et valine.

### BCAA en poudre ou en gélules ?

La poudre se mesure à la dose voulue et se mélange à l'eau ; les gélules sont pratiques en déplacement. Comparez surtout la quantité d'acides aminés par portion.

### Quelle différence entre BCAA et EAA ?

Les EAA couvrent les neuf acides aminés essentiels, les BCAA seulement trois d'entre eux. Voir le guide [BCAA ou EAA](/conseils/bcaa-ou-eaa).""",
)
C["gainers-proteines"] = dict(
    title="Gainers en Tunisie : prise de masse, marques, prix | ParaTunisie",
    desc="Mass gainers de 2,7 à 7 kg : Serious Mass, Real Mass, Big Monster, Thunder Gainer, Levro Legendary Mass. Comparez avant de choisir. Livraison en Tunisie.",
    h1="Gainers et prise de masse en Tunisie",
    intro="Un gainer est une poudre riche en calories (glucides et protéines) destinée à compléter l'alimentation. Comparez les mass gainers disponibles chez ParaTunisie, de 2,7 à 7 kg, avec livraison partout en Tunisie.",
    body="""## Choisir son gainer

Un gainer apporte beaucoup de calories par portion. Il complète l'alimentation de ceux qui ont du mal à atteindre leurs besoins ; il ne remplace pas des repas équilibrés. Pour comparer :

1. **Les calories et les protéines par portion** (lisez le tableau nutritionnel, la taille de la portion varie beaucoup d'une marque à l'autre).
2. **La part de glucides et de sucres** dans la composition.
3. **Le format** : de 2,7 kg pour tester à 6,8 ou 7 kg pour un usage régulier.
4. **Le prix par portion**, plus parlant que le prix du sac.

## Les marques disponibles

La sélection comprend notamment [Optimum Nutrition Serious Mass (5,45 kg)](/produits/serious-mass-5-45-kg-optimum-nutrition), [Real Pharm Real Mass (6,8 kg)](/produits/real-mass-6-8-kg-real-pharm), [Kevin Levrone Levro Legendary Mass (6,8 kg)](/produits/levro-legendary-mass-6-8kg-kevin-levrone), [HX Nutrition Big Monster (7 kg)](/produits/big-monster-7-kg-hx-nutrition), [Challenger Nutrition Thunder Gainer (5,4 kg)](/produits/thunder-gainer-5-4kg-challenger-nutrition), ainsi que Action Labs, Eric Favre, Scenit Nutrition et Advanced Naturals. Les disponibilités changent : l'état de stock affiché sur chaque fiche fait foi.

## Nos guides sur la prise de masse

- [Meilleur gainer en Tunisie](/conseils/meilleur-gainer-tunisie)
- [Comment prendre un mass gainer](/conseils/comment-prendre-un-mass-gainer)
- [Whey ou gainer pour prendre de la masse](/conseils/whey-ou-gainer-prise-de-masse)
- [Prise de masse en Tunisie : le guide](/conseils/prise-de-masse-tunisie-guide)

## Pour aller plus loin

Associez votre gainer à une alimentation adaptée. Voyez aussi la [whey protéine](/whey-proteine), la [créatine](/creatine) et toute la [nutrition sportive](/nutrition-sportive).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. Respectez la posologie du fabricant et demandez l'avis d'un professionnel de santé en cas de pathologie (diabète notamment), de grossesse ou de traitement en cours.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Gainer ou whey : que choisir ?

La whey apporte surtout des protéines ; le gainer ajoute beaucoup de glucides et de calories. Le guide [whey ou gainer](/conseils/whey-ou-gainer-prise-de-masse) détaille le choix.

### Comment comparer deux gainers ?

Comparez les calories et les protéines par portion, la part de sucres, le format et le prix par portion.

### Un gainer remplace-t-il un repas ?

Non. C'est un complément alimentaire qui s'ajoute à une alimentation variée.""",
)
C["pre-workout"] = dict(
    title="Pre-workout en Tunisie : marques et prix | ParaTunisie",
    desc="Pre-workout en poudre : C4 Original, Redcon1 Total War, Insane Labz Psychotic, Real Pharm King, Challenger Pump Extreme. Comparez avant de choisir. Livraison en Tunisie.",
    h1="Pre-workout en Tunisie",
    intro="Comparez les pre-workout de marques comme Cellucor C4, Redcon1, Insane Labz, Real Pharm, Challenger Nutrition ou Eric Favre. Livraison partout en Tunisie, paiement à la livraison.",
    body="""## Choisir son pre-workout

Un pre-workout est une poudre à diluer, prise avant l'entraînement. La plupart contiennent de la caféine et d'autres ingrédients dont la liste varie beaucoup. Pour comparer deux produits :

1. **La teneur en caféine par portion**, indiquée sur l'étiquette. Elle varie fortement d'un produit à l'autre.
2. **Les autres ingrédients** (citrulline, bêta-alanine, taurine, etc.) et leurs quantités.
3. **Les édulcorants et colorants** si vous y êtes sensible.
4. **Le nombre de portions** du pot et le prix par portion.
5. **Une version sans caféine** si vous vous entraînez le soir ou y êtes sensible. Notre guide [pre-workout sans caféine](/conseils/pre-workout-sans-cafeine-pump) en parle.

## Les références du catalogue

La sélection comprend notamment [Cellucor C4 Original](/produits/c4-original-pre-workout-cellucor), [Redcon1 Total War (465 g)](/produits/total-war-preworkout-redcon1-465g), [Insane Labz Psychotic](/produits/psychotic-pre-workout), [Real Pharm King Pre-Workout (500 g)](/produits/king-real-preworkout-500gr-real-pharm-tunisie), [Challenger Nutrition Pump Extreme](/produits/pump-extreme-pre-workout-challenger-nutrition-30-servings), [Eric Favre Born Rage](/produits/pre-workout-born-rage-original-eric-favre) et [Victor Martinez Break-Out](/produits/victor-martinez-break-out-pre-workout). L'état de stock affiché sur chaque fiche fait foi.

## Nos guides

- [Meilleur pre-workout en Tunisie](/conseils/meilleur-pre-workout-tunisie)
- [Comment utiliser un pre-workout](/conseils/comment-utiliser-pre-workout)
- [Pre-workout ou créatine](/conseils/pre-workout-ou-creatine)
- [Citrulline, arginine et bêta-alanine](/conseils/citrulline-arginine-beta-alanine)

## Pour aller plus loin

Voyez aussi la [créatine](/creatine), les [BCAA](/bcaa), les [EAA](/eaa) et toute la [nutrition sportive](/nutrition-sportive).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. Ces produits contiennent souvent des stimulants : ils ne conviennent pas à tout le monde. Respectez la posologie du fabricant et demandez l'avis d'un professionnel de santé en cas de problème cardiaque, d'hypertension, de grossesse, d'allaitement ou de traitement en cours. Ne les destinez pas aux mineurs.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Un pre-workout contient-il toujours de la caféine ?

Pas toujours : il existe des versions sans stimulant. Lisez la composition et la teneur en caféine par portion.

### Comment choisir entre deux pre-workout ?

Comparez la caféine par portion, la liste des ingrédients et leurs doses, ainsi que le prix par portion.

### Peut-on associer pre-workout et créatine ?

Ce sont deux produits différents. Le guide [pre-workout ou créatine](/conseils/pre-workout-ou-creatine) explique la différence.""",
)


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_batch7 as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for k, v in C.items():
    assert len(v["title"]) <= 66, (k, len(v["title"]))
    assert len(v["desc"]) <= 175, (k, len(v["desc"]))
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), k))
    print(f"-- {k}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
