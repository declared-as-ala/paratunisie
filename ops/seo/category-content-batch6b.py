"""SQL for /probiotiques (Batch 6b; category stays noindex: no product in stock). Output: UTF-8, LF.
Demand evidence (Search Console, 90d): /whey-proteine 359 impr pos 68.5 ("whey tunisie" 101, "proteine anabolic tunisie" 118,
"gold standard whey tunisie" ~120 across variants); /creatine 72 impr pos 87.
Only facts from the catalogue are stated: brands and formats of PUBLISHED + indexable products. No dosage prescription, no medical claim.
"""
import sys

C = {}
C["probiotiques"] = dict(
    title="Probiotiques en Tunisie : marques et formats | ParaTunisie",
    desc="Probiotiques en gélules, capsules et comprimés à croquer : NOW Foods, Swanson, Naturelo, Seeking Health. Comparez les formats avant de choisir. Livraison en Tunisie.",
    h1="Probiotiques en Tunisie",
    intro="Comparez les compléments probiotiques de marques internationales comme NOW Foods, Swanson, Naturelo ou Seeking Health : gélules végétales, capsules à libération retardée ou comprimés à croquer.",
    body="""## Comment comparer deux probiotiques

Un probiotique est un complément contenant des micro-organismes vivants. Pour comparer deux références, lisez l'étiquette :

1. **Les souches** : chaque produit indique les espèces et souches qu'il contient. Deux produits au nombre de CFU similaire peuvent contenir des souches différentes.
2. **Le nombre de CFU** (unités formant colonie) par prise, exprimé en milliards.
3. **La forme** : gélules végétales, capsules à libération retardée ou comprimés à croquer.
4. **La conservation** : certains produits demandent une conservation au frais ; suivez les indications de la marque.
5. **Les autres ingrédients** : excipients, allergènes, présence de prébiotiques.

## Les références du catalogue

La sélection comprend notamment [NOW Foods Probiotic-10 (30 gélules végétales)](/produits/now-foods-probiotic-10-30-gelules-vegetales), [NOW Foods Saccharomyces Boulardii (60 gélules végétales)](/produits/now-foods-saccharomyces-boulardii-probiotic-60-gelules-vegetales), Naturelo Probiotic 50 Billion CFU, Swanson Oral Probiotic Formula et Seeking Health Probiota. L'état de stock affiché sur chaque fiche fait foi.

## Pour aller plus loin

Voyez aussi nos [compléments alimentaires](/complements-alimentaires), les [vitamines](/vitamines) et le [magnésium](/magnesium).

## Transparence et sécurité

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche. Un complément ne remplace pas une alimentation variée ni un avis médical. Demandez conseil à un professionnel de santé en cas de pathologie, de système immunitaire affaibli, de grossesse, d'allaitement ou de traitement en cours, et respectez la posologie du fabricant.

## Livraison et paiement

Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison. Détails sur nos pages [livraison](/livraison) et [retours](/retours).

## Questions fréquentes

### Comment choisir un probiotique ?

Comparez les souches indiquées, le nombre de CFU par prise, la forme et la conservation, puis lisez la composition complète.

### Un probiotique est-il un médicament ?

Non. C'est un complément alimentaire : il ne soigne aucune maladie.

### Faut-il un avis médical avant d'en prendre ?

C'est recommandé en cas de pathologie, de traitement en cours, de grossesse ou d'allaitement.""",
)


def q(s):
    assert "$cc$" not in s and "\r" not in s
    return "$cc$" + s + "$cc$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_batch6b as select id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent" from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C),
       "\\o"]
for k, v in C.items():
    assert len(v["title"]) <= 66, (k, len(v["title"]))
    assert len(v["desc"]) <= 175, (k, len(v["desc"]))
    out.append('update "Category" set "seoTitle"=%s,"seoDescription"=%s,"seoH1"=%s,"seoIntro"=%s,"seoContent"=%s,"seoIsCustom"=true,"updatedAt"=now() where slug=\'%s\';' % (q(v["title"]), q(v["desc"]), q(v["h1"]), q(v["intro"]), q(v["body"]), k))
    print(f"-- {k}: title {len(v['title'])} desc {len(v['desc'])} words {len(v['body'].split())}", file=sys.stderr)
out.append('select slug, indexable, length("seoContent") from "Category" where slug in (%s);' % ",".join("'%s'" % k for k in C))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
