import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("public/assets/blog", exist_ok=True)

NEW_ARTICLES = [
    # 1. Créatine Cluster
    ("comment-prendre-creatine", "Guide Pratique", "Comment Prendre la Créatine", "Dosage, timing et conseils d'utilisation en Tunisie", (16, 185, 129), (6, 95, 70)),
    ("creatine-femme", "Nutrition Féminine", "Créatine pour Femme : Mythes & Bienfaits", "Rétention d'eau, tonus musculaire et énergie", (244, 63, 94), (136, 19, 55)),
    ("creapure-vs-creatine-monohydrate", "Comparatif Pureté", "Creapure vs Créatine Classique", "Différences, labels de qualité et critères de choix", (59, 130, 246), (30, 58, 138)),
    ("combien-de-temps-prendre-creatine", "Durée & Cycles", "Combien de Temps Prendre la Créatine ?", "Cure continue ou pauses cycliques : que dit la science", (16, 185, 129), (4, 120, 87)),
    
    # 2. Whey & Protéines Cluster
    ("whey-isolate-vs-concentrate", "Comparatif Protéines", "Whey Isolate vs Concentrate", "Teneur en protéines, lactose et budget comparés", (245, 158, 11), (180, 83, 9)),
    ("combien-de-whey-par-jour", "Dosage Protéique", "Combien de Whey Prendre par Jour ?", "Calcul personnalisé des apports selon vos entraînements", (245, 158, 11), (146, 64, 14)),
    ("quand-prendre-la-whey", "Timing Nutrition", "Quand Prendre la Whey Protéine ?", "Matin au réveil, collation ou après l'entraînement", (139, 92, 246), (91, 33, 182)),
    ("whey-pour-debutant", "Guide Débutant", "Whey pour Débutant en Musculation", "Comment bien choisir sa première protéine en Tunisie", (245, 158, 11), (180, 83, 9)),
    
    # 3. Mass Gainer Cluster
    ("meilleur-gainer-tunisie", "Prise de Masse", "Meilleur Mass Gainer en Tunisie", "Comparatif des gainers riches en glucides et protéines", (234, 88, 12), (154, 52, 18)),
    ("comment-prendre-un-mass-gainer", "Guide Gainer", "Comment Prendre un Mass Gainer", "Conseils pour développer sa masse sans excès de gras", (234, 88, 12), (124, 45, 18)),
    ("alimentation-prise-de-masse-tunisie", "Menu & Nutrition", "Alimentation Prise de Masse en Tunisie", "Idées de repas équilibrés et compléments alimentaires", (16, 185, 129), (6, 78, 59)),
    
    # 4. Pré-Workout & Performance
    ("comment-utiliser-pre-workout", "Performance Sport", "Comment Utiliser un Pré-Workout", "Dosage, tolérance à la caféine et règles de sécurité", (239, 68, 68), (153, 27, 27)),
    ("pre-workout-sans-cafeine-pump", "Booster Pump", "Pré-Workout sans Caféine (Pump)", "Idéal pour les séances du soir et la congestion", (168, 85, 247), (107, 33, 168)),
    
    # 5. Magnésium & Bien-être
    ("magnesium-bisglycinate-bienfaits", "Micronutrition", "Magnésium Bisglycinate : Bienfaits & Rôle", "Pourquoi cette forme chélatée est la plus biodisponible", (14, 165, 233), (3, 105, 161)),
    ("types-de-magnesium-comparatif", "Comparatif Formes", "Les Différents Types de Magnésium", "Bisglycinate, citrate, marin ou oxyde : quel choix ?", (14, 165, 233), (12, 74, 110)),
    
    # 6. Ashwagandha & Sommeil
    ("comment-choisir-ashwagandha", "Plantes Adaptogènes", "Comment Choisir son Ashwagandha", "Titrage en withanolides, label KSM-66 et efficacité", (132, 204, 22), (77, 124, 15)),
    ("routine-sommeil-recuperation", "Sommeil & Récupération", "Routine Sommeil & Récupération Sportive", "Optimiser sa nuit pour reconstruire ses fibres musculaires", (99, 102, 241), (49, 46, 129)),
    
    # 7. Oméga-3 & Vitamines
    ("comment-choisir-omega-3-epa-dha", "Santé Cardiovasculaire", "Comment Choisir ses Oméga-3", "Comprendre les ratios EPA / DHA et l'indice de pureté TOTOX", (6, 182, 212), (14, 116, 144)),
    ("vitamines-pour-sportifs-guide", "Micronutrition Sport", "Vitamines Essentielles pour Sportifs", "Combler les besoins accrus liés à l'effort physique intense", (234, 179, 8), (161, 98, 7)),
    ("zinc-bisglycinate-guide", "Minéraux & Immunité", "Zinc Bisglycinate : Guide Complet", "Soutien immunitaire, synthèse protéique et bienfaits peau", (16, 185, 129), (5, 150, 105)),
]

def create_banner(slug, tag, title, subtitle, color1, color2):
    width, height = 1200, 630
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Deep Slate Dark Background
    draw = ImageDraw.Draw(img)

    # Draw luxury gradient circle backdrop
    for r in range(400, 0, -5):
        alpha = int(255 * (1 - r / 400) * 0.4)
        c = (
            int(color1[0] * (1 - r/400) + 15 * (r/400)),
            int(color1[1] * (1 - r/400) + 23 * (r/400)),
            int(color1[2] * (1 - r/400) + 42 * (r/400))
        )
        draw.ellipse([800 - r, 315 - r, 800 + r, 315 + r], fill=c)

    # Accent decorative bar
    draw.rectangle([80, 80, 86, 140], fill=color1)

    # Load system font
    try:
        font_tag = ImageFont.truetype("arial.ttf", 26)
        font_title = ImageFont.truetype("arialbd.ttf", 52)
        font_subtitle = ImageFont.truetype("arial.ttf", 30)
        font_brand = ImageFont.truetype("arialbd.ttf", 28)
    except Exception:
        font_tag = font_title = font_subtitle = font_brand = ImageFont.load_default()

    # Draw Category Tag
    draw.text((105, 95), tag.upper(), fill=color1, font=font_tag)

    # Draw Title (wrap if long)
    words = title.split(" ")
    lines = []
    curr = []
    for w in words:
        curr.append(w)
        if len(" ".join(curr)) > 28:
            lines.append(" ".join(curr[:-1]))
            curr = [w]
    if curr:
        lines.append(" ".join(curr))

    y = 170
    for line in lines[:2]:
        draw.text((80, y), line, fill=(248, 250, 252), font=font_title)
        y += 65

    # Draw Subtitle
    y += 15
    draw.text((80, y), subtitle, fill=(148, 163, 184), font=font_subtitle)

    # Draw Bottom Badge / Branding
    draw.line([80, 520, 1120, 520], fill=(30, 41, 59), width=2)
    draw.text((80, 545), "PARATUNISIE", fill=(16, 185, 129), font=font_brand)
    draw.text((310, 548), "• Guide & Conseils Éditoriaux", fill=(100, 116, 139), font=font_tag)
    draw.text((950, 548), "paratunisie.com", fill=(148, 163, 184), font=font_tag)

    out_path = f"public/assets/blog/{slug}.webp"
    img.save(out_path, "WEBP", quality=90)
    print(f"Generated {out_path}")

for slug, tag, title, subtitle, c1, c2 in NEW_ARTICLES:
    create_banner(slug, tag, title, subtitle, c1, c2)

print("All 20 new editorial article banners generated successfully!")
