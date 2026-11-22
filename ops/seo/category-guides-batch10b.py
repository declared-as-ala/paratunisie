"""SQL for /whey-isolate, /vitamines and /omega-3 (Batch 10). UTF-8, LF. Claim-free: forms, label reading, price comparison and precautions only.
No dosage figure, no benefit and no unverified regulatory number is stated; the only conversion used (1 microgramme of vitamin D = 40 UI)
is a unit definition. Products linked are indexable and shown in stock on 2026-11-15 (or sold on order, said explicitly)."""
import sys

C = {}

C["whey-isolate"] = dict(
    title="Whey isolate en Tunisie : prix, marques et guide | ParaTunisie",
    desc="Comparez les whey isolate en stock en Tunisie : prix au 100 g, formats de 900 g à 2 kg et guide d'achat. Livraison en 24 à 48 h, paiement à la livraison.",
    h1="Whey isolate en Tunisie",
    intro=("Iso Sensation, V-Zero Isopro, Whey Isolate Complex, All In Isolate ou Premium Isolate : comparez les whey isolate en stock, du pot de 910 g aux formats de 2 kg. "
           "Le tableau ramène chaque prix au 100 g et le guide explique la différence avec la whey concentrée."),
    kw=["whey isolate tunisie", "isolat de whey tunisie", "whey isolate prix tunisie"],
    body="""La whey isolate (ou isolat de lactosérum) est une version plus filtrée de la whey. Ce guide explique ce que cela change sur l'étiquette, comment comparer des formats différents et à quoi faire attention. Les références en stock sont affichées au-dessus, avec leur prix en dinars tunisiens.

## Whey isolate : de quoi parle-t-on ?

L'isolat part des mêmes protéines de lactosérum que la whey concentrée, mais subit un filtrage supplémentaire. Il affiche en général une proportion de protéines plus élevée et moins de lactose, de lipides et de glucides par portion. C'est un complément alimentaire : il complète l'apport en protéines sans remplacer un repas équilibré.

## Isolat ou concentrée : ce que vous comparez vraiment

- **Les protéines par portion** et **la taille de la portion** : deux isolats peuvent annoncer des portions différentes, ce qui change le nombre de portions du pot.
- **Le lactose** : les isolats en contiennent en général moins, mais ils restent des produits laitiers ; vérifiez l'étiquette.
- **Le prix** : l'isolat est le plus souvent plus cher que la concentrée pour un même poids. Notre guide [isolate ou concentrate](/conseils/whey-isolate-vs-concentrate) détaille la différence et la catégorie [whey protéine](/whey-proteine) regroupe les concentrées.
- **Les ingrédients ajoutés** : arômes, édulcorants, épaississants, enzymes digestives selon les marques.

## Lire une étiquette d'isolat

Regardez dans l'ordre : le pourcentage ou les grammes de protéines par portion, le nombre de portions, la liste des ingrédients et la mention des allergènes (lait). Une mention « isolat » sur la face avant ne remplace pas ces informations.

## Comparer les prix

Pour comparer deux pots de poids différents, ramenez le prix à 100 g de poudre : prix du pot ÷ poids en grammes × 100. Le tableau ci-dessous le fait pour les isolats actuellement affichés en stock.

{{comparatif}}

Attention : c'est le prix de la poudre, pas celui des protéines. Si la fiche indique le pourcentage de protéines, ramenez-y votre comparaison.

## Choisir selon votre profil

- **Vous voulez tester avec un petit budget** : [Ultimate Nutrition Iso Sensation 93, 910 g](/produits/iso-sensation-93-910g).
- **Vous achetez en grand format pour un usage régulier** : [V-Shape Supps V-Zero Isopro 1,8 kg](/produits/v-zero-isopro-1-8-kg-v-shape-supps), [Challenger Nutrition Whey Isolate Complex 2,04 kg](/produits/whey-isolate-complex-2040g-challenger-nutrition), [Big Ramy Labs All In Isolate 2,04 kg](/produits/all-in-isolate-204kg-big-ramy-labs), [Victor Martinez Premium Isolate 2 kg](/produits/premium-isolate-protein-2-kg-victor-martinez) ou [William Bonac Whey Iso Régime 2 kg](/produits/whey-iso-regime-2kg-william-bonac).
- **Vous hésitez avec une whey plus classique** : comparez avec la [whey protéine](/whey-proteine) ou avec les [gainers](/gainers-proteines) si vous cherchez plus de calories.

## Précautions

Évitez la whey en cas d'allergie aux protéines de lait. En cas d'intolérance au lactose, de maladie, notamment rénale, de traitement en cours, de grossesse ou d'allaitement, demandez l'avis d'un médecin ou d'un pharmacien. Les compléments ne sont pas destinés aux mineurs.

## Aller plus loin

Retrouvez la [créatine](/creatine), les [BCAA](/bcaa), les [EAA](/eaa) et toute la [nutrition sportive](/nutrition-sportive). Marques présentes : [Ultimate Nutrition](/marques/ultimate-nutrition), [Challenger Nutrition](/marques/challenger-nutrition), [Big Ramy Labs](/marques/big-ramy-labs), [William Bonac](/marques/william-bonac). Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison : voir [livraison](/livraison), [retours](/retours) et [authenticité](/authenticite).

## Questions fréquentes

### Quelle différence entre whey isolate et whey concentrée ?

L'isolat est plus filtré : il affiche en général davantage de protéines et moins de lactose, de lipides et de glucides par portion. La concentrée est souvent plus abordable. Lisez le tableau nutritionnel de chaque produit.

### La whey isolate est-elle sans lactose ?

Non. Elle en contient en général moins, mais reste un produit laitier. Vérifiez l'étiquette et demandez l'avis d'un professionnel de santé en cas d'intolérance ou d'allergie.

### Comment comparer le prix de deux whey isolate ?

Calculez le prix pour 100 g de poudre et le prix par portion, puis rapportez-les au pourcentage de protéines si la fiche l'indique. Le tableau de cette page applique le premier calcul aux isolats en stock.

### Faut-il choisir un isolat plutôt qu'une concentrée ?

Cela dépend de votre budget et de votre tolérance au lactose. Il n'existe pas de choix universel : comparez les étiquettes.

### Où acheter de la whey isolate en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager.""",
)

