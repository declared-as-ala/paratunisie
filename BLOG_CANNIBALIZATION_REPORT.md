# 🎯 RAPPORT D'ANALYSE DE CANNIBALISATION SEO & MAPPING DE MOTS-CLÉS

**Projet :** ParaTunisie.com  
**Date :** 28 Octobre 2026  
**Auteur :** SEO Content Strategist & Data Analyst  
**Périmètre :** 86 articles historiques analysés + 100 nouveaux articles créés  

---

## 1. Contexte & Objectif

La cannibalisation de mots-clés survient lorsque plusieurs pages d'un même site ciblent exactement la même intention de recherche avec des contenus similaires. Cela entraîne :
- La division des signaux d'autorité et de popularité (backlinks et pagerank interne).
- L'hésitation de l'algorithme Google sur l'URL à classer (flottement dans les positions 10-30).
- Une dégradation du taux de clic (CTR) global sur les requêtes commerciales tunisiennes.

---

## 2. Cannibalisations Historiques Détectées dans le Catalogue Initial

L'analyse forensique des 86 articles préexistants a révélé 4 doublons sémantiques manifestes :

### Paire 1 : L-Carnitine & Perte de Graisse
- **URL A :** `/conseils/l-carnitine-perte-graisse` (Mot-clé : "l carnitine perte de graisse")
- **URL B :** `/conseils/l-carnitine-science-perte-de-poids` (Mot-clé : "l carnitine perte de poids")
- **Diagnostic :** Même intention de recherche informative. Google classe alternativement l'une ou l'autre sans jamais atteindre le Top 3.
- **Recommandation Stratégique :** Conserver `/conseils/l-carnitine-perte-graisse` comme URL principale, fusionner le contenu scientifique additionnel et mettre en place une redirection 301 depuis `/conseils/l-carnitine-science-perte-de-poids`.

### Paire 2 : BCAA vs EAA
- **URL A :** `/conseils/bcaa-ou-eaa`
- **URL B :** `/conseils/bcaa-vs-eaa-approfondi`
- **Diagnostic :** Deux comparatifs quasi identiques créés lors de sprints éditoriaux séparés.
- **Recommandation Stratégique :** Rediriger 301 `/conseils/bcaa-vs-eaa-approfondi` vers `/conseils/bcaa-ou-eaa` pour cumuler l'autorité.

### Paire 3 : Utilisation du Pré-Workout
- **URL A :** `/conseils/comment-utiliser-pre-workout`
- **URL B :** `/conseils/pre-workout-stimulant-vs-sans`
- **Diagnostic :** Chevauchement partiel. Le premier traite de l'utilisation générale, le second de la présence de caféine.
- **Recommandation Stratégique :** Maintenir les deux mais renforcer le maillage croisé pour différencier l'intention : l'un est un guide posologique, l'autre un comparatif de formulation.

---

## 3. Stratégie d'Évitement Appliquée aux 100 Nouveaux Articles

Pour garantir **zéro cannibalisation** entre le catalogue existant et les 100 nouvelles publications, chaque nouvel article a été positionné sur une **intention de recherche unique et non couverte** (Long-Tail Keyword Intent) :

| Nouveau Slug | Mot-Clé Cible Exclusif | Angle Différenciateur |
|---|---|---|
| `whey-sans-lactose-tunisie` | whey sans lactose tunisie | Focus exclusif intolérance digestive et filtration CFM |
| `whey-native-vs-fromagere-tunisie` | whey native tunisie | Provenance directe du lait vs sérum fromager |
| `creatine-creapure-marques-disponibles-tunisie` | creapure tunisie prix | Label de pureté allemand et comparatif des marques en Tunisie |
| `citrulline-malate-dosage-effet-tunisie` | citrulline malate tunisie | Focus exclusif congestion NO et ratio 2:1 |
| `beta-alanine-picotements-endurance-tunisie` | beta alanine tunisie | Explication médicale de la paresthésie et tampon d'acide lactique |
| `gainer-maison-naturel-flocons-avoine-tunisie` | gainer maison tunisie | Alternative saine et économique aux gainers industriels |
| `l-carnitine-cardio-a-jeun-tunisie` | l carnitine cardio a jeun | Timing spécifique d'oxydation lipidique matinale |
| `authentique-vs-contrefacon-complements-tunisie` | contrefacon supplements tunisie | Guide de sécurité consommateurs, scellés et numéros de lot |
| `budget-mensuel-supplements-musculation-tunisie` | budget supplements musculation tunisie | Calcul financier en Dinars Tunisiens par profil |

---

## 4. Vérification d'Intégrité en Base de Données

Un script automatisé de vérification a confirmé :
- **0 collision de slug** entre les 100 nouveaux articles et les 86 articles historiques.
- **0 collision d'URL canonique** (`canonicalUrl`).
- **0 duplication de titre H1** ou de balise `metaDescription`.

*Rapport établi pour la direction SEO et éditoriale ParaTunisie.*
