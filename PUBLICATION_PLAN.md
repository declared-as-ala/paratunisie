# 📅 PLAN DE DÉPLOIEMENT ÉDITORIAL & CALENDRIER DE PUBLICATION

**Projet :** ParaTunisie.com  
**Stratégie :** Publication Échelonnée par Vagues (Controlled Phased Rollout)  
**Objectif :** Éviter l'effet "Scaled Content Spam" auprès des algorithmes de Google et maximiser l'indexation progressive des URLs qualifiées.  

---

## 1. Principes de Déploiement

La publication massive et simultanée de 100 articles sur un domaine peut déclencher des filtres de suspicion algorithmique chez Google (pénalités manuelles ou gel de crawl). Pour maximiser l'efficacité SEO, les 100 articles créés et seedés en base de données suivent un calendrier d'activation progressif en 4 vagues cadencées.

---

## 2. Calendrier des Vagues de Publication

### Vague 1 — Pilote & Validation Technique (Semaine 1 — Actuellement Live)
- **Volume :** 8 articles prioritaires activés (`status = 'PUBLISHED'`).
- **Objectif :** Valider l'indexation dans Google Search Console, vérifier l'affichage des bannières WebP et tester le tracking des conversions.
- **Articles Déployés :**
  1. `whey-sans-lactose-tunisie`
  2. `whey-native-vs-fromagere-tunisie`
  3. `citrulline-malate-dosage-effet-tunisie`
  4. `beta-alanine-picotements-endurance-tunisie`
  5. `l-carnitine-cardio-a-jeun-tunisie`
  6. `ashwagandha-ksm-66-vs-sensoril-difference`
  7. `authentique-vs-contrefacon-complements-tunisie`
  8. `budget-mensuel-supplements-musculation-tunisie`
- **Statut :** **EN LIGNE & ACCESSIBLE (HTTP 200)**.

### Vague 2 — Piliers Musculation (Semaines 2 à 3)
- **Volume :** 28 articles.
- **Thématiques :**
  - Fin du cluster Whey & Isolate (18 articles restants).
  - Fin du cluster Créatine & Force (10 articles restants).
- **Déclencheur d'activation :** Confirmation de la première vague dans le sitemap et premières impressions GSC sans anomalie 5xx.

### Vague 3 — Prise de Masse & Santé / Micronutrition (Semaines 4 à 5)
- **Volume :** 27 articles.
- **Thématiques :**
  - Cluster Mass Gainer (12 articles).
  - Cluster Vitamines & Minéraux (15 articles).
- **Déclencheur d'activation :** Taux de clics satisfaisant sur la Vague 2 et indexation > 80% des URLs soumises.

### Vague 4 — Performance, Minceur & Guides Pratiques (Semaines 6 à 7)
- **Volume :** 37 articles.
- **Thématiques :**
  - Cluster Sommeil & Stress (11 articles).
  - Cluster Performance / Pre-Workout / BCAA (8 articles).
  - Cluster L-Carnitine & Sèche (7 articles).
  - Cluster Guides d'Achat & Comparatifs (6 articles).
- **Finalité :** 100% des 100 nouveaux articles activés en statut `PUBLISHED` et intégrés au sitemap XML.

---

## 3. Protocole Technique d'Activation d'une Vague

L'activation d'un lot d'articles s'effectue via un script SQL simple et sécurisé exécuté sur PostgreSQL :

```sql
-- Exemple pour la vague 2
UPDATE "Article"
SET status = 'PUBLISHED',
    "publishedAt" = NOW(),
    indexable = true
WHERE slug IN (
    'whey-isolate-vs-concentrate',
    'combien-de-whey-par-jour',
    'creatine-creapure-marques-disponibles-tunisie',
    -- [liste des slugs approuvés]
);
```

Dès l'exécution de la requête :
1. L'API NestJS rend les articles immédiatement disponibles aux requêtes publiques.
2. Le sitemap XML dynamique `/sitemap.xml` intègre automatiquement les nouvelles URLs.
3. Le composant blog Next.js commence à afficher les articles dans le carrousel d'accueil `/conseils`.

---

## 4. Surveillance & Procédure de Retrait d'Urgence

Si un article nécessite une révision médicale ou une correction de produit :
```sql
UPDATE "Article"
SET status = 'DRAFT',
    indexable = false
WHERE slug = 'slug-a-corriger';
```
L'URL est immédiatement retirée du sitemap XML et renvoie vers la page d'accueil ou le hub conseils, protégeant l'image de marque et l'intégrité SEO.

*Plan validé par le responsable éditorial et le lead SEO.*
