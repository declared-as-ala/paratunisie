"""SQL for the two hub categories (complements-alimentaires, nutrition-sportive). Output is UTF-8 with LF endings.
Demand evidence (Search Console, 90d): "complément alimentaire tunisie" ~211 impressions at position 64-66;
"nutrition sportive tunisie" ~136 impressions at position 67-77. Links go only to indexable child categories.
"""
import sys

C = {}
C["complements-alimentaires"] = dict(
    title="Compléments alimentaires en Tunisie | ParaTunisie",
    desc="Vitamines, magnésium, oméga-3, zinc, ashwagandha : compléments alimentaires de marques internationales livrés en Tunisie. Comparez avant de choisir.",
    h1="Compléments alimentaires en Tunisie",
    intro="Vitamines, minéraux, oméga-3, ashwagandha et bien d'autres : parcourez les compléments alimentaires de marques internationales comme NOW Foods, Solgar, Swanson ou Nutricost, livrés partout en Tunisie avec paiement à la livraison.",
    body="""## Les familles de compléments

Choisissez d'abord la famille qui correspond à votre besoin, puis comparez les produits à l'intérieur :

- **[Vitamines et multivitamines](/vitamines)** : vitamine D3, C, B12, K2 et formules complètes.
- **[Magnésium](/magnesium)** : bisglycinate, citrate, avec ou sans vitamine B6.
- **[Oméga-3](/omega-3)** : EPA et DHA, huile de poisson ou d'algue.
- **[Zinc](/zinc)** : bisglycinate, picolinate, gluconate.
- **[Ashwagandha](/ashwagandha)** : extraits standardisés en gélules ou en poudre.

Le catalogue comprend aussi des plantes et extraits, des probiotiques, des formules pour le sommeil, l'immunité ou les articulations, ainsi que des compléments pour la performance sportive, à retrouver dans les sous-catégories de cette page.

## Comment choisir un complément alimentaire

Un complément ne remplace pas une alimentation variée. Pour comparer deux références, regardez :

1. **La composition détaillée** et la quantité de substance active par prise.
2. **La forme** (par exemple bisglycinate ou oxyde pour le magnésium), qui change la tolérance.
3. **Le nombre de doses** du pot, pour calculer un coût par jour réel.
4. **Les allergènes et excipients** mentionnés sur l'étiquette.

Nos guides détaillent les bases : [vitamines pour sportifs](/conseils/vitamines-pour-sportifs-guide), [types de magnésium](/conseils/types-de-magnesium-comparatif), [choisir un oméga-3](/conseils/comment-choisir-omega-3-epa-dha), [zinc bisglycinate](/conseils/zinc-bisglycinate-guide) et [ashwagandha](/conseils/comment-choisir-ashwagandha).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) et notre [politique éditoriale](/politique-editoriale) pour connaître notre démarche. Respectez toujours la posologie indiquée par le fabricant et demandez l'avis d'un professionnel de santé en cas de grossesse, d'allaitement, de pathologie ou de traitement en cours.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Les conditions sont détaillées sur les pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Les compléments alimentaires sont-ils des médicaments ?

Non. Ce sont des produits destinés à compléter l'alimentation. Ils ne soignent aucune maladie et ne remplacent pas un avis médical.

### Comment choisir entre deux marques ?

Comparez la composition, la forme des nutriments, le dosage par prise et le prix par dose plutôt que le seul prix du pot.

### Puis-je cumuler plusieurs compléments ?

Cela dépend des produits. Vérifiez les doses totales, surtout pour les vitamines liposolubles (A, D, E, K) et les minéraux comme le zinc, et demandez conseil à un professionnel de santé en cas de doute.""",
)
C["nutrition-sportive"] = dict(
    title="Nutrition sportive en Tunisie : whey, créatine | ParaTunisie",
    desc="Whey, créatine, BCAA, EAA, pre-workout et gainers : nutrition sportive de marques internationales livrée en Tunisie. Guides de choix, paiement à la livraison.",
    h1="Nutrition sportive en Tunisie",
    intro="Protéines whey, créatine, acides aminés, pre-workout, gainers et accessoires : comparez la nutrition sportive de marques comme Optimum Nutrition, Dymatize, BSN ou Nutricost, avec livraison partout en Tunisie.",
    body="""## Choisir selon votre objectif

- **Récupération et apport en protéines** : [whey protéine](/whey-proteine) et [whey isolate](/whey-isolate).
- **Force et performance** : [créatine monohydrate](/creatine).
- **Acides aminés** : [BCAA](/bcaa), [EAA](/eaa) et [acides aminés et glutamine](/acides-amines).
- **Avant l'entraînement** : [pre-workout et énergie](/pre-workout).
- **Prise de masse** : [gainers et prise de masse](/gainers-proteines).
- **Matériel du quotidien** : [accessoires et shakers](/accessoires).

## Les repères pour bien comparer

Les protéines en poudre sont utiles si votre alimentation n'apporte pas assez de protéines ; elles ne remplacent pas un repas équilibré. Pour comparer deux produits :

1. **Protéines par dose** (lisez le tableau nutritionnel, pas seulement la face avant du pot).
2. **Prix par portion**, en divisant le prix du pot par le nombre de doses.
3. **Ingrédients** : édulcorants, arômes, épaississants.
4. **Format** : petit pot pour tester une saveur, grand format pour un usage régulier.

Pour aller plus loin : [whey protéine, le guide](/conseils/whey-protein-tunisie-guide), [meilleure créatine en Tunisie](/conseils/meilleure-creatine-tunisie), [BCAA ou EAA](/conseils/bcaa-ou-eaa), [prise de masse](/conseils/prise-de-masse-tunisie-guide) et [compléments pour débuter en musculation](/conseils/complements-musculation-debutant).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. Respectez les doses indiquées par le fabricant. Ces produits sont des compléments alimentaires : demandez conseil à un professionnel de santé en cas de pathologie, de grossesse ou de traitement.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Par quel produit commencer ?

Beaucoup de pratiquants commencent par une protéine en poudre pour compléter leurs apports, puis ajoutent éventuellement de la créatine. Votre alimentation et votre objectif guident le choix.

### Whey isolate ou whey concentrée ?

L'isolat est plus filtré : en général plus de protéines et moins de lactose, de lipides et de glucides par portion. La whey concentrée est souvent plus abordable. Notre catégorie [whey isolate](/whey-isolate) détaille la différence.

### Les produits livrés sont-ils adaptés aux débutants ?

La plupart des références conviennent à un usage courant si la posologie du fabricant est respectée. Lisez chaque fiche produit et demandez conseil en cas de doute.""",
)


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_hubs as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for k, v in C.items():
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), k))
    print(f"-- {k}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
