import re

with open('src/lib/data/articles.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the sections of each article to see exact phrasing
blocks = text.split('// ── ARTICLE ')

LINK_DEFINITIONS = {
    "meilleure-creatine-tunisie": ("[notre sélection de créatine monohydrate](/creatine)", "[nos créatines pures disponibles en Tunisie](/creatine)"),
    "creatine-monohydrate-bienfaits-dosage": ("[notre sélection de créatine monohydrate pure](/creatine)", "[toutes nos créatines disponibles](/creatine)"),
    "creatine-avant-ou-apres-entrainement": ("[notre gamme de créatines monohydrates](/creatine)", "[notre sélection de whey protéines](/whey-proteine)"),
    "whey-protein-tunisie-guide": ("[notre sélection de whey protéines en Tunisie](/whey-proteine)", "[toutes nos protéines disponibles en stock](/whey-proteine)"),
    "whey-concentree-vs-isolate": ("[notre catalogue de whey concentrée et isolate](/whey-proteine)", "[nos protéines whey en Tunisie](/whey-proteine)"),
    "prise-de-masse-gainer-ou-whey": ("[nos mass gainers pour la prise de masse](/gainers-proteines)", "[notre sélection de whey protéines](/whey-proteine)"),
    "meilleur-pre-workout-tunisie": ("[voir les pre-workouts disponibles en Tunisie](/pre-workout)", "[nos pre-workouts](/pre-workout)"),
    "bcaa-ou-creatine-choisir": ("[notre sélection d'acides aminés BCAA](/bcaa)", "[nos créatines monohydrates](/creatine)"),
    "pre-workout-ou-creatine": ("[notre gamme de pre-workouts](/pre-workout)", "[nos créatines monohydrates](/creatine)"),
    "bcaa-vs-acides-amines-essentiels": ("[notre sélection de BCAA 2:1:1 et 4:1:1](/bcaa)", "[nos acides aminés essentiels EAA](/eaa)"),
    "ashwagandha-bienfaits-musculation": ("[notre sélection d'ashwagandha pure](/ashwagandha)", "[nos compléments d'ashwagandha en Tunisie](/ashwagandha)"),
    "quand-prendre-ashwagandha": ("[notre sélection d'ashwagandha KSM-66](/ashwagandha)", "[tous nos compléments d'ashwagandha](/ashwagandha)"),
    "vitamine-d3-k2-tunisie": ("[notre sélection de vitamines et D3+K2](/vitamines)", "[toutes nos vitamines disponibles en Tunisie](/vitamines)"),
    "zinc-sportif-musculation": ("[notre gamme de zinc chélaté](/zinc)", "[notre sélection de magnésium](/magnesium)"),
    "omega-3-tunisie-guide": ("[notre sélection d'oméga 3 concentrés](/omega-3)", "[nos capsules d'huile de poisson en Tunisie](/omega-3)"),
    "multivitamines-sportifs": ("[nos complexes multivitamines pour sportifs](/vitamines)", "[notre univers de nutrition sportive](/nutrition-sportive)"),
    "l-carnitine-perte-graisse": ("[notre sélection de L-Carnitine liquide et gélules](/l-carnitine)", "[nos brûleurs de graisse thermogéniques](/bruleurs-de-graisse)"),
    "bruleur-de-graisse-tunisie": ("[nos brûleurs de graisse pour la sèche](/bruleurs-de-graisse)", "[notre sélection de L-Carnitine](/l-carnitine)"),
    "complements-musculation-debutant": ("[notre sélection de whey protéines](/whey-proteine)", "[nos créatines monohydrates](/creatine)"),
    "complements-avant-pendant-apres-entrainement": ("[nos boosters pre-workout](/pre-workout)", "[nos protéines whey post-entraînement](/whey-proteine)"),
    "comment-prendre-creatine": ("[notre sélection de créatine monohydrate](/creatine)", "[nos créatines pures micronisées](/creatine)"),
    "creatine-femme": ("[notre sélection de créatine monohydrate pure](/creatine)", "[toutes nos créatines disponibles en Tunisie](/creatine)"),
    "creapure-vs-creatine-monohydrate": ("[notre sélection de créatines monohydrates certifiées](/creatine)", "[nos créatines disponibles en stock](/creatine)"),
    "combien-de-temps-prendre-creatine": ("[notre sélection de créatine monohydrate](/creatine)", "[nos créatines pures](/creatine)"),
    "whey-isolate-vs-concentrate": ("[notre sélection de whey protéines concentrées et isolats](/whey-proteine)", "[toutes nos whey disponibles en Tunisie](/whey-proteine)"),
    "combien-de-whey-par-jour": ("[notre sélection de whey protéines](/whey-proteine)", "[nos protéines whey disponibles en stock](/whey-proteine)"),
    "quand-prendre-la-whey": ("[notre sélection de whey protéines en Tunisie](/whey-proteine)", "[nos formules whey isolate et concentrée](/whey-proteine)"),
    "whey-pour-debutant": ("[notre sélection de whey protéines pour débutants](/whey-proteine)", "[toutes nos protéines de lactosérum](/whey-proteine)"),
    "meilleur-gainer-tunisie": ("[nos mass gainers pour la prise de masse](/gainers-proteines)", "[notre sélection de gainers en Tunisie](/gainers-proteines)"),
    "comment-prendre-un-mass-gainer": ("[notre gamme de gainers pour la prise de masse](/gainers-proteines)", "[nos formules hypercaloriques disponibles](/gainers-proteines)"),
    "alimentation-prise-de-masse-tunisie": ("[nos mass gainers et formules prise de masse](/gainers-proteines)", "[notre univers de nutrition sportive en Tunisie](/nutrition-sportive)"),
    "comment-utiliser-pre-workout": ("[nos formules pre-workout disponibles en Tunisie](/pre-workout)", "[nos boosters d'énergie](/pre-workout)"),
    "pre-workout-sans-cafeine-pump": ("[nos pre-workouts sans caféine et boosters pump](/pre-workout)", "[notre sélection de citrulline pure](/citrulline)"),
    "magnesium-bisglycinate-bienfaits": ("[notre gamme de magnésium bisglycinate hautement assimilable](/magnesium)", "[tous nos compléments de magnésium en Tunisie](/magnesium)"),
    "types-de-magnesium-comparatif": ("[notre sélection de magnésium chélaté et bisglycinate](/magnesium)", "[nos formules de magnésium en Tunisie](/magnesium)"),
    "comment-choisir-ashwagandha": ("[notre sélection d'ashwagandha KSM-66 et extraits purs](/ashwagandha)", "[tous nos compléments d'ashwagandha](/ashwagandha)"),
    "routine-sommeil-recuperation": ("[notre sélection de magnésium bisglycinate](/magnesium)", "[nos compléments d'ashwagandha pour la nuit](/ashwagandha)"),
    "comment-choisir-omega-3-epa-dha": ("[notre sélection d'oméga 3 concentrés en EPA et DHA](/omega-3)", "[toutes nos huiles de poisson disponibles en Tunisie](/omega-3)"),
    "vitamines-pour-sportifs-guide": ("[nos complexes de vitamines et minéraux](/vitamines)", "[notre sélection de zinc chélaté](/zinc)"),
    "zinc-bisglycinate-guide": ("[notre sélection de zinc chélaté et bisglycinate](/zinc)", "[notre sélection de magnésium](/magnesium)")
}

new_blocks = [blocks[0]]
for i, b in enumerate(blocks[1:], 1):
    slug_m = re.search(r'slug:\s*"([^"]+)"', b)
    if not slug_m:
        new_blocks.append(b)
        continue
    slug = slug_m.group(1)
    
    # Check if links are already in the block
    if slug in LINK_DEFINITIONS:
        link1, link2 = LINK_DEFINITIONS[slug]
        
        # If link1 not in block, inject it into the first section content
        if link1 not in b:
            # Find first section content array
            # content:\s*\[\s*"([^"]+)"
            def replace_first_content(match):
                original = match.group(1)
                # append link1 gracefully
                return f'content: [\n          "{original} Pour vos besoins, découvrez {link1} chez ParaTunisie."'
            
            b = re.sub(r'content:\s*\[\s*"([^"]+)"', replace_first_content, b, count=1)
        
        # If link2 not in block, inject it into the second section content
        if link2 not in b:
            # Find second section content array
            parts = b.split('content: [')
            if len(parts) >= 3:
                # modify the second section (parts[2])
                second_part = parts[2]
                first_str_m = re.search(r'^\s*"([^"]+)"', second_part)
                if first_str_m:
                    orig_str = first_str_m.group(1)
                    repl_str = f'{orig_str} Vous pouvez également consulter {link2}.'
                    parts[2] = second_part.replace(f'"{orig_str}"', f'"{repl_str}"', 1)
                    b = 'content: ['.join(parts)

    new_blocks.append(b)

full_new_text = '// ── ARTICLE '.join(new_blocks)

with open('src/lib/data/articles.ts', 'w', encoding='utf-8') as f:
    f.write(full_new_text)

print("Finished processing all articles!")
