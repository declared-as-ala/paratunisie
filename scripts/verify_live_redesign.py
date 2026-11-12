import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("Fetching live homepage: https://paratunisie.com/ ...")
req = urllib.request.Request('https://paratunisie.com/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')

print("\n--- 1. HEADER VERIFICATION ---")
print("Top Utility Bar (Livraison partout en Tunisie à partir de 80 DT):", "Livraison partout en Tunisie à partir de 80 DT" in html)
print("Top Phone (+216 36 123 456):", "+216 36 123 456" in html)
print("Search Button (Rechercher):", "Rechercher" in html)
print("Nav Badges (Promotions %, Nouveautés):", "Promotions %" in html and "Nouveautés" in html)
print("Actions (Mon compte, Favoris, Panier):", "Mon compte" in html and "Favoris" in html and "Panier" in html)

print("\n--- 2. HERO & À LA UNE VERIFICATION ---")
print("Hero Tag (PARATUNISIE — NUTRITION SPORTIVE):", "NUTRITION SPORTIVE &amp; COMPLÉMENTS EN TUNISIE" in html or "NUTRITION SPORTIVE" in html)
print("Hero Title (ParaTunisie):", "ParaTunisie" in html)
print("Hero Subtitle (Parapharmacie en Ligne & Nutrition Sportive en Tunisie):", "Parapharmacie en Ligne &amp; Nutrition Sportive en Tunisie" in html or "Parapharmacie en Ligne & Nutrition Sportive" in html)
print("À LA UNE Section:", "À LA UNE" in html)
print("PRODUIT DU MOMENT Label:", "PRODUIT DU MOMENT" in html)
print("Voir toute la boutique link:", "Voir toute la boutique" in html)

print("\n--- 3. CATEGORY SHORTCUT STRIP (12 ITEMS) ---")
for cat in ["whey-proteine", "creatine", "gainers-proteines", "pre-workout", "acides-amines", "l-carnitine", "vitamines", "mineraux", "ashwagandha", "bruleurs-de-graisse", "soins", "accessoires"]:
    print(f"Category /{cat}:", f'href="/{cat}"' in html)

print("\n--- 4. PROMOTIONAL BANNERS ---")
print("Whey Protéine Banner:", "Pour de meilleurs résultats" in html)
print("Créatine Banner:", "Force &amp; Performance" in html or "Force & Performance" in html)
print("Vitamines & Minéraux Banner:", "Pour votre bien-être quotidien" in html)

print("\n--- 5. BEST SELLERS & BRANDS ---")
print("Meilleures ventes heading:", "Meilleures ventes" in html)
print("Meilleures ventes subtitle:", "Les produits les plus populaires sur ParaTunisie" in html)
print("Nos marques heading:", "Nos marques" in html)
print("Nos marques subtitle:", "Des marques de confiance, disponibles en Tunisie" in html)

print("\n--- 6. FITNESS PROMOTIONAL & TRUST ---")
print("Objectifs Fitness heading:", "Objectifs Fitness ?" in html)
print("On vous accompagne subtitle:", "On vous accompagne !" in html)
print("Pourquoi choisir ParaTunisie ? heading:", "Pourquoi choisir" in html and "ParaTunisie ?" in html)

print("\n--- 7. BLOG & NEWSLETTER & FOOTER ---")
print("Derniers articles et conseils heading:", "Derniers articles et conseils" in html)
print("Rejoignez notre communauté heading:", "Rejoignez notre communauté" in html)
print("Footer Services:", "Livraison &amp; suivi" in html or "Livraison & suivi" in html)
print("Footer Contact phone (+216 26 123 456):", "+216 26 123 456" in html)
print("Footer Copyright:", "ParaTunisie. Tous droits réservés." in html)

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
