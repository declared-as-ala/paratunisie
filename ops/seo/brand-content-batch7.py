"""SQL for 4 brand pages (Batch 7): intro + seoContent built only from the brand's INDEXABLE categories, then indexable=true.
Excluded on purpose: scenit-nutrition (has a boosters-hormonaux product), kevin-levrone, real-pharm (tribulus, zma).
No claim about the brands themselves is made beyond what the catalogue shows."""
import sys

NAMES = {
    "creatine": ("créatine", "/creatine"), "whey-proteine": ("whey protéine", "/whey-proteine"),
    "whey-isolate": ("whey isolate", "/whey-isolate"), "gainers-proteines": ("gainers et prise de masse", "/gainers-proteines"),
    "vitamines": ("vitamines", "/vitamines"), "zinc": ("zinc", "/zinc"), "omega-3": ("oméga-3", "/omega-3"),
    "ashwagandha": ("ashwagandha", "/ashwagandha"), "eaa": ("EAA", "/eaa"), "pre-workout": ("pre-workout", "/pre-workout"),
}
BRANDS = {
    "optimum-nutrition": ("Optimum Nutrition", ["creatine", "gainers-proteines", "whey-proteine", "vitamines"]),
    "biotech-usa": ("BioTechUSA", ["creatine", "whey-proteine", "whey-isolate", "vitamines", "omega-3", "zinc", "ashwagandha"]),
    "challenger-nutrition": ("Challenger Nutrition", ["creatine", "eaa", "gainers-proteines", "pre-workout", "whey-isolate"]),
    "ultimate-nutrition": ("Ultimate Nutrition", ["whey-isolate", "whey-proteine", "creatine"]),
}


def q(s):
    assert "$bb$" not in s and "\r" not in s
    return "$bb$" + s + "$bb$"


out = ["\\o /dev/null",
       'create table if not exists _wave_backup_brands7 as select id, slug, indexable, "seoIntro", "seoContent", "updatedAt" from "Brand" where slug in (%s);' % ",".join("'%s'" % k for k in BRANDS),
       "\\o"]
for slug, (name, cats) in BRANDS.items():
    labels = [f"[{NAMES[c][0]}]({NAMES[c][1]})" for c in cats]
    listing = ", ".join(labels[:-1]) + " et " + labels[-1]
    intro = f"Découvrez la sélection {name} de ParaTunisie : les références disponibles dans le catalogue, leurs formats et leur état de stock, avec livraison partout en Tunisie et paiement à la livraison."
    content = f"""Le catalogue ParaTunisie propose des produits {name} dans plusieurs catégories : {listing}.

Pour comparer deux produits de la marque, lisez le tableau nutritionnel et la liste des ingrédients de chaque fiche, puis comparez le prix par portion plutôt que le seul prix du pot. L'état de stock affiché sur chaque fiche fait foi.

Consultez notre page [authenticité](/authenticite) pour connaître notre démarche, et nos pages [livraison](/livraison) et [retours](/retours) pour les conditions de commande. Les compléments alimentaires ne remplacent pas une alimentation variée ; demandez l'avis d'un professionnel de santé en cas de doute."""
    out.append('update "Brand" set "seoIntro"=%s,"seoContent"=%s,indexable=true,"updatedAt"=now() where slug=\'%s\';' % (q(intro), q(content), slug))
out.append('select slug, indexable, length("seoContent") from "Brand" where slug in (%s);' % ",".join("'%s'" % k for k in BRANDS))
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