C["vitamines"] = dict(
    title="Vitamines en Tunisie : formes, marques et guide | ParaTunisie",
    desc="Multivitamines, vitamine D3, B12, C : comparez les compléments de vitamines en Tunisie, lisez l'étiquette et choisissez. Livraison en 24 à 48 h.",
    h1="Vitamines en Tunisie",
    intro=("Multivitamines, vitamine D3, vitamine C, B12 : comparez les compléments de Real Pharm, BioTechUSA, NOW Foods, 21st Century et d'autres marques. "
           "Le guide explique comment lire une étiquette, ce que signifient les unités (µg, UI, mg) et comment comparer le coût par jour."),
    kw=["vitamines tunisie", "multivitamines tunisie", "vitamine d3 tunisie", "complément vitamines tunisie"],
    body="""Les compléments de vitamines se présentent sous des formes, des dosages et des unités très variés. Ce guide vous aide à les comparer sur des critères vérifiables : la composition, les unités, le nombre de prises et le coût par jour. Il ne promet aucun effet : aucune allégation de santé n'est formulée ici.

## Les vitamines en complément alimentaire

Les vitamines sont des substances que l'on trouve dans l'alimentation. En complément, elles se présentent isolées (vitamine D3, vitamine C, B12), associées entre elles (vitamines B, D3 + K2) ou dans des multivitamines qui ajoutent des minéraux. Ce sont des compléments alimentaires : ils ne remplacent ni une alimentation variée ni un avis médical.

## Les formes que l'on rencontre

- **Multivitamines et multi-minéraux** : une formule complète à prise quotidienne, par exemple chez Scenit, SFD Nutrition, BioTechUSA ou weightworld. Comparez le nombre de nutriments et leur quantité réelle par dose.
- **Vitamine D3, seule ou avec K2** : gélules, comprimés, capsules molles ou gouttes, par exemple chez Real Pharm, NOW Foods ou California Gold Nutrition.
- **Vitamine C et vitamines B** : en comprimés, en poudre ou en spray.
- **Formules spécifiques** (pour sportifs, seniors, femmes, hommes) : les compositions diffèrent, lisez-les plutôt que le nom commercial.

## Lire l'étiquette d'un complément de vitamines

- **L'unité** : une même vitamine peut être exprimée en microgrammes (µg), en milligrammes (mg) ou en unités internationales (UI). Pour la vitamine D, 1 µg équivaut à 40 UI : cette conversion permet de comparer deux produits qui n'utilisent pas la même unité.
- **La quantité par dose et la taille de la dose** : une dose peut être d'un comprimé ou de plusieurs.
- **La forme du nutriment** (par exemple méthylfolate ou acide folique) : elle est indiquée par la marque ; comparez-la telle qu'elle est écrite.
- **Les ingrédients ajoutés** : arômes, édulcorants, excipients, allergènes.

## Comparer les prix : le coût par jour

Pour comparer deux flacons, calculez le coût par jour : prix du flacon ÷ nombre de jours couverts par la dose recommandée. Comparez ensuite des produits dont les compositions sont comparables : une multivitamine et une vitamine isolée ne se remplacent pas. Les prix varient selon la marque et le circuit d'import ; le prix affiché sur chaque fiche fait foi.

## Précautions

Respectez la posologie indiquée par le fabricant : un excès de certaines vitamines n'est pas souhaitable, et plusieurs produits peuvent contenir les mêmes nutriments. Demandez l'avis d'un médecin ou d'un pharmacien en cas de maladie, de traitement en cours, de grossesse ou d'allaitement. Les compléments ne sont pas destinés aux mineurs.

## Choisir selon votre profil

- **Vous voulez une référence affichée en stock** : [Real Pharm Vitamin D3 + K2, 90 tablettes](/produits/vitamin-d3-k2-90-tabs-real-pharm), [BioTechUSA One A Day](/produits/one-a-day-biotech-usa), [SFD Nutrition Vitamin Complex Sport, 120 tablettes](/produits/vitamin-complex-sport-120-tablets-sfd-nutrition), [Scenit Multi Vita+, 120 capsules](/produits/multi-vita-120-caps-scenit-nutrition) ou [weightworld Vegan Vitamin D3 + K2, 365 tablettes](/produits/vegan-vitamin-d3-k2-365-tablets-weightworld).
- **Vous cherchez une multivitamine très complète** : [weightworld Multivitamines et Minéraux, 400 tablettes](/produits/multivitamines-et-mineraux-400-tablets-weightword).
- **Vous préférez des marques américaines** : [NOW Foods Vitamin D3, 120 capsules molles](/produits/now-foods-vitamin-d3-120-capsules-molles), [California Gold Nutrition Vitamin D3 + K2](/produits/california-gold-nutrition-vitamin-d3-k2-as-mk4-30-ml) ou [21st Century Vitamin C, 60 comprimés](/produits/21st-century-vitamin-c-60-comprimes), proposés sur commande : le bouton « Demander ce produit » donne le prix et le délai avant tout engagement.

## Pour aller plus loin

Voyez aussi le [magnésium](/magnesium), le [zinc](/zinc), les [oméga-3](/omega-3) et l'ensemble des [compléments alimentaires](/complements-alimentaires). Nos guides : [vitamines pour sportifs](/conseils/vitamines-pour-sportifs-guide), [multivitamines pour sportifs](/conseils/multivitamines-sportifs) et [vitamine D3 + K2](/conseils/vitamine-d3-k2-tunisie). Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison : voir [livraison](/livraison), [retours](/retours) et [authenticité](/authenticite).

## Questions fréquentes

### Comment choisir une multivitamine ?

Comparez la liste des nutriments et leurs quantités par dose, la taille de la dose, les ingrédients ajoutés et le coût par jour, plutôt que le nom commercial ou la face avant du flacon.

### Que signifient µg, mg et UI sur une étiquette ?

Ce sont des unités de mesure. Pour la vitamine D, 1 µg équivaut à 40 UI. Une même vitamine peut apparaître dans l'une ou l'autre unité selon la marque : convertissez avant de comparer.

### Comment comparer deux compléments de vitamines ?

Calculez le coût par jour (prix du flacon ÷ nombre de jours couverts) et vérifiez que les compositions sont comparables.

### Peut-on cumuler plusieurs compléments de vitamines ?

Plusieurs produits peuvent contenir les mêmes nutriments : additionnez les quantités et respectez les posologies. Demandez conseil à un professionnel de santé en cas de doute.

### Les vitamines remplacent-elles une alimentation équilibrée ?

Non. Ce sont des compléments alimentaires, qui ne remplacent ni une alimentation variée ni un avis médical.

### Où acheter des vitamines en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager.""",
)

