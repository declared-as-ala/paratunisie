# 🕸️ PLAN DE MAILLAGE INTERNE & TOPICAL AUTHORITY — PARATUNISIE.COM

**Objectif :** Maximiser la transmission du PageRank interne (Cheerleading & PageRank Sculpting) depuis les articles de blog à fort trafic informationnel vers les pages de catégories commerciales à fort taux de conversion e-commerce.  
**Architecture :** Modèle en Silos Thématiques (Topic Clusters / Hub & Spoke).  

---

## 1. Principes de Maillage Interne Appliqués

1. **Aucun Lien Vers des URLs Mortes ou 404 :** Toutes les ancres pointent exclusivement vers des catégories vérifiées en base de données et des produits actifs.
2. **Diversification des Textes d'Ancres :** Évitement de la sur-optimisation d'ancre exacte en alternant ancres exactes ("whey isolate"), ancres de marque ("whey BiotechUSA") et ancres contextuelles naturelles ("choisir une protéine sans lactose").
3. **Double Connexion Contextuelle :**
   - **Liens In-Text :** Insérés au cœur des paragraphes explicatifs avec balisage Next.js optimisé.
   - **Composant Produit Dédié :** Grille responsive *"Produits recommandés sur ParaTunisie"* affichant la fiche produit avec prix en TND et bouton d'action.

---

## 2. Matrice des Piliers Thématiques (Topic Clusters)

### Silo 1 : Whey Protéine & Isolate (20 articles)
- **Hub Commercial Principal :** `https://paratunisie.com/whey-proteine`
- **Hub Commercial Secondaire :** `https://paratunisie.com/whey-isolate`
- **Ancres Recommandées :**
  - "whey protéine en Tunisie"
  - "whey isolate digeste"
  - "protéine pure sans lactose"
- **Spokes Essentiels :**
  - `/conseils/whey-sans-lactose-tunisie` ➔ Lien vers `/whey-isolate`
  - `/conseils/whey-native-vs-fromagere-tunisie` ➔ Lien vers `/whey-proteine`
  - `/conseils/clear-whey-isolate-tunisie-avis` ➔ Lien vers `/whey-isolate`
  - `/conseils/whey-et-sante-renale-mythe-realite` ➔ Lien vers `/whey-proteine`

### Silo 2 : Créatine & Force Athlétique (15 articles)
- **Hub Commercial Principal :** `https://paratunisie.com/creatine`
- **Ancres Recommandées :**
  - "créatine monohydrate"
  - "créatine Creapure en Tunisie"
  - "augmenter sa force musculaire"
- **Spokes Essentiels :**
  - `/conseils/creatine-creapure-marques-disponibles-tunisie` ➔ Lien vers `/creatine`
  - `/conseils/creatine-micronisee-vs-classique` ➔ Lien vers `/creatine`
  - `/conseils/creatine-sans-phase-de-charge-protocole` ➔ Lien vers `/creatine`
  - `/conseils/prix-creatine-tunisie-comparatif-marques` ➔ Lien vers `/creatine`

### Silo 3 : Mass Gainer & Prise de Masse (12 articles)
- **Hub Commercial Principal :** `https://paratunisie.com/prise-de-masse`
- **Ancres Recommandées :**
  - "mass gainer pour prise de masse"
  - "lean gainer riche en protéines"
  - "complément ectomorphe"
- **Spokes Essentiels :**
  - `/conseils/difference-gainer-riche-en-glucides-vs-lean-gainer` ➔ Lien vers `/prise-de-masse`
  - `/conseils/gainer-sans-gras-prise-de-masse-seche-tunisie` ➔ Lien vers `/prise-de-masse`
  - `/conseils/hard-gainer-ectomorphe-menu-supplementation` ➔ Lien vers `/prise-de-masse`

### Silo 4 : Vitamines, Minéraux & Santé (15 articles)
- **Hub Commercial Principal :** `https://paratunisie.com/mineraux`
- **Ancres Recommandées :**
  - "vitamines et minéraux sport"
  - "vitamine D3 K2 biodisponible"
  - "zinc bisglycinate haute absorption"
- **Spokes Essentiels :**
  - `/conseils/vitamine-d3-k2-synergie-musculation-tunisie` ➔ Lien vers `/mineraux`
  - `/conseils/zinc-picolinate-vs-bisglycinate` ➔ Lien vers `/mineraux`
  - `/conseils/electrolytes-boisson-effort-chaleur-tunisie` ➔ Lien vers `/mineraux`

### Silo 5 : Sommeil, Stress & Bien-Être (12 articles)
- **Hub Commercial Principal :** `https://paratunisie.com/sommeil-stress`
- **Ancres Recommandées :**
  - "ashwagandha ksm-66 certifiée"
  - "magnésium pour le stress et le sommeil"
  - "compléments sommeil réparateur"
- **Spokes Essentiels :**
  - `/conseils/ashwagandha-ksm-66-vs-sensoril-difference` ➔ Lien vers `/sommeil-stress`
  - `/conseils/sommeil-anabolisme-croissance-musculaire-tunisie` ➔ Lien vers `/sommeil-stress`
  - `/conseils/magnesium-malate-energie-matin` ➔ Lien vers `/sommeil-stress`

### Silo 6 : Pre-Workout, BCAA & EAA (10 articles)
- **Hubs Commerciaux :** `https://paratunisie.com/pre-workout` & `https://paratunisie.com/acides-amines`
- **Ancres Recommandées :**
  - "booster pre-workout pump"
  - "citrulline malate congestion"
  - "acides aminés essentiels eaa"
- **Spokes Essentiels :**
  - `/conseils/citrulline-malate-dosage-effet-tunisie` ➔ Lien vers `/pre-workout`
  - `/conseils/beta-alanine-picotements-endurance-tunisie` ➔ Lien vers `/pre-workout`
  - `/conseils/eaa-acides-amines-essentiels-croissance-tunisie` ➔ Lien vers `/acides-amines`

### Silo 7 : L-Carnitine & Minceur (8 articles)
- **Hub Commercial Principal :** `https://paratunisie.com/bruleurs-de-graisse`
- **Ancres Recommandées :**
  - "brûleur de graisse sans stimulant"
  - "L-carnitine liquide"
  - "déstockage des graisses"
- **Spokes Essentiels :**
  - `/conseils/l-carnitine-cardio-a-jeun-tunisie` ➔ Lien vers `/bruleurs-de-graisse`
  - `/conseils/cla-acide-linoleique-conjugue-avis-tunisie` ➔ Lien vers `/bruleurs-de-graisse`
  - `/conseils/the-vert-epcg-thermogenese-tunisie` ➔ Lien vers `/bruleurs-de-graisse`

---

## 3. Maillage Transversal Inter-Silos (Cross-Silo Synergies)

Certains suppléments agissent en synergie évidente dans la pratique sportive :
- **Whey + Créatine :** Les articles sur la whey renvoient systématiquement vers le guide d'utilisation de la créatine post-effort (`/creatine`).
- **Pre-Workout + Électrolytes :** Les articles sur les boosters expliquent l'importance de maintenir l'équilibre en sodium et magnésium (`/mineraux`).
- **Sèche + Récupération :** Les guides minceur renvoient vers le sommeil et l'ashwagandha (`/sommeil-stress`) pour contrôler le cortisol.

*Schéma de maillage validé pour l'amplification du PageRank interne.*
