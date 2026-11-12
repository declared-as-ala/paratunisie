# 🚀 RAPPORT DE DÉPLOIEMENT EN PRODUCTION — PARATUNISIE.COM

**Serveur de Production :** VPS Ubuntu 24.04 LTS (`187.53.136.225`)  
**Date du Déploiement :** 28 Octobre 2026  
**Responsable Déploiement :** Production DevOps & Infrastructure Engineer  
**Statut Global :** **DÉPLOYÉ AVEC SUCCÈS — SYSTÈME 100% OPÉRATIONNEL**  

---

## 1. Vue d'Ensemble de l'Infrastructure

| Service | Conteneur Docker | Port Interne / Externe | Technologie / Version | Statut |
|---|---|---|---|---|
| **Reverse Proxy / SSL** | Host Natif Nginx | 80 / 443 | Nginx 1.24.0 + Let's Encrypt | `Active (running)` |
| **Storefront Web** | `paratunisie-web` | 3000 / 3010 | Next.js 16.3.0 App Router | `Up (healthy)` |
| **Backend API** | `paratunisie-api` | 3001 / 3013 | NestJS 10 + Prisma ORM | `Up (healthy)` |
| **Base de Données** | `paratunisie-postgres` | 5432 / 5433 | PostgreSQL 16.1 | `Up (healthy)` |
| **Moteur de Recherche**| `paratunisie-meilisearch`| 7700 / 7700 | Meilisearch v1.12 | `Up (healthy)` |
| **Stockage Médias** | `paratunisie-minio` | 9000 / 9000 | MinIO S3 Compatible | `Up (healthy)` |

---

## 2. Journal Chronologique des Opérations Réalisées

1. **Inspection Forensique & Diagnostic :**
   - Vérification de l'état des conteneurs via SSH (`paramiko`).
   - Confirmation de la duplication www (`https://www.paratunisie.com/` répondant en 200 au lieu de 301).
   - Détection de 8 catégories majeures bloquées en `indexable: false`.
2. **Correctif Nginx & Redirection Canonique :**
   - Mise à jour du fichier `/etc/nginx/sites-available/paratunisie-domains.conf`.
   - Test de syntaxe : `nginx -t` ➔ Succès.
   - Rechargement sans interruption : `systemctl reload nginx`.
   - Validation live du header 301 Moved Permanently vers `https://paratunisie.com/`.
3. **Mise à Jour de l'Indexabilité des Catégories :**
   - Exécution du script de normalisation SQL.
   - Les 23 catégories commerciales disposant de stock ont été activées et intégrées au sitemap XML.
4. **Compilation des 100 Nouveaux Articles :**
   - Génération complète des 100 articles en 8 catégories thématiques strictes.
   - Validation des contraintes de taille de métadonnées (toutes <= 255 caractères).
   - Association déterministe avec les produits réels en stock (`real_products_catalog.json`).
   - Exportation du livrable `KEYWORD_RESEARCH_100.csv`.
5. **Seeding en Base PostgreSQL :**
   - Exécution du seeder idempotent en transaction SQL unique.
   - Insertion de 100 articles, 348 relations `ArticleProduct`, 356 `ArticleFaq`.
   - Total d'articles en base porté exactement à **186** (86 historiques + 100 nouveaux).
6. **Génération & Déploiement des Bannières WebP :**
   - Création locale de 100 visuels 1200x630 via Pillow.
   - Transfert d'archive tar et extraction en mode root dans `paratunisie-web:/app/public/assets/blog/`.
   - Validation du code HTTP 200 sur les bannières live.
7. **Activation de la Vague 1 & Tests Fonctionnels :**
   - Activation de 8 articles pilotes en statut `PUBLISHED`.
   - Vérification de la réponse HTTP 200 sur les URLs publiques `/conseils/*`.
   - Vérification de la régénération du sitemap XML (`/sitemap.xml`) comptant désormais 94 articles publiés.
   - Confirmation du bon fonctionnement de l'API de commande Aramex et du tunnel de vente.

---

## 3. Matrice de Validation Post-Déploiement

| Test Effectué | Méthode de Test | Résultat Obtenu | Conformité |
|---|---|---|---|
| Redirection WWW | `curl -I https://www.paratunisie.com` | `301 -> https://paratunisie.com/` | ✅ Conforme |
| Redirection HTTP | `curl -I http://paratunisie.com` | `301 -> https://paratunisie.com/` | ✅ Conforme |
| Sitemap XML | `curl -s https://paratunisie.com/sitemap.xml` | 233+ URLs valides, 94 articles | ✅ Conforme |
| Rendu Article Live | `curl -I https://paratunisie.com/conseils/whey-sans-lactose-tunisie` | `HTTP/1.1 200 OK` | ✅ Conforme |
| Image WebP Live | `curl -I https://paratunisie.com/assets/blog/whey-sans-lactose-tunisie.webp` | `HTTP/1.1 200 OK` (image/webp) | ✅ Conforme |
| Données Structurées | Extraction JSON-LD page conseils | BlogPosting + FAQPage + BreadcrumbList | ✅ Conforme |
| Tunnel Checkout | Simulation de création de session panier | 200 OK, pas d'impact | ✅ Conforme |

---

## 4. Plan de Secours & Rollback (Disaster Recovery)

En cas de besoin de rollback immédiat :
- **Restauration Nginx :** Le backup de configuration est disponible à `/etc/nginx/sites-available/paratunisie-domains.conf.bak`.
- **Désactivation des Articles :** La commande `UPDATE "Article" SET status = 'DRAFT', indexable = false WHERE id LIKE 'seed_art_%';` masque instantanément tous les nouveaux articles sans supprimer les données.

*Déploiement certifié conforme aux normes de production ParaTunisie.*
