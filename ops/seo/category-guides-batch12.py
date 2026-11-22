"""Batch 12: /ashwagandha (replaces unsupported health claims), /accessoires (was a 437-char stub), /whey-hydrolysee (new guide, made indexable:
3 indexable products, 3 in stock). Claim-free. Rollback of indexation: update "Category" set indexable=false where slug='whey-hydrolysee'."""
import sys

C = {}

C["ashwagandha"] = dict(
    title="Ashwagandha en Tunisie : prix, formats et guide | ParaTunisie",
    desc="Comparez l'ashwagandha en Tunisie : gélules ou comprimés, extrait, dose par prise, prix par jour. Guide d'achat et livraison en 24 à 48 h.",
    h1="Ashwagandha en Tunisie",
    intro=("Real Pharm, BioTechUSA ou weightworld : comparez les compléments d'ashwagandha en stock, en gélules ou en comprimés. "
           "Le guide explique comment lire l'étiquette, repérer l'extrait utilisé et comparer le coût par jour."),
    kw=["ashwagandha tunisie", "ashwagandha prix tunisie", "ashwagandha ksm-66 tunisie", "ashwagandha gélules tunisie"],
    body="""L'ashwagandha (Withania somnifera) est une plante utilisée depuis longtemps en médecine traditionnelle indienne. Elle se vend aujourd'hui en complément alimentaire, sous des formes et des dosages très différents. Ce guide vous aide à comparer les produits sur des critères vérifiables. Il ne promet aucun effet : aucune allégation de santé n'est formulée ici.

## Ashwagandha en complément alimentaire

Le complément contient la poudre de racine ou un extrait standardisé de la plante, en gélules, en comprimés ou en poudre. C'est un complément alimentaire : il ne remplace ni une alimentation variée ni un avis médical, et il ne soigne aucune maladie.

## Lire l'étiquette

1. **La nature de l'ingrédient** : poudre de racine ou extrait. Certaines fiches mentionnent un extrait de marque (par exemple KSM-66) : vérifiez ce qui est écrit sur l'emballage, la mention doit figurer sur le produit lui-même.
2. **La quantité d'ashwagandha par dose** et **la taille de la dose** : une dose peut être d'un ou plusieurs comprimés.
3. **Le nombre de doses** du flacon, pour calculer un coût par jour.
4. **Les ingrédients associés** (vitamines, magnésium, autres plantes) et les excipients.
5. **Les mises en garde** du fabricant.

## Comparer les prix : le coût par jour

Calculez le coût par jour : prix du flacon ÷ nombre de jours couverts par la dose recommandée par le fabricant. Un flacon de 180 comprimés peut revenir moins cher par jour qu'un flacon de 60 gélules, mais seulement si les doses d'extrait sont comparables : lisez la quantité par comprimé.

## Choisir selon votre profil

- **Vous voulez une référence affichée en stock** : [Real Pharm Ashwagandha 100 % naturel, 90 comprimés](/produits/ashwagandha-100-natural-90tabs), [BioTechUSA Ashwagandha, 60 gélules](/produits/ashwagandha-60-gelules-biotech-usa) ou [weightworld Ashwagandha KSM-66, 180 comprimés de 1 500 mg](/produits/ashwagandha-ksm-66-en-comprimes-180-1500-mg).
- **Vous comparez avec d'autres compléments** : voyez le [magnésium](/magnesium), le [zinc](/zinc) ou les [vitamines](/vitamines).

## Précautions

Respectez la posologie indiquée par le fabricant. Demandez l'avis d'un médecin ou d'un pharmacien avant de consommer de l'ashwagandha en cas de grossesse, d'allaitement, de troubles de la thyroïde, de maladie du foie, de maladie auto-immune ou de traitement en cours (notamment sédatifs ou traitements immunosuppresseurs). Arrêtez en cas de gêne et consultez. Les compléments ne sont pas destinés aux mineurs.

## Aller plus loin

Retrouvez tous nos [compléments alimentaires](/complements-alimentaires) et la marque [Real Pharm](/marques/real-pharm). Consultez notre page [authenticité](/authenticite), la [livraison](/livraison) (24 à 48 h partout en Tunisie, paiement à la livraison) et les [retours](/retours).

## Questions fréquentes

### Qu'est-ce que l'ashwagandha ?

C'est une plante (Withania somnifera) dont la racine, en poudre ou en extrait, est utilisée en complément alimentaire.

### Que signifie KSM-66 sur une étiquette ?

C'est le nom d'un extrait de marque. Vérifiez qu'il figure sur l'emballage du produit et comparez la quantité d'extrait par dose.

### Comment comparer deux produits d'ashwagandha ?

Comparez la nature de l'ingrédient (poudre ou extrait), la quantité par dose, le nombre de doses et le coût par jour.

### Peut-on en prendre sans avis médical ?

Les compléments ne remplacent pas un avis médical. Demandez conseil à un professionnel de santé en cas de grossesse, d'allaitement, de maladie ou de traitement.

### Où acheter de l'ashwagandha en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison.""",
)

