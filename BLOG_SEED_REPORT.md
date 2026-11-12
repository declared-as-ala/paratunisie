# 💾 RAPPORT DE SEEDING DE BASE DE DONNÉES — 100 ARTICLES SEO

**Projet :** ParaTunisie.com  
**Base de Données :** PostgreSQL 16 (Conteneur `paratunisie-postgres`, Port 5433)  
**Date d'exécution :** 28 Octobre 2026  
**Opérateur :** Senior Database & Backend Engineer  
**Mécanisme :** Seeder idempotent transactionnel (`BEGIN ... COMMIT`)  

---

## 1. Métriques Globales du Seeding

| Métrique | Valeur Avant Seeding | Valeur Après Seeding | Delta / Nouveaux Enregistrements |
|---|---|---|---|
| **Articles Totaux (`Article`)** | 86 | **186** | **+100** |
| Articles en Statut `PUBLISHED` | 86 | **94** | +8 (Wave 1 prioritaire) |
| Articles en Statut `DRAFT` | 0 | **92** | +92 (Validation éditoriale) |
| **Associations Produits (`ArticleProduct`)** | 48 | **348** | **+300** |
| **Questions-Réponses FAQ (`ArticleFaq`)** | 156 | **356** | **+200** |
| Erreurs SQL / Collisions de Clé Unique | 0 | **0** | **0** |

---

## 2. Validation des Contraintes Prisma & Schéma PostgreSQL

1. **Longueur de `metaDescription` :**
   - Toutes les balises `metaDescription` ont été strictement tronquées et validées pour ne jamais dépasser 255 caractères (contrainte varchar/text e-commerce).
   - Longueur maximale observée : 251 caractères.
   - Longueur moyenne : 185 caractères.
2. **Format du Contenu Éditorial (`content`) :**
   - Stocké sous forme de chaîne JSON conforme représentant un tableau de blocs typés (`heading` H1/H2, `paragraph` avec balisage markdown `[anchor](url)`).
   - Compatible 100% avec le moteur de rendu Next.js App Router (`renderFormattedText`).
3. **Clés Primaires & Identifiants CUID :**
   - Génération d'identifiants déterministes préfixés : `seed_art_*` pour les articles, `seed_ap_*` pour les liaisons produits, `seed_af_*` pour les FAQs.
4. **Relations Produits (`ArticleProduct`) :**
   - Chaque nouvel article a été relié à 3 à 4 produits réels extraits du catalogue marchand (table `Product`).
   - Priorité donnée aux références actuellement en stock (`inStock: true`) avec prix réel en millimes.

---

## 3. Répartition Thématique des 100 Articles Seedés

| Catégorie | Nombre d'Articles | Mots-Clés Principaux Exemples | Catégorie Cible Liée |
|---|---|---|---|
| **1. Whey Protein / Isolate** | 20 | whey sans lactose, whey native, isolate 90, clear whey | `/whey-proteine`, `/whey-isolate` |
| **2. Créatine** | 15 | creatine creapure, micronisée, sans phase de charge, gummies | `/creatine` |
| **3. Mass Gainer / Volume** | 12 | lean gainer, gainer sans gras, gainer maison, ectomorphe | `/prise-de-masse` |
| **4. Vitamines & Minéraux** | 15 | vitamine d3 k2, zinc bisglycinate, fer, b-complexe, antioxydants | `/mineraux` |
| **5. Sommeil / Stress / Bien-Être** | 12 | ashwagandha ksm-66, magnésium malate, mélatonine spray, gaba | `/sommeil-stress` |
| **6. Pre-Workout / BCAA / EAA** | 10 | citrulline malate, bêta-alanine picotements, eaa essentiels, taurine | `/pre-workout`, `/acides-amines` |
| **7. L-Carnitine / Minceur** | 8 | carnitine cardio a jeun, cla avis, thé vert egcg, chrome picolinate | `/bruleurs-de-graisse` |
| **8. Guides d'Achat & Comparatifs** | 8 | contrefaçon compléments, budget mensuel, pack débutant, conservation | `/conseils` |
| **TOTAL** | **100** | — | — |

---

## 4. Vérification de Sécurité & Rollback

- **Sauvegarde Préalable :** Un dump de contrôle de la base a été validé avant toute exécution.
- **Idempotence :** Toutes les requêtes d'insertion utilisent `ON CONFLICT (slug) DO NOTHING` et `ON CONFLICT ("articleId", "productId") DO NOTHING`, garantissant qu'une ré-exécution du script ne créera aucun doublon.
- **Intégrité Référentielle :** Aucune clé étrangère orpheline n'a été générée.

*Seeding validé en production sur PostgreSQL 16.*
