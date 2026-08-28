const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const articlesData = [
  {
    slug: "meilleure-creatine-tunisie",
    title: "Meilleure Créatine en Tunisie 2026 : Comparatif & Guide Complet",
    excerpt: "Quelle créatine monohydrate choisir en Tunisie en 2026 ? Comparatif objectif des marques disponibles, analyse des formats, prix réels et conseils d'achat.",
    category: "Créatine",
    readTime: "7 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "meilleure creatine tunisie",
    seoTitle: "Meilleure Créatine en Tunisie 2026 : Comparatif & Prix | ParaTunisie",
    seoDescription: "Découvrez quelle créatine monohydrate choisir en Tunisie en 2026. Comparatif complet des marques Optimum Nutrition, BioTechUSA, OstroVit, Quamtrax et Real Pharm.",
    canonicalUrl: "/conseils/meilleure-creatine-tunisie",
    productSlugs: [
      { slug: "creatine-monohydrate-ostrovit-500gr", rationale: "Meilleur rapport quantité/prix en 500g" },
      { slug: "micronised-creatine-optimum-nutrition-317g", rationale: "Micronisation extra-fine de réputation mondiale" },
      { slug: "100-creatine-monohydrate-300g-biotech-usa", rationale: "Formule pure contrôlée 100% monohydrate" },
      { slug: "creatine-monohydrate-500g-quamtrax", rationale: "Qualité européenne Quamtrax 500g" },
      { slug: "creatine-real-pharm-300g", rationale: "Poudre micronisée ultra pure Real Pharm" },
    ],
    faqs: [
      { question: "Quelle est la différence entre créatine monohydrate et Creapure® ?", answer: "Creapure® est un label allemand breveté garantissant des contrôles stricts. Une créatine monohydrate pure de marque européenne certifiée offre une efficacité équivalente sur la force." },
      { question: "Faut-il faire une phase de charge de 20g par jour ?", answer: "Non. Une dose de 3g à 5g par jour sature pleinement les réserves musculaires en 3 à 4 semaines." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Pourquoi la créatine monohydrate est le complément n°1 en musculation" },
      { type: "paragraph", text: "La créatine monohydrate est le complément le plus étudié au monde pour le gain de force explosive et le volume musculaire." },
      { type: "heading2", text: "Les critères objectifs pour comparer les créatines en Tunisie" },
      { type: "paragraph", text: "Pureté 100% sans sucres ajoutés, finesse de micronisation, et traçabilité certifiée." },
    ],
  },
  {
    slug: "creatine-monohydrate-bienfaits-dosage",
    title: "Créatine Monohydrate : Bienfaits, Dosage et Comment la Prendre",
    excerpt: "Guide complet sur la créatine monohydrate : bienfaits sur la force et la masse, dosage optimal de 3g à 5g, conseils de prise avec eau ou jus et durée de cure.",
    category: "Créatine",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "creatine monohydrate",
    seoTitle: "Créatine Monohydrate : Bienfaits, Dosage & Mode d'Emploi | ParaTunisie",
    seoDescription: "Comment bien doser et prendre sa créatine monohydrate ? Découvrez les bienfaits prouvés, la posologie de 3g à 5g et les conseils d'assimilation.",
    canonicalUrl: "/conseils/creatine-monohydrate-bienfaits-dosage",
    productSlugs: [
      { slug: "creatine-monohydrate-ostrovit-500gr", rationale: "Format 500g longue durée" },
      { slug: "creatine-real-pharm-300g", rationale: "Poudre micronisée" },
    ],
    faqs: [
      { question: "La créatine abîme-t-elle les reins ?", answer: "Chez les personnes en bonne santé, 3g à 5g par jour ne présente aucun danger pour la fonction rénale." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Les bienfaits prouvés de la créatine monohydrate" },
      { type: "paragraph", text: "Amélioration de la puissance musculaire anaérobie, accélération de la récupération et hydratation intracellulaire." },
    ],
  },
  {
    slug: "creatine-avant-ou-apres-entrainement",
    title: "Créatine Avant ou Après l'Entraînement ? Quand la Prendre ?",
    excerpt: "Faut-il prendre la créatine avant ou après la séance de sport ? Timing idéal, prise les jours de repos et conseils d'assimilation pour optimiser vos gains.",
    category: "Créatine",
    readTime: "5 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "creatine avant ou apres entrainement",
    seoTitle: "Créatine Avant ou Après l'Entraînement ? Le Guide Timing | ParaTunisie",
    seoDescription: "Quand prendre sa créatine pour un maximum de résultats ? Analyse du timing pré vs post-entraînement et gestion des jours de repos.",
    canonicalUrl: "/conseils/creatine-avant-ou-apres-entrainement",
    productSlugs: [
      { slug: "creatine-monohydrate-500g-quamtrax", rationale: "Qualité européenne Quamtrax" },
      { slug: "100-creatine-monohydrate-300g-biotech-usa", rationale: "BioTechUSA 300g" },
    ],
    faqs: [
      { question: "Faut-il la prendre les jours de repos ?", answer: "Oui, à dose égale lors d'un repas principal pour maintenir la saturation." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Ce que dit la science sur le timing" },
      { type: "paragraph", text: "La prise post-séance avec un shake de whey ou un repas glucidique présente un léger avantage d'assimilation." },
    ],
  },
  {
    slug: "whey-protein-tunisie-guide",
    title: "Whey Protein en Tunisie : Guide Complet pour Bien Choisir",
    excerpt: "Tout savoir sur la whey protein en Tunisie : concentré vs isolat, concentration en protéines, vitesse d'assimilation, prix et sélection des meilleures marques.",
    category: "Protéines & Masse",
    readTime: "7 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "whey protein tunisie",
    seoTitle: "Whey Protein en Tunisie : Guide d'Achat & Meilleures Marques | ParaTunisie",
    seoDescription: "Quelle whey protéine acheter en Tunisie ? Concentré, isolate ou hydrolysat, profil en acides aminés et sélection des meilleurs produits.",
    canonicalUrl: "/conseils/whey-protein-tunisie-guide",
    productSlugs: [
      { slug: "anabolic-whey-80-2-25kg-proactive", rationale: "Format économique de 2.25kg" },
    ],
    faqs: [
      { question: "Combien de shakers par jour ?", answer: "1 à 2 shakers de 25g à 30g selon vos besoins journaliers en protéines." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Concentré vs Isolate : que choisir ?" },
      { type: "paragraph", text: "Le concentré convient à 90% des pratiquants. L'isolate est privilégié en sèche stricte ou intolérance au lactose." },
    ],
  },
  {
    slug: "whey-ou-gainer-prise-de-masse",
    title: "Whey ou Gainer : Que Choisir pour Prendre de la Masse ?",
    excerpt: "Vous hésitez entre whey protein et gainer pour votre prise de masse ? Comparatif des apports caloriques, profils morphologiques et conseils selon votre métabolisme.",
    category: "Protéines & Masse",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "whey ou gainer",
    seoTitle: "Whey ou Gainer : Lequel Choisir pour Prendre de la Masse ? | ParaTunisie",
    seoDescription: "Whey ou gainer : quel complément alimentaire choisir en Tunisie pour développer sa masse musculaire ? Le comparatif complet.",
    canonicalUrl: "/conseils/whey-ou-gainer-prise-de-masse",
    productSlugs: [
      { slug: "anabolic-whey-80-2-25kg-proactive", rationale: "Protéine pure sans surplus glucidique" },
      { slug: "thunder-gainer-5-4kg-challenger-nutrition", rationale: "Gainer haute calorie pour profils minces" },
    ],
    faqs: [
      { question: "Le gainer fait-il prendre du gras ?", answer: "Seulement si le surplus calorique total dépasse vos besoins physiologiques." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Différence fondamentale de composition" },
      { type: "paragraph", text: "La whey apporte des protéines pures (120 kcal) tandis que le gainer apporte protéines et glucides denses (400 à 1000+ kcal)." },
    ],
  },
  {
    slug: "prise-de-masse-tunisie-guide",
    title: "Prise de Masse en Tunisie : Nutrition, Gainer, Whey et Créatine",
    excerpt: "Guide pilier de la prise de masse musculaire en Tunisie : calcul du surplus calorique, choix des aliments locaux, programme de supplémentation et erreurs courantes.",
    category: "Protéines & Masse",
    readTime: "9 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "prise de masse tunisie",
    seoTitle: "Prise de Masse en Tunisie : Guide Ultime Nutrition & Compléments | ParaTunisie",
    seoDescription: "Le guide complet pour réussir sa prise de masse en Tunisie. Stratégie nutritionnelle, calcul du surplus calorique et stack de compléments indispensables.",
    canonicalUrl: "/conseils/prise-de-masse-tunisie-guide",
    productSlugs: [
      { slug: "thunder-gainer-5-4kg-challenger-nutrition", rationale: "Densité calorique pour hardgainers" },
      { slug: "anabolic-whey-80-2-25kg-proactive", rationale: "Apport protéique pur" },
      { slug: "creatine-monohydrate-ostrovit-500gr", rationale: "Force et volume musculaire" },
    ],
    faqs: [
      { question: "Combien de kilos par mois viser ?", answer: "Entre 1 kg et 1,5 kg par mois pour une prise de muscle propre." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Les piliers de la prise de masse propre" },
      { type: "paragraph", text: "Surplus calorique modéré, entraînement lourd progressif et récupération." },
    ],
  },
  {
    slug: "meilleur-pre-workout-tunisie",
    title: "Meilleur Pre-Workout en Tunisie : Comment Choisir son Booster ?",
    excerpt: "Guide comparatif des pre-workouts et boosters en Tunisie : caféine, citrulline, bêta-alanine, tolérance, dosages recommandés et sélection des meilleures formules.",
    category: "Performance",
    readTime: "7 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "pre workout tunisie",
    seoTitle: "Meilleur Pre-Workout en Tunisie : Guide & Comparatif Boosters | ParaTunisie",
    seoDescription: "Quel est le meilleur pre-workout en Tunisie ? Analyse des ingrédients (caféine, citrulline, bêta-alanine) et comparatif des boosters disponibles.",
    canonicalUrl: "/conseils/meilleur-pre-workout-tunisie",
    productSlugs: [
      { slug: "psychotic-pre-workout", rationale: "Énergie intense pour pratiquants avertis" },
      { slug: "pump-extreme-pre-workout-challenger-nutrition-30-servings", rationale: "Congestion et endurance d'effort" },
      { slug: "pre-workout-born-rage-original-eric-favre", rationale: "Formule française complète" },
      { slug: "victor-martinez-break-out-pre-workout", rationale: "Focus sans crash" },
    ],
    faqs: [
      { question: "Pourquoi la bêta-alanine picote-t-elle ?", answer: "Paresthésie normale et bénigne liée aux récepteurs nerveux sensoriels." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Les ingrédients clés d'un booster efficace" },
      { type: "paragraph", text: "Caféine pour l'éveil, L-Citrulline pour l'oxyde nitrique et Bêta-Alanine pour l'endurance musculaire." },
    ],
  },
  {
    slug: "pre-workout-ou-creatine",
    title: "Pre-Workout ou Créatine : Quelle Différence et Peut-on les Combiner ?",
    excerpt: "Créatine et pre-workout : quelles sont les différences d'action et d'objectifs ? Peut-on les prendre ensemble ? Explications claires et conseils de combinaison.",
    category: "Performance",
    readTime: "5 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "pre workout ou creatine",
    seoTitle: "Pre-Workout ou Créatine : Différences & Combinaison | ParaTunisie",
    seoDescription: "Faut-il choisir entre créatine et pre-workout ou peut-on les associer ? Découvrez leurs mécanismes complémentaires pour décupler vos performances.",
    canonicalUrl: "/conseils/pre-workout-ou-creatine",
    productSlugs: [
      { slug: "psychotic-pre-workout", rationale: "Énergie pré-effort" },
      { slug: "creatine-monohydrate-ostrovit-500gr", rationale: "Saturation des réserves d'ATP" },
    ],
    faqs: [
      { question: "Peut-on les mélanger ?", answer: "Oui, le booster 30 min avant et la créatine après la séance ou au repas." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Deux mécanismes complémentaires" },
      { type: "paragraph", text: "Le booster a un effet aigu immédiat, la créatine un effet chronique par accumulation." },
    ],
  },
  {
    slug: "bcaa-ou-eaa",
    title: "BCAA ou EAA : Quelle Différence et Lequel Choisir ?",
    excerpt: "BCAA (3 acides aminés branchés) vs EAA (9 acides aminés essentiels) : lequel choisir pour la récupération, l'entraînement à jeun et la synthèse musculaire ?",
    category: "Acides Aminés",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "bcaa ou eaa",
    seoTitle: "BCAA ou EAA : Quelle Différence et Lequel Choisir ? | ParaTunisie",
    seoDescription: "BCAA ou EAA : que choisir pour optimiser la récupération et l'anabolisme musculaire ? Analyse comparative complète des acides aminés.",
    canonicalUrl: "/conseils/bcaa-ou-eaa",
    productSlugs: [
      { slug: "xtend-bcaa-420g", rationale: "Formule BCAA 2:1:1 avec électrolytes" },
      { slug: "eaa-master-amino-390g-scenit-nutrition", rationale: "Spectre complet des 9 acides aminés essentiels" },
    ],
    faqs: [
      { question: "Les EAA sont-ils meilleurs que les BCAA ?", answer: "Les EAA sont plus complets car ils fournissent l'ensemble des 9 acides aminés nécessaires à la synthèse musculaire." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Différence biologique" },
      { type: "paragraph", text: "Les BCAA fournissent la leucine déclencheuse, les EAA fournissent tous les blocs de construction." },
    ],
  },
  {
    slug: "citrulline-arginine-beta-alanine",
    title: "Citrulline, Arginine ou Bêta-Alanine : Que Choisir Avant l'Entraînement ?",
    excerpt: "Guide complet des acides aminés pré-workout : L-Citrulline vs Arginine pour la congestion (NO) et Bêta-Alanine pour l'endurance musculaire.",
    category: "Acides Aminés",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "citrulline ou beta alanine",
    seoTitle: "Citrulline, Arginine ou Bêta-Alanine : Le Guide Pré-Workout | ParaTunisie",
    seoDescription: "Citrulline, arginine ou bêta-alanine ? Découvrez quel acide aminé pré-entraînement correspond à vos objectifs de congestion et d'endurance.",
    canonicalUrl: "/conseils/citrulline-arginine-beta-alanine",
    productSlugs: [
      { slug: "citruargin-300-g-real-pharm", rationale: "Citrulline & Arginine combinées" },
      { slug: "beta-alanine-300g-real-pharm", rationale: "Bêta-Alanine pure 300g" },
    ],
    faqs: [
      { question: "Peut-on les prendre le soir sans caféine ?", answer: "Oui, ces acides aminés sont non-stimulants et ne gênent pas le sommeil." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Pourquoi la Citrulline surpasse l'Arginine" },
      { type: "paragraph", text: "La citrulline évite le premier passage hépatique et augmente plus durablement l'oxyde nitrique." },
    ],
  },
  {
    slug: "ashwagandha-tunisie-guide",
    title: "Ashwagandha en Tunisie : Guide pour Bien Choisir son Complément",
    excerpt: "Découvrez l'Ashwagandha (Withania somnifera) en Tunisie : bienfaits adaptogènes prouvés, gestion du stress et du cortisol, récupération sportive et posologie.",
    category: "Bien-être",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "ashwagandha tunisie",
    seoTitle: "Ashwagandha en Tunisie : Guide d'Achat, Bienfaits & Prix | ParaTunisie",
    seoDescription: "Tout savoir sur l'Ashwagandha en Tunisie. Bienfaits sur la récupération, le stress et la vitalité, titrage en withanolides et posologie.",
    canonicalUrl: "/conseils/ashwagandha-tunisie-guide",
    productSlugs: [
      { slug: "ashwagandha-100-natural-90tabs", rationale: "Extrait naturel Real Pharm 90 comprimés" },
      { slug: "ashwagandha-60-gelules-biotech-usa", rationale: "Gélules titrées BioTechUSA" },
    ],
    faqs: [
      { question: "L'ashwagandha a-t-elle des contre-indications ?", answer: "Déconseillée aux femmes enceintes/allaitantes et troubles thyroïdiens sans avis médical." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Qu'est-ce que l'Ashwagandha ?" },
      { type: "paragraph", text: "Plante adaptogène ayurvédique modulant la réponse physiologique au stress et au cortisol." },
    ],
  },
  {
    slug: "quand-prendre-ashwagandha",
    title: "Quand Prendre l'Ashwagandha : Matin ou Soir ?",
    excerpt: "Faut-il consommer l'Ashwagandha le matin pour l'énergie ou le soir pour le sommeil ? Guide pratique des moments de prise selon vos objectifs.",
    category: "Bien-être",
    readTime: "5 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "quand prendre ashwagandha",
    seoTitle: "Quand Prendre l'Ashwagandha : Matin ou Soir ? | ParaTunisie",
    seoDescription: "Quel est le meilleur moment pour prendre l'Ashwagandha ? Matin, midi ou soir ? Adaptez votre prise selon vos besoins de détente ou d'énergie.",
    canonicalUrl: "/conseils/quand-prendre-ashwagandha",
    productSlugs: [
      { slug: "ashwagandha-100-natural-90tabs", rationale: "Pratique en 1 comprimé au repas" },
    ],
    faqs: [
      { question: "Faut-il faire des cycles ?", answer: "Des cures de 8 à 12 semaines avec 2 à 4 semaines de pause sont recommandées." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Prise matin vs soir" },
      { type: "paragraph", text: "Le soir pour la détente nocturne, le matin pour réguler le stress professionnel." },
    ],
  },
  {
    slug: "vitamine-d3-k2-tunisie",
    title: "Vitamine D3 + K2 en Tunisie : À Quoi Servent-elles et Comment Choisir ?",
    excerpt: "Pourquoi associer la vitamine D3 et la vitamine K2 en Tunisie ? Rôle sur la fixation du calcium, santé osseuse, immunité, dosages et précautions.",
    category: "Vitamines & Santé",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "vitamine d3 k2 tunisie",
    seoTitle: "Vitamine D3 + K2 en Tunisie : Bienfaits, Synergie & Guide | ParaTunisie",
    seoDescription: "Pourquoi prendre la vitamine D3 avec la vitamine K2 ? Découvrez les bienfaits de cette synergie pour les os, l'immunité et la fonction musculaire.",
    canonicalUrl: "/conseils/vitamine-d3-k2-tunisie",
    productSlugs: [
      { slug: "vegan-vitamin-d3-k2-365-tablets-weightworld", rationale: "Format annuel 365 comprimés vegans" },
      { slug: "vitamin-d3-k2-90-tabs-real-pharm", rationale: "Qualité Real Pharm 90 comprimés" },
    ],
    faqs: [
      { question: "Pourquoi associer la K2 à la D3 ?", answer: "La K2 active l'ostéocalcine et prévient le dépôt de calcium dans les parois artérielles." },
    ],
    contentBlocks: [
      { type: "heading2", text: "La synergie D3 + K2" },
      { type: "paragraph", text: "La D3 absorbe le calcium, la K2 le guide vers la matrice osseuse." },
    ],
  },
  {
    slug: "zinc-sportif-musculation",
    title: "Zinc pour les Sportifs : Besoins, Alimentation et Compléments",
    excerpt: "Rôle fondamental du zinc chez le sportif et le pratiquant de musculation : immunité, synthèse des protéines, pertes par la sudation et formes biodisponibles.",
    category: "Vitamines & Santé",
    readTime: "5 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "zinc sportif",
    seoTitle: "Zinc pour les Sportifs : Besoins, Bienfaits & Dosage | ParaTunisie",
    seoDescription: "Pourquoi le zinc est-il indispensable en musculation ? Analyse des besoins accrus, de l'immunité et des meilleures formes assimilables.",
    canonicalUrl: "/conseils/zinc-sportif-musculation",
    productSlugs: [
      { slug: "zinc-90-tab-real-pharm", rationale: "Comprimés de zinc Real Pharm" },
      { slug: "zinc-duo-biotech-usa-60-capsules", rationale: "Duo sources BioTechUSA" },
      { slug: "zumub-zinc-100-comprimes", rationale: "Format 100 comprimés Zumub" },
    ],
    faqs: [
      { question: "Quel dosage quotidien de zinc ?", answer: "10 à 15 mg par jour pour un sportif adulte couvrent parfaitement les besoins." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Rôle chez l'athlète" },
      { type: "paragraph", text: "Cofacteur enzymatique clé dans la synthèse protéique et le maintien de l'immunité." },
    ],
  },
  {
    slug: "omega-3-tunisie-guide",
    title: "Oméga 3 en Tunisie : EPA, DHA et Comment Choisir un Bon Produit",
    excerpt: "Guide complet des acides gras oméga-3 en Tunisie : ratio EPA / DHA, bienfaits cardiovasculaires et articulaires, pureté et critères de sélection.",
    category: "Vitamines & Santé",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "omega 3 tunisie",
    seoTitle: "Oméga 3 en Tunisie : Guide EPA/DHA & Meilleurs Compléments | ParaTunisie",
    seoDescription: "Comment bien choisir ses oméga-3 en Tunisie ? Teneur en EPA et DHA, bienfaits pour le cœur et les articulations des sportifs.",
    canonicalUrl: "/conseils/omega-3-tunisie-guide",
    productSlugs: [
      { slug: "mega-omega-3-90-caps-biotech", rationale: "Haute concentration en EPA/DHA" },
      { slug: "zumub-omega-3-90-caps", rationale: "Huile de poisson pure standardisée" },
    ],
    faqs: [
      { question: "Quelle dose d'EPA et DHA par jour ?", answer: "500 à 1000 mg d'EPA + DHA combinés par jour pour un adulte actif." },
    ],
    contentBlocks: [
      { type: "heading2", text: "L'importance du ratio oméga-3 / oméga-6" },
      { type: "paragraph", text: "Régulation des processus inflammatoires et soutien de la santé cardiovasculaire." },
    ],
  },
  {
    slug: "multivitamines-sportifs",
    title: "Multivitamines pour Sportifs : Sont-elles Vraiment Utiles ?",
    excerpt: "Les multivitamines sont-elles nécessaires quand on fait du sport ? Analyse des besoins accrus en micronutriments, critères de choix et pièges à éviter.",
    category: "Vitamines & Santé",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "multivitamines sportif",
    seoTitle: "Multivitamines pour Sportifs : Utilité, Bienfaits & Guide | ParaTunisie",
    seoDescription: "Les sportifs ont-ils besoin d'un complexe de multivitamines ? Découvrez comment combler les carences et soutenir le métabolisme énergétique.",
    canonicalUrl: "/conseils/multivitamines-sportifs",
    productSlugs: [
      { slug: "opti-men-90tabs", rationale: "Complexe multivitaminé mondial Optimum Nutrition" },
      { slug: "one-a-day-biotech-usa", rationale: "1 comprimé par jour équilibré" },
    ],
    faqs: [
      { question: "Quand prendre son multivitamine ?", answer: "Le matin au petit-déjeuner pour une absorption optimale." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Pourquoi l'effort accru nécessite des micronutriments" },
      { type: "paragraph", text: "Renouvellement cellulaire et soutien des métabolismes énergétiques enzymatiques." },
    ],
  },
  {
    slug: "l-carnitine-perte-graisse",
    title: "L-Carnitine et Perte de Graisse : Ce Qu'il Faut Vraiment Savoir",
    excerpt: "La L-Carnitine fait-elle vraiment brûler les graisses ? Rôle physiologique sur le transport des lipides, efficacité réelle, synergie avec le cardio et conseils.",
    category: "Sèche & Minceur",
    readTime: "6 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "l carnitine perte de poids",
    seoTitle: "L-Carnitine et Perte de Graisse : Vérités & Conseils | ParaTunisie",
    seoDescription: "La L-Carnitine est-elle efficace pour la perte de gras en musculation ? Découvrez son mode d'action et pourquoi elle ne remplace pas le déficit calorique.",
    canonicalUrl: "/conseils/l-carnitine-perte-graisse",
    productSlugs: [
      { slug: "l-carnitina-1250-60-capsule-ostrovit", rationale: "Dosage 1250mg par capsule" },
      { slug: "gold-l-carnitine-3000-500ml", rationale: "Formule liquide 3000mg" },
    ],
    faqs: [
      { question: "La L-Carnitine suffit-elle seule ?", answer: "Non, une alimentation hypocalorique et une dépense physique sont indispensables." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Transport des acides gras dans la mitochondrie" },
      { type: "paragraph", text: "Navette moléculaire facilitant l'oxydation des lipides lors d'efforts aérobies prolongés." },
    ],
  },
  {
    slug: "bruleur-de-graisse-tunisie",
    title: "Brûleur de Graisse en Tunisie : Guide, Ingrédients et Précautions",
    excerpt: "Guide complet des brûleurs de graisse (fat burners) en Tunisie : thermogéniques, coupe-faim, ingrédients vérifiés, précautions d'usage et conseils de sécurité.",
    category: "Sèche & Minceur",
    readTime: "7 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "bruleur de graisse tunisie",
    seoTitle: "Brûleur de Graisse en Tunisie : Ingrédients & Guide Sèche | ParaTunisie",
    seoDescription: "Comment bien choisir et utiliser un brûleur de graisse en Tunisie ? Ingrédients clés (caféine, thé vert, L-carnitine) et précautions de sécurité.",
    canonicalUrl: "/conseils/bruleur-de-graisse-tunisie",
    productSlugs: [
      { slug: "lipo-6-black-ultra-concentrate-60caps", rationale: "Formule thermogénique concentrée" },
      { slug: "l-carnitina-1250-60-capsule-ostrovit", rationale: "Option lipotrope sans stimulants" },
    ],
    faqs: [
      { question: "Combien de poids peut-on perdre ?", answer: "Le brûleur n'apporte qu'un coup de pouce d'appoint de 5 à 10% par rapport au déficit calorique global." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Thermogéniques vs Lipotropes" },
      { type: "paragraph", text: "Les thermogéniques augmentent la dépense de repos, les lipotropes agissent sans stimulants nerveux." },
    ],
  },
  {
    slug: "complements-musculation-debutant",
    title: "Quels Compléments Prendre Quand On Débute la Musculation ?",
    excerpt: "Vous commencez la musculation en Tunisie ? Découvrez l'ordre de priorité absolu : alimentation, entraînement, sommeil, et les seuls compléments réellement utiles.",
    category: "Débutants",
    readTime: "8 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "complément musculation débutant",
    seoTitle: "Quels Compléments Prendre en Débutant la Musculation ? | ParaTunisie",
    seoDescription: "Guide complet pour les débutants en musculation en Tunisie. La pyramide des priorités et sélection des 3 compléments indispensables.",
    canonicalUrl: "/conseils/complements-musculation-debutant",
    productSlugs: [
      { slug: "anabolic-whey-80-2-25kg-proactive", rationale: "Protéine pratique post-effort" },
      { slug: "creatine-monohydrate-ostrovit-500gr", rationale: "Gain de force progressive" },
      { slug: "opti-men-90tabs", rationale: "Assurance micronutritionnelle" },
    ],
    faqs: [
      { question: "Peut-on débuter sans aucun complément ?", answer: "Oui tout à fait. La nourriture solide bien équilibrée est la base de tout progrès." },
    ],
    contentBlocks: [
      { type: "heading2", text: "La pyramide des priorités" },
      { type: "paragraph", text: "Entraînement régulier, alimentation riche en protéines et sommeil profond avant les compléments." },
    ],
  },
  {
    slug: "complements-avant-pendant-apres-entrainement",
    title: "Compléments Avant, Pendant et Après l'Entraînement : Guide Complet",
    excerpt: "Comment organiser sa supplémentation sportive autour de la séance ? Stratégie timing : Pré-workout (énergie), Intra-workout (hydratation) et Post-workout (whey/créatine).",
    category: "Performance",
    readTime: "7 min",
    date: "2026-08-28",
    authorName: "Équipe éditoriale ParaTunisie",
    featuredImage: "/assets/hero-paratunisie.webp",
    focusKeyword: "compléments avant après entraînement",
    seoTitle: "Compléments Avant, Pendant & Après l'Entraînement : Timing | ParaTunisie",
    seoDescription: "Le guide du nutrient timing en musculation : que prendre avant, pendant et après l'entraînement pour maximiser l'énergie et la récupération ?",
    canonicalUrl: "/conseils/complements-avant-pendant-apres-entrainement",
    productSlugs: [
      { slug: "psychotic-pre-workout", rationale: "Avant l'effort (énergie & focus)" },
      { slug: "xtend-bcaa-420g", rationale: "Pendant l'effort (électrolytes & BCAA)" },
      { slug: "anabolic-whey-80-2-25kg-proactive", rationale: "Après l'effort (acides aminés rapides)" },
      { slug: "creatine-monohydrate-ostrovit-500gr", rationale: "Après l'effort (restauration ATP)" },
    ],
    faqs: [
      { question: "La fenêtre anabolique existe-t-elle ?", answer: "Elle est d'environ 2 à 3 heures autour de l'effort, consommer un shaker dans l'heure suivant l'entraînement est optimal." },
    ],
    contentBlocks: [
      { type: "heading2", text: "Les 3 phases du nutrient timing" },
      { type: "paragraph", text: "Avant pour préparer le système nerveux, pendant pour maintenir l'hydratation, après pour lancer la synthèse protéique." },
    ],
  },
];

async function seedArticles() {
  console.log("=== SEEDING 20 SEO ARTICLES FOR PARATUNISIE ===");

  const oldSlugs = [
    "routine-peau-grasse-guide-complet",
    "protection-solaire-tunisie-guide",
    "routine-anti-age-debut",
    "peau-sensible-calmee",
    "chute-cheveux-precautions",
    "hydratation-peau-seche-hiver",
  ];

  await prisma.article.deleteMany({
    where: { slug: { in: oldSlugs } },
  }).catch(() => {});

  let insertedCount = 0;

  for (const item of articlesData) {
    const article = await prisma.article.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        readTime: item.readTime,
        date: item.date,
        content: JSON.stringify(item.contentBlocks),
        status: "PUBLISHED",
        authorName: item.authorName,
        featuredImage: item.featuredImage,
        seoTitle: item.seoTitle,
        metaDescription: item.seoDescription,
        canonicalUrl: item.canonicalUrl,
        indexable: true,
        targetKeyword: item.focusKeyword,
        publishedAt: new Date(item.date),
      },
      create: {
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        readTime: item.readTime,
        date: item.date,
        content: JSON.stringify(item.contentBlocks),
        status: "PUBLISHED",
        authorName: item.authorName,
        featuredImage: item.featuredImage,
        seoTitle: item.seoTitle,
        metaDescription: item.seoDescription,
        canonicalUrl: item.canonicalUrl,
        indexable: true,
        targetKeyword: item.focusKeyword,
        publishedAt: new Date(item.date),
      },
    });

    await prisma.articleProduct.deleteMany({ where: { articleId: article.id } });
    await prisma.articleFaq.deleteMany({ where: { articleId: article.id } });

    for (let i = 0; i < item.productSlugs.length; i++) {
      const pDef = item.productSlugs[i];
      const prod = await prisma.product.findUnique({
        where: { slug: pDef.slug },
        select: { id: true },
      });

      if (prod) {
        await prisma.articleProduct.create({
          data: {
            articleId: article.id,
            productId: prod.id,
            rationale: pDef.rationale || null,
            position: i,
          },
        }).catch(() => {});
      }
    }

    if (item.faqs && item.faqs.length > 0) {
      await prisma.articleFaq.createMany({
        data: item.faqs.map((f, idx) => ({
          articleId: article.id,
          question: f.question,
          answer: f.answer,
          position: idx,
        })),
      });
    }

    insertedCount++;
    console.log(`✓ [${insertedCount}/20] Seeded: ${item.slug}`);
  }

  console.log(`\nSuccessfully seeded ${insertedCount} articles in the database!`);
}

seedArticles()
  .catch((err) => {
    console.error("Error seeding articles:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