C["accessoires"] = dict(
    title="Accessoires de musculation en Tunisie : prix | ParaTunisie",
    desc="Shakers, ceintures, straps, gants et bandes : comparez les accessoires de musculation en stock en Tunisie. Livraison en 24 à 48 h.",
    h1="Accessoires de musculation en Tunisie",
    intro=("Shakers, ceintures de musculation, lifting straps, bandes de poignet, gants et bandes de genou : les accessoires en stock chez ParaTunisie, "
           "avec leur prix en dinars et la livraison en 24 à 48 h partout en Tunisie."),
    kw=["accessoires musculation tunisie", "shaker tunisie", "ceinture musculation tunisie", "straps musculation tunisie"],
    body="""Les accessoires ne se choisissent pas comme des compléments : ce sont la taille, la matière et l'usage qui comptent. Ce guide présente les accessoires actuellement disponibles et les points à vérifier avant d'acheter. Il ne promet aucune protection ni aucun résultat : aucune allégation de santé n'est formulée ici.

## Les accessoires disponibles

- **Shakers et bouteilles** : [Protein Shaker 450 ml Sport Life](/produits/protein-shaker-450ml-sport-life) et [bouteille d'eau 2,2 litres](/produits/bouteille-d-eau-2-2-litres). Vérifiez la contenance, la fermeture et l'entretien indiqués sur la fiche.
- **Ceintures de musculation** : [ceinture dos de musculation](/produits/ceinture-dos-de-musculation) et [ceinture dos Gold's Gym](/produits/ceinture-dos-gold-s-gym). Vérifiez le tour de taille couvert et la fermeture avant de commander.
- **Prise de barre** : [lifting straps](/produits/lifting-straps), [bandes de tirage](/produits/bandes-de-tirage) et [gants de musculation Buka Fighting Gear](/produits/gant-de-musculation-buka-fighting-gear). Lisez les tailles et matières annoncées.
- **Poignets et genoux** : [bandes de poignet](/produits/bandes-de-poignet) et [bande de genou](/produits/bande-genoux). Ces articles sont des accessoires de confort et de maintien : ils ne remplacent pas l'avis d'un médecin ou d'un kinésithérapeute en cas de douleur ou de blessure.

## Comment choisir

1. **La taille ou la contenance** annoncée sur la fiche.
2. **La matière** et les consignes d'entretien.
3. **L'usage prévu** : entraînement en salle, transport, hydratation.
4. **Le prix** : comparez des articles de même type et de même taille.

## Aller plus loin

Complétez votre équipement avec nos [compléments de nutrition sportive](/nutrition-sportive), la [créatine](/creatine) ou la [whey protéine](/whey-proteine). Consultez la [livraison](/livraison) (24 à 48 h partout en Tunisie, paiement à la livraison) et les [retours](/retours).

## Questions fréquentes

### Quel shaker choisir ?

Choisissez la contenance adaptée à vos portions (450 ml pour une portion standard) et vérifiez la fermeture et la facilité de nettoyage.

### Comment choisir une ceinture de musculation ?

Vérifiez le tour de taille couvert par chaque modèle et la fermeture. Demandez l'avis d'un professionnel du sport ou de santé en cas de douleur au dos.

### Les bandes de poignet ou de genou protègent-elles d'une blessure ?

Ce sont des accessoires de maintien et de confort, qui ne remplacent ni un échauffement adapté ni un avis médical.

### Où acheter des accessoires de musculation en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison.""",
)

