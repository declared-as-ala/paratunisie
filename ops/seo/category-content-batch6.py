"""SQL for /creatine and /whey-proteine (Batch 6). Output: UTF-8, LF.
Demand evidence (Search Console, 90d): /whey-proteine 359 impr pos 68.5 ("whey tunisie" 101, "proteine anabolic tunisie" 118,
"gold standard whey tunisie" ~120 across variants); /creatine 72 impr pos 87.
Only facts from the catalogue are stated: brands and formats of PUBLISHED + indexable products. No dosage prescription, no medical claim.
"""
import sys

C = {}
C["creatine"] = dict(
    title="Créatine monohydrate en Tunisie : marques et prix | ParaTunisie",
    desc="Créatine monohydrate en poudre : Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, Quamtrax. Formats 150 g à 634 g, livraison en Tunisie, paiement à la livraison.",
    h1="Créatine monohydrate en Tunisie",
    intro="Comparez les créatines en poudre disponibles chez ParaTunisie : Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, Quamtrax, Challenger Nutrition ou Kevin Levrone. Livraison partout en Tunisie, paiement à la livraison.",
    body="""## Choisir sa créatine

La créatine monohydrate est la forme la plus courante en complémentation sportive. Pour comparer deux produits de la page, regardez surtout :

1. **La forme** : monohydrate en poudre (la plus répandue), micronisée (poudre plus fine, qui se mélange plus facilement) ou autres formes présentées par la marque.
2. **Le format** : de 150 g pour essayer à 500 g ou 634 g pour un usage régulier. Divisez le prix par le nombre de doses indiqué sur l'étiquette pour obtenir un coût par prise.
3. **Les ingrédients ajoutés** : une créatine simple ne contient en général qu'un seul ingrédient ; certaines références ajoutent arômes ou édulcorants.
4. **La marque et la mention de qualité** : certaines marques indiquent la matière première utilisée. Notre guide [Creapure ou créatine monohydrate classique](/conseils/creapure-vs-creatine-monohydrate) explique ce que cette mention signifie.

## Les marques disponibles

Les références actuellement proposées viennent de marques comme [Optimum Nutrition (Micronised Creatine 317 g)](/produits/micronised-creatine-optimum-nutrition-317g), BioTechUSA (300 g et 500 g), OstroVit, Quamtrax, Real Pharm (150 g, 300 g et 500 g), Challenger Nutrition, Kevin Levrone et William Bonac. Les disponibilités changent : l'état de stock affiché sur chaque fiche fait foi.

## Nos guides sur la créatine

- [Meilleure créatine en Tunisie : comparatif et guide](/conseils/meilleure-creatine-tunisie)
- [Comment prendre la créatine](/conseils/comment-prendre-creatine)
- [Créatine monohydrate : bienfaits et dosage](/conseils/creatine-monohydrate-bienfaits-dosage)
- [Créatine avant ou après l'entraînement](/conseils/creatine-avant-ou-apres-entrainement)
- [Combien de temps prendre de la créatine](/conseils/combien-de-temps-prendre-creatine)
- [Créatine pour femme](/conseils/creatine-femme)

## Pour compléter votre routine

Associez la créatine à une alimentation adaptée à votre objectif. Retrouvez aussi la [whey protéine](/whey-proteine), les [BCAA et EAA](/bcaa), les [pre-workout](/pre-workout) ou l'ensemble de la [nutrition sportive](/nutrition-sportive). Le guide [pre-workout ou créatine](/conseils/pre-workout-ou-creatine) détaille la différence entre les deux.

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. La créatine est un complément alimentaire : respectez la posologie indiquée par le fabricant et demandez l'avis d'un professionnel de santé en cas de pathologie (notamment rénale), de grossesse, d'allaitement ou de traitement en cours.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Quelle créatine choisir pour débuter ?

Une créatine monohydrate simple, dans un format modeste, suffit pour commencer. Comparez la composition et le coût par dose plutôt que le seul prix du pot.

### Créatine micronisée ou classique : quelle différence ?

La poudre micronisée est plus fine, ce qui peut faciliter le mélange dans l'eau. Le contenu en créatine monohydrate est le même ; vérifiez les indications de la marque.

### Comment savoir combien prendre ?

Suivez la posologie inscrite sur l'étiquette du produit choisi. Notre guide [comment prendre la créatine](/conseils/comment-prendre-creatine) présente les repères courants, et un professionnel de santé peut vous conseiller selon votre situation.

### Où acheter de la créatine en Tunisie ?

Sur ParaTunisie, vous commandez en ligne et payez à la livraison, avec une livraison en 24 à 48 h dans toute la Tunisie.""",
)
C["whey-proteine"] = dict(
    title="Whey protéine en Tunisie : marques et prix | ParaTunisie",
    desc="Whey protéine : Optimum Nutrition, BioTechUSA, Ultimate Nutrition, MuscleTech, ProActive. Pots de 908 g à 2,4 kg, livraison en Tunisie et paiement à la livraison.",
    h1="Whey protéine en Tunisie",
    intro="Comparez les whey protéines disponibles chez ParaTunisie : Optimum Nutrition Gold Standard, BioTechUSA, Ultimate Nutrition, MuscleTech, ProActive, Scenit ou William Bonac. Livraison partout en Tunisie, paiement à la livraison.",
    body="""## Choisir sa whey

La whey est une protéine issue du lactosérum, vendue en poudre à mélanger avec de l'eau ou du lait. Elle complète l'alimentation quand les apports en protéines sont insuffisants ; elle ne remplace pas un repas équilibré. Pour comparer deux produits :

1. **Protéines par dose** : lisez le tableau nutritionnel au dos du pot, pas seulement l'avant.
2. **Prix par portion** : divisez le prix du pot par le nombre de doses indiqué.
3. **Concentrée ou isolat** : l'isolat est plus filtré (voir [whey isolate](/whey-isolate) et le guide [isolate ou concentrate](/conseils/whey-isolate-vs-concentrate)).
4. **Ingrédients** : édulcorants, arômes, épaississants. Notez aussi la présence de lactose si vous y êtes sensible.
5. **Format** : de 908 g pour tester une saveur à 2 kg et plus pour un usage régulier.

## Les marques disponibles

La sélection actuelle comprend notamment [Optimum Nutrition Gold Standard 100% Whey (2,27 kg)](/produits/100-whey-gold-standard-2-27kg), [ProActive Anabolic Whey 80 (2,25 kg)](/produits/anabolic-whey-80-2-25kg-proactive), [BioTechUSA 100% Pure Whey (2,27 kg)](/produits/100-pure-whey-2-27kg-biotech-usa), Ultimate Nutrition Prostar, MuscleTech Nitro-Tech, Scenit Nutrition Tantor et William Bonac. Les disponibilités changent : l'état de stock affiché sur chaque fiche fait foi.

## Nos guides sur la whey

- [Whey protein en Tunisie : le guide complet](/conseils/whey-protein-tunisie-guide)
- [Whey pour débutant en musculation](/conseils/whey-pour-debutant)
- [Combien de whey par jour](/conseils/combien-de-whey-par-jour)
- [Quand prendre la whey](/conseils/quand-prendre-la-whey)
- [Whey isolate ou concentrate](/conseils/whey-isolate-vs-concentrate)
- [Whey ou gainer pour prendre de la masse](/conseils/whey-ou-gainer-prise-de-masse)

## Autres produits de nutrition sportive

Pour aller plus loin, voyez la [whey isolate](/whey-isolate), les [gainers et produits de prise de masse](/gainers-proteines), la [créatine](/creatine), les [BCAA et EAA](/bcaa) ou toute la [nutrition sportive](/nutrition-sportive).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. La whey est un complément alimentaire : respectez les indications du fabricant et demandez l'avis d'un professionnel de santé en cas d'allergie au lait, de pathologie, de grossesse ou de traitement en cours.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Quelle whey choisir pour débuter ?

Une whey concentrée classique dans un format moyen convient pour commencer. Comparez les protéines par dose, les ingrédients et le prix par portion. Notre guide [whey pour débutant](/conseils/whey-pour-debutant) détaille la démarche.

### Whey ou isolate : laquelle est la plus adaptée ?

L'isolat est plus filtré et affiche en général davantage de protéines et moins de lactose par portion ; la whey concentrée est souvent plus abordable. Lisez l'étiquette de chaque produit.

### Quand et combien en prendre ?

Cela dépend de votre alimentation et de votre objectif. Suivez la posologie du fabricant et consultez nos guides [quand prendre la whey](/conseils/quand-prendre-la-whey) et [combien de whey par jour](/conseils/combien-de-whey-par-jour).

### Les produits sont-ils livrés rapidement en Tunisie ?

Oui : livraison en 24 à 48 h dans toute la Tunisie, avec paiement à la livraison.""",
)


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_batch6 as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for k, v in C.items():
    assert len(v["title"]) <= 66, (k, len(v["title"]))
    assert len(v["desc"]) <= 175, (k, len(v["desc"]))
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), k))
    print(f"-- {k}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
