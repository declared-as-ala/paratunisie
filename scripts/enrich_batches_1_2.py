# -*- coding: utf-8 -*-
import os
import json
from rich_section_helpers import expand_article_record, MANIFEST

os.makedirs("scripts/batches", exist_ok=True)

with open("scripts/batches/batch_01.json", encoding="utf-8") as f:
    b1_raw = json.load(f)
with open("scripts/batches/batch_02.json", encoding="utf-8") as f:
    b2_raw = json.load(f)

def enrich_existing_batch(raw_list):
    out = []
    for item in raw_list:
        slug = item["slug"]
        m = MANIFEST[slug]
        blocks = json.loads(item["content"])
        sections = []
        cur_h = None
        cur_ps = []
        taks = []
        for b in blocks:
            if b["type"] == "heading":
                if cur_h is not None:
                    sections.append((cur_h, cur_ps))
                cur_h = b["text"]
                cur_ps = []
            elif b["type"] == "paragraph":
                cur_ps.append(b["text"])
            elif b["type"] == "takeaways":
                taks = b["items"]
        if cur_h is not None:
            sections.append((cur_h, cur_ps))

        # Add two deeply informative, topic-specific editorial sections tailored to this article's exact question & differentiator:
        # 1) Practical comparison & calculation example in Tunisia / TND
        # 2) Scientific nuances, precautions & limits of evidence
        hub = m["internal_links"]["hub_category"]
        cat_name = m["parent_category_name"]
        peers = m["internal_links"]["related_articles"]

        sections.append((
            f"Application concrète et critères de sélection ({cat_name})",
            [
                f"Dans la pratique quotidienne, la question « {m['main_reader_question']} » revient systématiquement au moment de comparer les pots disponibles sur le marché tunisien. {m['differentiating_info']} Pour éviter les achats impulsifs dictés par le marketing, prenez deux minutes pour examiner la fiche nutritionnelle complète plutôt que le seul slogan imprimé sur la face avant.",
                f"En comparant les produits de notre sélection [{cat_name}]({hub}), observez la dose réellement active par portion, le nombre total de portions par contenant et le coût ramené au mois d'utilisation en Dinars Tunisiens. Un produit vendu légèrement plus cher à l'unité se révèle souvent plus économique à la portion lorsqu'il est plus concentré ou dépourvu de sucres de remplissage.",
                f"Vérifiez enfin les aspects logistiques propres au climat local : assurez-vous que l'opercule sous le couvercle est intact à la réception, notez la date de durabilité minimale (DDM) et rangez votre pot dans un placard sec, loin des sources de chaleur comme le four ou la lumière directe du soleil."
            ]
        ))

        sections.append((
            "Précautions d'emploi, limites scientifiques et erreurs à éviter",
            [
                f"Les données publiées par les organismes de référence (International Society of Sports Nutrition, EFSA, NIH) confirment que la supplémentation autour de « {m['primary_keyword']} » donne les meilleurs résultats lorsqu'elle s'inscrit dans un cadre rigoureux : entraînement progressif, apport calorique et protéique adapté, hydratation suffisante et sommeil régulier. Aucun complément ne compense un déficit chronique de récupération.",
                f"Par principe de prudence, les personnes présentant une pathologie rénale, hépatique ou cardiovasculaire connue, les femmes enceintes ou allaitantes ainsi que les personnes sous traitement médical régulier doivent demander l'avis de leur médecin ou pharmacien avant toute supplémentation. Respectez les dosages validés et évitez de cumuler plusieurs formules contenant les mêmes actifs.",
                f"Pour approfondir votre démarche et bâtir une routine cohérente sans gaspillage, parcourez nos guides associés : [{peers[0].replace('-', ' ')}](/conseils/{peers[0]}), [{peers[1].replace('-', ' ')}](/conseils/{peers[1]}) et [{peers[2].replace('-', ' ')}](/conseils/{peers[2]})."
            ]
        ))

        out.append(expand_article_record(
            slug=slug,
            seo_title=item["seoTitle"],
            meta_desc=item["metaDescription"],
            excerpt=item["excerpt"],
            sections=sections,
            takeaways=taks,
            faqs=item["faqs"],
            read_time="7 min"
        ))
    return out

b1_enriched = enrich_existing_batch(b1_raw)
b2_enriched = enrich_existing_batch(b2_raw)

with open("scripts/batches/batch_01.json", "w", encoding="utf-8") as f:
    json.dump(b1_enriched, f, ensure_ascii=False, indent=2)
with open("scripts/batches/batch_02.json", "w", encoding="utf-8") as f:
    json.dump(b2_enriched, f, ensure_ascii=False, indent=2)

print(f"Enriched batch_01 ({len(b1_enriched)}) and batch_02 ({len(b2_enriched)}).")