C["whey-hydrolysee"] = dict(
    title="Whey hydrolysée en Tunisie : prix et guide | ParaTunisie",
    desc="Comparez les whey hydrolysées en Tunisie : Dymatize ISO 100, Hydro Whey et Iso Hydro Zero. Prix au 100 g et guide d'achat.",
    h1="Whey hydrolysée en Tunisie",
    intro=("Dymatize ISO 100 Hydrolyzed 932 g, Optimum Nutrition Hydro Whey 1,59 kg ou William Bonac Iso Hydro Zero 1,8 kg : "
           "comparez les whey hydrolysées en stock, avec le prix ramené au 100 g."),
    kw=["whey hydrolysée tunisie", "iso 100 dymatize tunisie", "whey hydrolysée prix tunisie", "hydro whey tunisie"],
    body="""La whey hydrolysée est une whey dont les protéines ont été découpées en fragments plus petits par hydrolyse. Elle est vendue plus cher que la whey classique : ce guide vous aide à comparer sans vous fier à un seul mot sur l'étiquette. Il ne promet aucun résultat : aucune allégation de santé ou de performance n'est formulée ici.

## Whey hydrolysée : de quoi parle-t-on ?

L'hydrolyse est un procédé qui fragmente les protéines du lactosérum. Le produit final peut être un isolat hydrolysé, un mélange d'isolat et d'hydrolysat ou une autre composition : le nom du produit ne suffit pas, il faut lire la liste des ingrédients. C'est un complément alimentaire, qui ne remplace ni un repas équilibré ni un avis médical.

## Lire l'étiquette

1. **La nature des protéines** : isolat hydrolysé, mélange, concentré. La liste des ingrédients indique l'ordre.
2. **Les protéines par portion** et **la taille de la portion**.
3. **Le nombre de portions** du pot.
4. **Le lactose, les édulcorants et les arômes**.
5. **Les allergènes** : la whey est un produit laitier.

## Comparer les prix

Ramenez le prix à 100 g de poudre (prix du pot ÷ poids en grammes × 100), puis au prix par portion. Le tableau ci-dessous applique le premier calcul aux références actuellement affichées en stock.

{{comparatif}}

Le prix au 100 g compare la poudre : rapportez-le aux protéines par portion avant de conclure.

## Choisir selon votre profil

- **Vous cherchez une référence connue** : [Dymatize ISO 100 Hydrolyzed Gourmet Chocolate, 932 g](/produits/iso-100-hydrolyzed-gourmet-chocolate-932g-dymatize) ou [Optimum Nutrition Hydro Whey, 1,59 kg](/produits/hydro-whey-1-59-kg).
- **Vous préférez un grand format** : [William Bonac Iso Hydro Zero, 1,8 kg](/produits/iso-hydro-zero-1800g-william-bonac).
- **Vous hésitez avec une whey moins chère** : comparez avec la [whey isolate](/whey-isolate) ou la [whey protéine](/whey-proteine).

## Précautions

Évitez la whey en cas d'allergie aux protéines de lait. Demandez l'avis d'un médecin ou d'un pharmacien en cas d'intolérance, de maladie (notamment rénale), de traitement en cours, de grossesse ou d'allaitement. Les compléments ne sont pas destinés aux mineurs.

## Aller plus loin

Retrouvez la [créatine](/creatine), les [BCAA](/bcaa), les [EAA](/eaa) et toute la [nutrition sportive](/nutrition-sportive). Marques présentes : [Optimum Nutrition](/marques/optimum-nutrition) et [William Bonac](/marques/william-bonac). Voir aussi [authenticité](/authenticite), [livraison](/livraison) (24 à 48 h partout en Tunisie, paiement à la livraison) et [retours](/retours).

## Questions fréquentes

### Qu'est-ce qu'une whey hydrolysée ?

C'est une whey dont les protéines ont été fragmentées par hydrolyse. Lisez la liste des ingrédients pour connaître la composition exacte du produit.

### Whey hydrolysée ou whey isolate ?

Ce sont deux présentations différentes, parfois combinées dans un même produit. Comparez la composition et le prix par portion. Voir la [whey isolate](/whey-isolate).

### Comment comparer deux whey hydrolysées ?

Comparez les protéines par portion, le nombre de portions, la composition et le prix au 100 g.

### Est-elle adaptée en cas d'intolérance au lactose ?

Elle reste un produit laitier : vérifiez l'étiquette et demandez l'avis d'un professionnel de santé.

### Où acheter une whey hydrolysée en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison.""",
)

def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_cat_batch12 as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","ogTitle","ogDescription","updatedAt" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for slug, v in C.items():
    assert len(v["title"]) <= 64 and 90 <= len(v["desc"]) <= 152, (slug, len(v["title"]), len(v["desc"]))
    kw = "[" + ",".join('"%s"' % k for k in v["kw"]) + "]"
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoKeywords"=%s,"ogTitle"=%s,"ogDescription"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), q(kw), q(v["title"]), q(v["desc"]), slug))
    print(f"-- {slug}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append("update \"Category\" set indexable=true where slug='whey-hydrolysee';")
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