C["omega-3"] = dict(
    title="Oméga-3 en Tunisie : huile de poisson, EPA et DHA | ParaTunisie",
    desc="Comparez les oméga-3 en Tunisie : huile de poisson, krill, EPA et DHA par prise, coût par jour. Guide d'achat. Livraison en 24 à 48 h.",
    h1="Oméga-3 en Tunisie",
    intro=("Huile de poisson, krill ou autres sources : comparez les compléments d'oméga-3 de BioTechUSA, weightworld, ZUMUB, NOW Foods et d'autres marques. "
           "Le guide explique comment lire les quantités d'EPA et de DHA et comment comparer le coût par jour."),
    kw=["oméga 3 tunisie", "huile de poisson tunisie", "omega 3 prix tunisie", "epa dha tunisie"],
    body="""Un flacon d'oméga-3 annonce souvent une grande quantité d'huile de poisson, mais ce n'est pas le chiffre qui compte. Ce guide explique comment lire une étiquette d'oméga-3, comment comparer des produits de composition différente et à quoi faire attention. Il ne promet aucun effet : aucune allégation de santé n'est formulée ici.

## Les oméga-3 en complément alimentaire

Les oméga-3 sont des acides gras. Les compléments les plus courants contiennent de l'EPA et du DHA, issus d'huile de poisson, d'huile de krill ou d'autres sources. Ce sont des compléments alimentaires : ils ne remplacent ni une alimentation variée ni un avis médical.

## Les sources que l'on rencontre

- **Huile de poisson** : la source la plus courante, en capsules molles ou en gélules, par exemple chez BioTechUSA, weightworld ou ZUMUB.
- **Huile de krill** : proposée par quelques marques, par exemple NOW Foods, sur commande.
- **Formules associées** (oméga-3, 6 et 9, ou oméga-3 avec vitamines) : la composition diffère, lisez-la attentivement.

## Lire l'étiquette : EPA et DHA, pas l'huile

- **Les quantités d'EPA et de DHA par dose**, en mg : c'est ce chiffre qui permet de comparer. Le poids total d'huile (par exemple « 1 000 mg d'huile de poisson ») ne dit pas combien d'EPA et de DHA le produit contient.
- **Le nombre de capsules par dose** : certaines marques annoncent leurs quantités pour deux ou trois capsules.
- **La source** : poisson (allergène à vérifier), krill, autre.
- **Les ingrédients ajoutés** : vitamine E, arômes, enveloppe de la capsule.

## Comparer les prix : le coût par jour

Calculez le coût par jour : prix du flacon ÷ nombre de jours couverts par la dose recommandée. Comparez ensuite des produits qui apportent des quantités d'EPA et de DHA comparables par jour : un flacon moins cher peut apporter beaucoup moins d'EPA et de DHA. Le prix affiché sur chaque fiche fait foi.

## Conservation

Les huiles de poisson se conservent selon les indications de l'emballage, en général à l'abri de la chaleur et de la lumière, et le flacon se referme après chaque usage.

## Précautions

Évitez les produits à base de poisson en cas d'allergie au poisson ou aux fruits de mer, à vérifier sur l'étiquette. Demandez l'avis d'un médecin ou d'un pharmacien en cas de maladie, de traitement en cours (notamment anticoagulant), de grossesse ou d'allaitement. Respectez la posologie du fabricant. Les compléments ne sont pas destinés aux mineurs.

## Choisir selon votre profil

- **Vous voulez une référence affichée en stock** : [BioTechUSA Mega Omega 3, 90 capsules](/produits/mega-omega-3-90-caps-biotech), [weightworld Omega-3 Fish Oil, 240 capsules molles](/produits/omega-3-fish-oil-240-softgel-weightworld) ou [ZUMUB Omega 3, 90 capsules](/produits/zumub-omega-3-90-caps).
- **Vous cherchez une autre source ou une marque américaine** : [NOW Foods Omega-3 Fish Oil, 180 capsules molles](/produits/now-foods-omega-3-fish-oil-180-capsules-molles) ou [NOW Foods Krill Oil, 120 capsules molles](/produits/now-foods-krill-oil-120-capsules-molles), proposés sur commande : le bouton « Demander ce produit » donne le prix et le délai avant tout engagement.

## Pour aller plus loin

Voyez aussi les [vitamines](/vitamines), le [magnésium](/magnesium) et l'ensemble des [compléments alimentaires](/complements-alimentaires). Nos guides : [omega-3 en Tunisie](/conseils/omega-3-tunisie-guide) et [comment choisir un oméga-3 (EPA et DHA)](/conseils/comment-choisir-omega-3-epa-dha). Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison : voir [livraison](/livraison), [retours](/retours) et [authenticité](/authenticite).

## Questions fréquentes

### Quelle quantité d'EPA et de DHA faut-il chercher ?

Il n'existe pas de chiffre unique valable pour tous. Repérez les quantités d'EPA et de DHA par dose sur l'étiquette, suivez la posologie du fabricant et demandez conseil à un professionnel de santé en cas de doute.

### Comment comparer deux compléments d'oméga-3 ?

Comparez les mg d'EPA et de DHA par jour, pas le poids d'huile, puis calculez le coût par jour.

### Huile de poisson ou huile de krill ?

Ce sont deux sources différentes. Comparez la composition annoncée (EPA, DHA, ingrédients associés) et le coût par jour.

### Les oméga-3 conviennent-ils en cas d'allergie au poisson ?

Les produits issus du poisson sont à éviter en cas d'allergie : vérifiez la source et les allergènes sur l'étiquette et demandez l'avis d'un professionnel de santé.

### Les oméga-3 remplacent-ils une alimentation équilibrée ?

Non. Ce sont des compléments alimentaires, qui ne remplacent ni une alimentation variée ni un avis médical.

### Où acheter des oméga-3 en Tunisie ?

Sur ParaTunisie, vous commandez en ligne avec livraison en 24 à 48 h partout en Tunisie et paiement à la livraison. Pour les références proposées sur commande, le bouton « Demander ce produit » permet de connaître le prix et le délai avant de vous engager.""",
)


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_cat_batch10b as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","ogTitle","ogDescription","updatedAt" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for slug, v in C.items():
    assert len(v["title"]) <= 64 and 90 <= len(v["desc"]) <= 165, (slug, len(v["title"]), len(v["desc"]))
    kw = "[" + ",".join('"%s"' % k for k in v["kw"]) + "]"
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoKeywords"=%s,"ogTitle"=%s,"ogDescription"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), q(kw), q(v["title"]), q(v["desc"]), slug))
    print(f"-- {slug}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
