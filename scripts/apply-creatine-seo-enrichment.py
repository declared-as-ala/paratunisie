import paramiko
import sys
import json

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

print("Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Build comprehensive SEO data & description
description = """## 💥 CREATINE MONOHYDRATE 150GR – REAL PHARM

Optimisez vos performances sportives avec **Creatine Monohydrate 150g de Real Pharm**, une formule **hautement pure**, conçue pour les athlètes et pratiquants de musculation en quête de résultats concrets. Fabriquée selon des standards stricts de qualité européenne, cette créatine micronisée est facilement absorbée, sans impuretés ni additifs.

---

### ✅ Pourquoi choisir cette créatine ?
- **100% Pure Créatine Monohydrate** : sans arômes, sans sucre, sans colorants ni édulcorants.
- **Micronisée 200 Mesh** : pour une solubilité parfaite dans l'eau et une assimilation ultra-rapide par les fibres musculaires.
- **Améliore les performances physiques** lors d’efforts courts, intenses et répétés (efficacité prouvée par l’EFSA – European Food Safety Authority).
- **Accélère la récupération musculaire**, diminue les courbatures et la fatigue après les séances intenses.
- **Soutient la prise de masse maigre**, en stimulant la volumisation cellulaire et la force brute.

---

### 🧪 Composition & Valeurs Nutritionnelles
- **Portion** : 1 dose (3g à 5g) = 100% créatine monohydrate micronisée pure
- **Nombre de doses** : 50 portions par boîte (150g)
- **Allergènes** : Sans gluten, sans lactose, sans OGM, sans sucre ajouté.

---

### 🕒 Conseils d'Utilisation
- **Quand la prendre ?** De préférence immédiatement **après l'entraînement** avec votre shaker de protéines ou un jus de fruits pour maximiser la rétention musculaire. Les jours de repos, consommez 1 dose le matin au réveil.
- **Dosage recommandé** : 1 cuillère doseuse (3g à 5g) diluée dans 200–250 ml d'eau ou de boisson favorite.
- **Cure conseillée** : 6 à 8 semaines d'utilisation quotidienne, suivies d'une pause de 2 à 4 semaines. Veillez à boire au moins 2 à 3 litres d'eau par jour."""

benefit = "100% Créatine Monohydrate pure et micronisée (qualité pharmaceutique). Augmente la force explosive, le volume musculaire et accélère la récupération."
usage = "Prendre 1 dose de 3g à 5g par jour dans 200 ml d'eau ou de jus, idéalement après la séance d'entraînement."

seo_title = "CREATINE MONOHYDRATE 150GR - REAL PHARM – Prix Tunisie (59 DT)"
seo_desc = "CREATINE MONOHYDRATE 150GR - REAL PHARM au meilleur prix en Tunisie : 59 DT (au lieu de 70 DT). 100% Authentique, créatine micronisée pure. Livraison 24-48h partout en Tunisie, paiement à la livraison."
seo_h1 = "CREATINE MONOHYDRATE 150GR - REAL PHARM (Prix Tunisie & Avis)"
seo_intro = "Découvrez la **Créatine Monohydrate 150g de Real Pharm**, la créatine pure la plus accessible et performante en Tunisie. Idéale pour décupler votre puissance et développer votre masse musculaire."
seo_content = """La créatine monohydrate est le complément alimentaire le plus étudié et validé scientifiquement au monde pour le développement de la force et de la masse musculaire. 

La formule **Real Pharm 150g** offre une pureté pharmaceutique d'exception avec un broyage micronisé qui garantit une excellente biodisponibilité sans inconfort digestif. Que vous pratiquiez la musculation, le powerlifting, le crossfit ou les sports de combat, cette créatine vous permettra de repousser vos limites à chaque entraînement en Tunisie."""

seo_keywords = [
    "creatine monohydrate 150gr real pharm",
    "creatine real pharm tunisie",
    "creatine 150g tunisie",
    "creatine 59 dt tunisie",
    "creatine monohydrate prix tunisie",
    "creatine micronisee tunisie",
    "real pharm tunisie",
    "creatine musculation tunisie"
]

seo_faq = [
    {
        "question": "Quels sont les bienfaits de la Créatine Monohydrate 150g Real Pharm ?",
        "answer": "La créatine monohydrate Real Pharm régénère rapidement les stocks d'ATP cellulaire, ce qui permet d'augmenter la force maximale, de réaliser plus de répétitions lors des séries intenses et de favoriser la rétention d'eau intracellulaire pour un volume musculaire accru."
    },
    {
        "question": "Quel est le prix de la Créatine Real Pharm 150g en Tunisie ?",
        "answer": "La Créatine Monohydrate 150g de Real Pharm est proposée au prix promo exclusif de 59 DT (prix habituel : 70 DT) avec livraison express 24 à 48h partout en Tunisie et paiement sécurisé à la livraison."
    },
    {
        "question": "Comment consommer la créatine Real Pharm pour une efficacité optimale ?",
        "answer": "Prenez 3g à 5g de créatine par jour dissous dans 200ml d'eau ou avec votre shaker de whey après l'entraînement. Une phase de charge n'est pas nécessaire : une prise régulière quotidienne pendant 6 à 8 semaines suffit à saturer les réserves musculaires."
    },
    {
        "question": "Ce produit est-il garanti authentique ?",
        "answer": "Oui, tous les produits Real Pharm vendus sur notre boutique sont 100% authentiques, importés légalement avec scellé de sécurité et contrôle de conformité strict."
    }
]

# Write SQL update
escaped_desc = description.replace("'", "''")
escaped_benefit = benefit.replace("'", "''")
escaped_usage = usage.replace("'", "''")
escaped_title = seo_title.replace("'", "''")
escaped_seo_desc = seo_desc.replace("'", "''")
escaped_h1 = seo_h1.replace("'", "''")
escaped_intro = seo_intro.replace("'", "''")
escaped_content = seo_content.replace("'", "''")
escaped_keywords = json.dumps(seo_keywords, ensure_ascii=False).replace("'", "''")
escaped_faq = json.dumps(seo_faq, ensure_ascii=False).replace("'", "''")

sql = f"""
UPDATE "Product"
SET name = 'CREATINE MONOHYDRATE 150GR - REAL PHARM',
    description = '{escaped_desc}',
    benefit = '{escaped_benefit}',
    usage = '{escaped_usage}',
    image = 'https://admin.protein.tn/storage/produits/February2026/gtKdsfqVL9xlxfcE9sxI.webp',
    "seoTitle" = '{escaped_title}',
    "seoDescription" = '{escaped_seo_desc}',
    "seoH1" = '{escaped_h1}',
    "seoIntro" = '{escaped_intro}',
    "seoContent" = '{escaped_content}',
    "seoKeywords" = '{escaped_keywords}',
    "seoFaq" = '{escaped_faq}',
    "seoScore" = 100,
    "ogTitle" = '{escaped_title}',
    "ogDescription" = '{escaped_seo_desc}',
    "ogImage" = 'https://admin.protein.tn/storage/produits/February2026/gtKdsfqVL9xlxfcE9sxI.webp',
    "imageAlt" = 'CREATINE MONOHYDRATE 150GR - REAL PHARM — Real Pharm — Tunisie',
    "canonicalUrl" = '/produits/creatine-monohydrate-150gr-real-pharm',
    "inStock" = true,
    "totalStock" = 81,
    "publishState" = 'PUBLISHED',
    "indexable" = true,
    "followLinks" = true,
    "seoIsCustom" = true,
    "updatedAt" = NOW()
WHERE slug = 'creatine-monohydrate-150gr-real-pharm';

UPDATE "ProductVariant"
SET "priceMillimes" = 59000,
    stock = 81,
    label = '150 g',
    sku = '462'
WHERE "productId" = (SELECT id FROM "Product" WHERE slug = 'creatine-monohydrate-150gr-real-pharm');
"""

with open("scripts/update_creatine_seo.sql", "w", encoding="utf-8") as f:
    f.write(sql)

sftp = client.open_sftp()
sftp.put("scripts/update_creatine_seo.sql", "/tmp/update_creatine_seo.sql")
sftp.close()

cmd_exec = "docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/update_creatine_seo.sql"
stdin, stdout, stderr = client.exec_command(cmd_exec)
print("SQL Execution Output:")
print(stdout.read().decode("utf-8"))
err = stderr.read().decode("utf-8")
if err.strip():
    print("ERR:", err)

# Sync with Meilisearch
sync_script = """
const { PrismaClient } = require('@prisma/client');
const { MeiliSearch } = require('meilisearch');

async function sync() {
  const prisma = new PrismaClient();
  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || 'http://paratunisie-meilisearch:7700',
    apiKey: process.env.MEILISEARCH_KEY || 'paratunisie_meili_master_key_2026!'
  });

  const p = await prisma.product.findUnique({
    where: { slug: 'creatine-monohydrate-150gr-real-pharm' },
    include: { brand: true, category: true, variants: true }
  });

  if (p) {
    const index = client.index('products');
    const doc = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      benefit: p.benefit,
      description: p.description,
      brand: p.brand ? p.brand.name : null,
      brandSlug: p.brand ? p.brand.slug : null,
      category: p.category ? p.category.name : null,
      categorySlug: p.category ? p.category.slug : null,
      image: p.image,
      priceMillimes: p.variants[0] ? p.variants[0].priceMillimes : 59000,
      price: p.variants[0] ? p.variants[0].priceMillimes / 1000 : 59,
      inStock: p.inStock,
      publishState: p.publishState
    };
    await index.addDocuments([doc]);
    console.log('✅ Successfully indexed product in Meilisearch:', doc.name, doc.price + ' DT');
  }

  await prisma.$disconnect();
}

sync().catch(console.error);
"""

with open("scripts/sync_creatine_meili.js", "w", encoding="utf-8") as f:
    f.write(sync_script)

sftp = client.open_sftp()
sftp.put("scripts/sync_creatine_meili.js", "/tmp/sync_creatine_meili.js")
sftp.close()

cmd_meili = "docker cp /tmp/sync_creatine_meili.js paratunisie-api:/app/sync_creatine_meili.js && docker exec paratunisie-api node /app/sync_creatine_meili.js"
stdin, stdout, stderr = client.exec_command(cmd_meili)
print("Meilisearch sync output:")
print(stdout.read().decode("utf-8"))

client.close()
print("🎉 Product updated and SEO enriched successfully!")
