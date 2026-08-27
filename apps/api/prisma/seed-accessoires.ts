import { PrismaClient, ProductPublishState } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const ACCESSOIRES_DATA = [
  {
    slug: "protein-shaker-450ml-sport-life",
    name: "Protein Shaker 450ml Sport Life",
    brand: "Sport Life",
    categorySlug: "accessoires",
    priceMillimes: 35000,
    image: "/uploads/products/protein-shaker-450ml-sport-life.webp",
    benefit: "Mélange fluide sans grumeaux, fermeture étanche anti-fuite, plastique haute densité sans BPA.",
    description: "Le Protein Shaker 450ml Sport Life est votre compagnon idéal pour préparer vos protéines et BCAA. Fabriqué en plastique de qualité alimentaire sans BPA, il intègre une boule mélangeuse inoxydable pour une dispersion parfaite et homogène de vos poudres. Idéal pour la salle de sport, au bureau ou lors de vos déplacements.",
    usage: "Verser 200-250ml d'eau ou de lait, ajouter votre dose de protéine ou BCAA, secouer énergiquement pendant 15-20 secondes. Nettoyer à l'eau chaude après chaque usage.",
    seoTitle: "Protein Shaker 450ml Sport Life Tunisie (35 DT) | ParaTunisie",
    seoDescription: "Achetez votre Protein Shaker 450ml Sport Life en Tunisie à 35 DT. Shaker anti-fuite sans BPA chez ParaTunisie. Livraison 24-48h partout en Tunisie, paiement à la livraison.",
    seoKeywords: ["shaker tunisie", "shaker proteine tunisie", "shaker musculation tunisie", "shaker sport life", "accessoires sport tunisie"],
    seoFaq: [
      { question: "Où acheter un shaker protéine à 35 DT en Tunisie ?", answer: "ParaTunisie propose le Protein Shaker Sport Life 450ml à 35 DT avec livraison rapide partout en Tunisie." },
      { question: "Le shaker est-il BPA free ?", answer: "Oui, tous nos shakers sont fabriqués en plastique certifié sans BPA pour votre sécurité alimentaire." }
    ],
    stock: 50,
  },
  {
    slug: "bande-genoux",
    name: "Bande Genoux Musculation",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 69000,
    image: "/uploads/products/bande-genoux.webp",
    benefit: "Stabilisation et compression du genou, prévention des blessures lors des charges lourdes (Squat, Leg Press).",
    description: "Les bandes genoux de musculation offrent un maintien et une compression articulaire supérieure lors de vos exercices de force lourde. Fabriquées en néoprène et élasthanne haute résistance, elles protègent vos genoux et améliorent vos performances lors des squats, presses et mouvements de poussée.",
    usage: "Enrouler la bande autour du genou de façon ferme avant vos séries de squats, leg press et exercices impliquant les genoux. Retirer après l'entraînement pour favoriser la récupération.",
    seoTitle: "Bande Genoux Musculation Tunisie (69 DT) | ParaTunisie",
    seoDescription: "Achetez vos bandes genoux de musculation en Tunisie à 69 DT chez ParaTunisie. Protéction articulaire haute résistance pour squat et leg press. Livraison express Tunisie.",
    seoKeywords: ["bande genoux tunisie", "genouillère musculation tunisie", "protection genou sport tunisie", "accessoires musculation tunisie"],
    seoFaq: [
      { question: "Sont-elles utiles pour le squat lourd ?", answer: "Oui, les bandes genoux sont fortement recommandées lors des séries maximales de squat pour protéger l'articulation du genou et améliorer la stabilité." }
    ],
    stock: 35,
  },
  {
    slug: "lifting-straps",
    name: "Lifting Straps Musculation",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 35000,
    image: "/uploads/products/lifting-straps.webp",
    benefit: "Grip ultra-renforcé pour soulevé de terre, tractions lestées et tirage. Réduit la fatigue des avant-bras.",
    description: "Les Lifting Straps sont des sangles de poignet conçues pour maximiser votre grip lors des exercices de tirage lourd. Fabriquées en coton résistant à l'humidité, elles s'enroulent autour de la barre pour compenser les faiblesses des avant-bras et vous permettre de tirer plus lourd et plus longtemps.",
    usage: "Passer le pouce dans la boucle, enrouler la sangle autour de la barre ou de la machine, tirer fermement. Utiliser pour soulevé de terre, rowing barre, tirage poulie, tractions lestées.",
    seoTitle: "Lifting Straps Sangles de Tirage Tunisie (35 DT) | ParaTunisie",
    seoDescription: "Lifting Straps musculation en Tunisie à 35 DT chez ParaTunisie. Sangles de poignet pour tirage lourd et soulevé de terre. Paiement à la livraison.",
    seoKeywords: ["lifting straps tunisie", "sangles tirage tunisie", "straps musculation tunisie", "accessoires haltérophilie tunisie"],
    seoFaq: [
      { question: "À quoi servent les lifting straps ?", answer: "Les lifting straps permettent d'améliorer votre prise en main lors des exercices de tirage lourd (soulevé de terre, rowing) en réduisant la fatigue des avant-bras." }
    ],
    stock: 45,
  },
  {
    slug: "bouteille-d-eau-2-2-litres",
    name: "Bouteille d'Eau 2.2 Litres Sport",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 40000,
    image: "/uploads/products/bouteille-d-eau-2-2-litres.webp",
    benefit: "Grande capacité 2.2L pour une hydratation journalière optimale. Graduation visible, poignée ergonomique.",
    description: "La bouteille d'eau sport 2.2 litres est conçue pour les sportifs qui s'entraînent intensément. Sa grande capacité garantit une hydratation continue tout au long de la journée. Fabriquée en Tritan sans BPA, elle est légère, résistante aux chocs et son bouchon à vis est parfaitement étanche.",
    usage: "Remplir avec de l'eau fraîche ou votre boisson d'entraînement isotonique. Les graduations permettent de suivre votre consommation d'eau quotidienne recommandée.",
    seoTitle: "Bouteille Sport 2.2L Tunisie (40 DT) | Hydratation ParaTunisie",
    seoDescription: "Grande bouteille sport 2.2 litres en Tunisie à 40 DT. Sans BPA, graduation précise chez ParaTunisie. Livraison rapide 24-48h dans tout le pays.",
    seoKeywords: ["bouteille sport tunisie", "gourde musculation tunisie", "bouteille eau sport 2 litres tunisie"],
    seoFaq: [
      { question: "La bouteille est-elle sans BPA ?", answer: "Oui, notre bouteille 2.2L est fabriquée en Tritan certifié sans BPA pour une utilisation alimentaire sans risque." }
    ],
    stock: 40,
  },
  {
    slug: "bandes-de-poignet",
    name: "Bandes de Poignet Musculation",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 35000,
    image: "/uploads/products/bandes-de-poignet.webp",
    benefit: "Maintien et stabilisation des poignets lors des développés, curl et mouvements de poussée lourde.",
    description: "Les bandes de poignet musculation offrent un maintien ferme et ajustable des articulations du poignet. Indispensables lors des développés couchés, militaires et curls lourds, elles réduisent les contraintes sur les tendons et permettent de pousser plus lourd en toute sécurité.",
    usage: "Enrouler fermement autour du poignet avant les exercices de poussée et de curl. Ajuster la tension avec le velcro pour un confort optimal.",
    seoTitle: "Bandes Poignet Musculation Tunisie (35 DT) | ParaTunisie",
    seoDescription: "Bandes de poignet musculation en Tunisie à 35 DT chez ParaTunisie. Protection articulaire pour développé couché et exercices de poussée. Paiement livraison.",
    seoKeywords: ["bandes poignet tunisie", "bandage poignet musculation tunisie", "soutien poignet sport tunisie"],
    seoFaq: [
      { question: "Faut-il des bandes poignet pour le développé couché ?", answer: "Les bandes de poignet sont recommandées lors des séries lourdes de développé couché pour protéger les poignets et maintenir un alignement optimal." }
    ],
    stock: 45,
  },
  {
    slug: "bandes-de-tirage",
    name: "Bandes de Tirage Musculation",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 35000,
    image: "/uploads/products/bandes-de-tirage.webp",
    benefit: "Renforcent le grip lors des exercices de tirage et optimisent le transfert de force.",
    description: "Les bandes de tirage musculation sont conçues pour sécuriser votre prise lors de tous les exercices de tirage. Leur construction en coton renforcé et caoutchouc naturel garantit une adhérence maximale et un confort durable pour vos séances de back, biceps et trapèzes.",
    usage: "Enrouler autour de la barre ou des câbles avant chaque série de tirage. Compatible avec barres droites, EZ et câbles de machines.",
    seoTitle: "Bandes de Tirage Sport Tunisie (35 DT) | ParaTunisie",
    seoDescription: "Bandes de tirage musculation en Tunisie à 35 DT chez ParaTunisie. Grip renforcé pour tous les exercices de dos. Livraison express tunisie.",
    seoKeywords: ["bandes tirage tunisie", "sangles tirage musculation tunisie", "grip musculation tunisie"],
    seoFaq: [
      { question: "Quelle est la différence entre lifting straps et bandes de tirage ?", answer: "Les lifting straps s'enroulent autour de la barre pour le soulevé de terre, tandis que les bandes de tirage offrent un grip général pour tous les exercices de tirage." }
    ],
    stock: 45,
  },
  {
    slug: "gants-de-musculation",
    name: "Gants de Musculation Sport",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 49000,
    image: "/uploads/products/gants-de-musculation.webp",
    benefit: "Protection des paumes contre les callosités, grip amélioré, ventilation et soutien du poignet.",
    description: "Les gants de musculation Sport offrent une protection optimale des paumes et des doigts lors de vos séances d'entraînement. Leur construction en cuir synthétique respirant et lycra garantit confort et durabilité. Idéaux pour haltères, barres, kettlebells et appareils de musculation.",
    usage: "Enfiler avant votre échauffement. Adapter la taille à votre main pour un ajustement parfait. Sécher à l'air libre après chaque utilisation.",
    seoTitle: "Gants de Musculation Tunisie (49 DT) | ParaTunisie",
    seoDescription: "Achetez vos gants de musculation en Tunisie à 49 DT chez ParaTunisie. Protection des paumes et grip optimal pour haltères et barres. Paiement à la livraison.",
    seoKeywords: ["gants musculation tunisie", "gants sport tunisie", "gants haltères tunisie", "protection mains sport"],
    seoFaq: [
      { question: "Pourquoi porter des gants de musculation ?", answer: "Les gants de musculation protègent les paumes des ampoules et callosités, améliorent le grip et réduisent la fatigue des mains lors des exercices avec charges libres." }
    ],
    stock: 35,
  },
  {
    slug: "gant-de-fitness",
    name: "Gant de Fitness Half-Finger",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 39000,
    image: "/uploads/products/gant-de-fitness.webp",
    benefit: "Design semi-ouvert pour une meilleure sensation de la barre, protection ciblée des paumes.",
    description: "Le gant de fitness half-finger allie protection et tactilité. Son design semi-ouvert vous garde en contact direct avec la barre tout en protégeant vos paumes. Fabriqué en néoprène et lycra respirant, il s'adapte parfaitement pour toutes les activités de fitness, cross-training et circuit training.",
    usage: "Idéal pour le fitness général, le cross-training, les activités en salle et l'haltérophilie légère à modérée.",
    seoTitle: "Gant Fitness Half-Finger Tunisie (39 DT) | ParaTunisie",
    seoDescription: "Gant de fitness semi-ouvert en Tunisie à 39 DT chez ParaTunisie. Protection optimale pour vos entraînements fitness et cross-training. Livraison rapide Tunisie.",
    seoKeywords: ["gant fitness tunisie", "gant cross training tunisie", "accessoires fitness tunisie"],
    seoFaq: [
      { question: "Quelle différence entre un gant fitness et un gant musculation ?", answer: "Les gants fitness sont généralement plus légers et semi-ouverts, idéaux pour le cardio et le fitness général. Les gants musculation offrent plus de protection pour les charges lourdes." }
    ],
    stock: 35,
  },
  {
    slug: "ceinture-dos-gold-s-gym",
    name: "Ceinture Lombaire Gold's Gym",
    brand: "Gold's Gym",
    categorySlug: "accessoires",
    priceMillimes: 129000,
    image: "/uploads/products/ceinture-dos-gold-s-gym.webp",
    benefit: "Soutien lombaire professionnel pour squat, soulevé de terre et presse militaire. Standard Gold's Gym.",
    description: "La ceinture lombaire Gold's Gym est l'accessoire de référence pour les athlètes sérieux. Fabriquée en cuir véritable épais avec double couture renforcée, elle offre un soutien lombaire et abdominal exceptionnel lors de vos mouvements de force maximale. Le standard des champions depuis des décennies.",
    usage: "Placer la ceinture fermement autour de la taille (juste au-dessus des hanches). Gonfler le ventre contre la ceinture pour créer une pression intra-abdominale maximale. Utiliser pour squat, soulevé de terre, développé militaire et rowing debout.",
    seoTitle: "Ceinture Lombaire Gold's Gym Tunisie (129 DT) | ParaTunisie",
    seoDescription: "Ceinture lombaire professionnelle Gold's Gym en Tunisie à 129 DT chez ParaTunisie. Protection lombaire de qualité pro pour squat et deadlift. Paiement à la livraison.",
    seoKeywords: ["ceinture lombaire tunisie", "ceinture musculation tunisie", "ceinture gold's gym tunisie", "protection dos sport tunisie"],
    seoFaq: [
      { question: "Quelle est la meilleure ceinture pour le squat lourd ?", answer: "La ceinture Gold's Gym en cuir véritable est idéale pour le squat et soulevé de terre lourd. Choisir une largeur de 10cm pour un soutien lombaire optimal." }
    ],
    stock: 25,
  },
  {
    slug: "ceinture-dos-de-musculation",
    name: "Ceinture Lombaire de Musculation",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 89000,
    image: "/uploads/products/ceinture-dos-de-musculation.webp",
    benefit: "Maintien lombaire intermédiaire pour squat, soulevé de terre et exercices debout avec charges.",
    description: "La ceinture lombaire de musculation en néoprène et velcro offre un excellent rapport qualité-prix pour les sportifs amateurs et intermédiaires. Sa fermeture velcro ajustable garantit un maintien précis adapté à votre morphologie pour une protection optimale de la colonne vertébrale.",
    usage: "Ajuster fermement autour de la ceinture abdominale avant les exercices de force debout. Maintenir le dos droit pendant tout l'exercice.",
    seoTitle: "Ceinture Lombaire Musculation Tunisie (89 DT) | ParaTunisie",
    seoDescription: "Ceinture lombaire musculation en Tunisie à 89 DT chez ParaTunisie. Protection du dos pour squat et exercices debout. Livraison express 24-48h.",
    seoKeywords: ["ceinture dos musculation tunisie", "ceinture abdominale sport tunisie", "protection lombaire tunisie"],
    seoFaq: [
      { question: "La ceinture lombaire est-elle nécessaire pour les débutants ?", answer: "Pour les débutants, la priorité est d'apprendre la bonne technique. La ceinture devient utile à partir du moment où vous soulevez des charges significatives (plus de votre propre poids)." }
    ],
    stock: 30,
  },
  {
    slug: "shaker-universal-nutrition-700ml",
    name: "Shaker Universal Nutrition 700ml",
    brand: "Universal Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 45000,
    image: "/uploads/products/shaker-universal-nutrition-700ml.webp",
    benefit: "Capacité 700ml, boule mélangeuse inox, bouchon vissant étanche, compatible lave-vaisselle.",
    description: "Le shaker Universal Nutrition 700ml est un classique de la nutrition sportive. Sa grande capacité permet de préparer vos protéines avec plus d'eau pour une meilleure dissolution. La boule mélangeuse en acier inoxydable garantit un mélange parfaitement homogène sans grumeaux.",
    usage: "Ajouter d'abord le liquide (eau, lait) puis la poudre. Fermer hermétiquement et secouer 20-30 secondes. Nettoyer immédiatement après utilisation.",
    seoTitle: "Shaker Universal Nutrition 700ml Tunisie (45 DT) | ParaTunisie",
    seoDescription: "Shaker Universal Nutrition 700ml en Tunisie à 45 DT chez ParaTunisie. Grande capacité, boule mélangeuse inox. Livraison rapide partout en Tunisie.",
    seoKeywords: ["shaker universal nutrition tunisie", "shaker proteine 700ml tunisie", "shaker grande capacite tunisie"],
    seoFaq: [
      { question: "Le shaker Universal Nutrition est-il compatible lave-vaisselle ?", answer: "Oui, le shaker Universal Nutrition est compatible avec le lave-vaisselle (bac supérieur recommandé). Nettoyage possible à la main avec du liquide vaisselle chaud." }
    ],
    stock: 40,
  },
  {
    slug: "bouteille-d-eau-1-8-litres",
    name: "Bouteille d'Eau 1.8 Litres Sport",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 35000,
    image: "/uploads/products/bouteille-d-eau-1-8-litres.webp",
    benefit: "Capacité optimale 1.8L pour l'hydratation sportive, Tritan sans BPA, bec verseur pratique.",
    description: "La bouteille sport 1.8 litres est la taille parfaite pour couvrir vos besoins en hydratation lors d'une séance d'entraînement. En Tritan de qualité alimentaire certifié sans BPA, elle est résistante aux chocs et aux odeurs. Son bec verseur pratique permet de boire sans retirer le bouchon.",
    usage: "Idéale pour la salle de musculation, le running, le cyclisme et toutes les activités sportives intenses nécessitant une bonne hydratation.",
    seoTitle: "Bouteille Sport 1.8L Tunisie (35 DT) | ParaTunisie",
    seoDescription: "Bouteille d'eau sport 1.8 litres en Tunisie à 35 DT chez ParaTunisie. Sans BPA, résistante aux chocs. Livraison 24-48h partout en Tunisie.",
    seoKeywords: ["bouteille eau sport tunisie", "gourde fitness tunisie", "bouteille hydratation sport tunisie"],
    seoFaq: [],
    stock: 45,
  },
  {
    slug: "gut-blaster-ab-slings",
    name: "Gut Blaster Ab Slings",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 59000,
    image: "/uploads/products/gut-blaster-ab-slings.webp",
    benefit: "Permet des relevés de jambes suspendus en pleine amplitude pour des abdominaux en profondeur.",
    description: "Les Gut Blaster Ab Slings sont des sangles à passer sur les barres parallèles ou barre de traction pour réaliser des relevés de jambes et de bassin en amplitude totale. Accessoire indispensable pour des abdominaux complets et l'amélioration de la force du core.",
    usage: "Passer les avant-bras dans les sangles, se suspendre à la barre. Lever les jambes tendues ou fléchies en contractant les abdominaux. Abaisser lentement pour un maximum d'efficacité.",
    seoTitle: "Ab Slings Relevé de Jambes Tunisie (59 DT) | ParaTunisie",
    seoDescription: "Ab Slings Gut Blaster pour exercices abdominaux en Tunisie à 59 DT chez ParaTunisie. Relevé de jambes en amplitude totale. Livraison express tunisie.",
    seoKeywords: ["ab slings tunisie", "sangles abdominaux tunisie", "gut blaster tunisie", "accessoires abdominaux musculation"],
    seoFaq: [
      { question: "Comment utiliser les Ab Slings ?", answer: "Passer les avant-bras dans les sangles, se suspendre à une barre fixe ou à l'appareil prévu à cet effet, puis lever les jambes tendues ou fléchies pour travailler les abdominaux inférieurs." }
    ],
    stock: 20,
  },
  {
    slug: "dip-belt",
    name: "Dip Belt Ceinture de Lestage",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 79000,
    image: "/uploads/products/dip-belt.webp",
    benefit: "Permet d'ajouter des charges supplémentaires aux tractions et dips pour une progression maximale.",
    description: "La ceinture de lestage Dip Belt est l'outil indispensable pour les athlètes avancés souhaitant progresser au-delà de leur poids de corps sur les tractions et les dips. La chaîne en acier inoxydable est compatible avec tous les disques standards et olympiques.",
    usage: "Passer la ceinture autour des hanches, accrocher les disques choisis via la chaîne métallique. Effectuer vos séries de tractions ou dips lestés.",
    seoTitle: "Dip Belt Ceinture Lestage Tunisie (79 DT) | ParaTunisie",
    seoDescription: "Ceinture de lestage Dip Belt en Tunisie à 79 DT chez ParaTunisie. Tractions et dips lestés pour progression maximale. Paiement à la livraison.",
    seoKeywords: ["dip belt tunisie", "ceinture lestage tunisie", "ceinture tractions lestées tunisie", "accessoires musculation avancé"],
    seoFaq: [
      { question: "Le Dip Belt est-il compatible avec tous les disques ?", answer: "Oui, le Dip Belt avec chaîne métallique est compatible avec les disques standards (25mm) et olympiques (50mm). Ajouter jusqu'à plusieurs dizaines de kg selon votre niveau." }
    ],
    stock: 20,
  },
  {
    slug: "shaker-kong-700ml",
    name: "Shaker Kong Sport Nutrition 700ml",
    brand: "Kong Sport Nutrition",
    categorySlug: "accessoires",
    priceMillimes: 39000,
    image: "/uploads/products/shaker-kong-700ml.webp",
    benefit: "Logo Kong emblématique, capacité 700ml, boule mélangeuse performante, bouchon 100% étanche.",
    description: "Le shaker Kong Sport Nutrition 700ml est le shaker de référence des sportifs tunisiens. Conçu pour une utilisation intensive, il est doté d'une boule mélangeuse en acier inoxydable garantissant un mélange parfait de vos protéines, BCAA et gainers. La fermeture à bouchon à vis est 100% étanche.",
    usage: "Ajouter votre liquide en premier, puis votre dose de complément en poudre. Fermer et secouer vigoureusement. Nettoyer à l'eau chaude après chaque utilisation.",
    seoTitle: "Shaker Kong 700ml Tunisie (39 DT) | ParaTunisie",
    seoDescription: "Shaker Kong Sport Nutrition 700ml en Tunisie à 39 DT chez ParaTunisie. Boule mélangeuse inox, bouchon étanche 100%. Livraison express tunisie.",
    seoKeywords: ["shaker kong tunisie", "shaker 700ml tunisie", "shaker sport tunisie", "shaker proteine pas cher tunisie"],
    seoFaq: [
      { question: "Le shaker Kong 700ml est-il sans BPA ?", answer: "Oui, le shaker Kong est fabriqué en plastique de qualité alimentaire certifié sans BPA. Il est sécurisé pour votre consommation quotidienne." }
    ],
    stock: 50,
  },
];

async function seedAccessoires() {
  console.log("=== SEEDING ACCESSOIRES CATEGORY & PRODUCTS ===");

  // 1. Upsert brands
  const brandMap = new Map<string, string>();
  const brandsToCreate = [
    { name: "Kong Sport Nutrition", slug: "kong-sport-nutrition", tagline: "Accessories & Equipment", origin: "Tunisie" },
    { name: "Sport Life", slug: "sport-life", tagline: "Sport Life Accessories", origin: "International" },
    { name: "Gold's Gym", slug: "golds-gym", tagline: "The Mecca of Bodybuilding", origin: "USA" },
    { name: "Universal Nutrition", slug: "universal-nutrition", tagline: "The Supplement Authority", origin: "USA" },
  ];

  for (const b of brandsToCreate) {
    const record = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, tagline: b.tagline, status: "ACTIVE" },
      create: {
        name: b.name,
        slug: b.slug,
        tagline: b.tagline,
        description: `${b.name} — accessoires et équipement de musculation et fitness.`,
        origin: b.origin,
        status: "ACTIVE",
        featured: false,
        seoTitle: `${b.name} en Tunisie | ParaTunisie`,
        seoDescription: `Découvrez les produits ${b.name} disponibles en Tunisie chez ParaTunisie.`,
      },
    });
    brandMap.set(b.name.toLowerCase(), record.id);
    console.log(`[Brand] ${b.name} -> ${record.id}`);
  }

  // 2. Upsert Accessoires category
  const categoryRecord = await prisma.category.upsert({
    where: { slug: "accessoires" },
    update: {
      name: "Accessoires",
      shortDescription: "Shakers, gants de musculation, ceintures lombaires et sangles de tirage.",
      description: "Notre gamme d'accessoires de musculation et fitness inclut des shakers sans BPA, gants de musculation haute résistance, ceintures lombaires professionnelles, sangles de tirage et tout l'équipement nécessaire pour optimiser vos performances à la salle.",
      seoTitle: "Accessoires Musculation & Fitness en Tunisie | Shakers, Gants, Ceintures | ParaTunisie",
      seoDescription: "Achetez vos accessoires de musculation en Tunisie sur ParaTunisie : shakers sans BPA, gants musculation, ceintures lombaires, sangles de tirage. Livraison rapide 24-48h. Paiement à la livraison.",
      position: 17,
      featured: true,
      status: "ACTIVE",
    },
    create: {
      slug: "accessoires",
      name: "Accessoires",
      shortDescription: "Shakers, gants de musculation, ceintures lombaires et sangles de tirage.",
      description: "Notre gamme d'accessoires de musculation et fitness inclut des shakers sans BPA, gants de musculation haute résistance, ceintures lombaires professionnelles, sangles de tirage et tout l'équipement nécessaire pour optimiser vos performances à la salle.",
      seoTitle: "Accessoires Musculation & Fitness en Tunisie | Shakers, Gants, Ceintures | ParaTunisie",
      seoDescription: "Achetez vos accessoires de musculation en Tunisie sur ParaTunisie : shakers sans BPA, gants musculation, ceintures lombaires, sangles de tirage. Livraison rapide 24-48h. Paiement à la livraison.",
      position: 17,
      featured: true,
      status: "ACTIVE",
    },
  });
  console.log(`[Category] Accessoires -> ${categoryRecord.id}`);

  // 3. Seed each product
  for (const acc of ACCESSOIRES_DATA) {
    const brandId =
      brandMap.get(acc.brand.toLowerCase()) ||
      (await prisma.brand.findFirst({ where: { name: { equals: acc.brand, mode: "insensitive" } } }))?.id ||
      brandMap.get("kong sport nutrition");

    if (!brandId) {
      console.error(`No brand found for: ${acc.brand}`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: acc.slug },
      update: {
        name: acc.name,
        benefit: acc.benefit,
        description: acc.description,
        usage: acc.usage,
        image: acc.image,
        brandId,
        categoryId: categoryRecord.id,
        seoTitle: acc.seoTitle,
        seoDescription: acc.seoDescription,
        seoKeywords: JSON.stringify(acc.seoKeywords),
        seoFaq: JSON.stringify(acc.seoFaq),
        publishState: ProductPublishState.PUBLISHED,
        seoScore: 92,
        skinTypes: JSON.stringify(["Tous sportifs"]),
        routineTime: JSON.stringify(["AM", "PM"]),
      },
      create: {
        slug: acc.slug,
        name: acc.name,
        benefit: acc.benefit,
        description: acc.description,
        usage: acc.usage,
        image: acc.image,
        brandId,
        categoryId: categoryRecord.id,
        seoTitle: acc.seoTitle,
        seoDescription: acc.seoDescription,
        seoKeywords: JSON.stringify(acc.seoKeywords),
        seoFaq: JSON.stringify(acc.seoFaq),
        publishState: ProductPublishState.PUBLISHED,
        seoScore: 92,
        skinTypes: JSON.stringify(["Tous sportifs"]),
        routineTime: JSON.stringify(["AM", "PM"]),
      },
    });

    // Clean and recreate variants
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        label: "Standard",
        priceMillimes: acc.priceMillimes,
        sku: `ACC-${acc.slug.substring(0, 12).toUpperCase()}`,
        stock: acc.stock,
      },
    });

    // Clean and recreate images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: acc.image,
        alt: `${acc.name} — ParaTunisie Tunisie`,
        position: 0,
      },
    });

    console.log(`[OK] ${acc.name} (${acc.priceMillimes / 1000} DT) -> ${product.id}`);
  }

  // 4. Sync Meilisearch
  console.log("\nSyncing Meilisearch...");
  try {
    const { Meilisearch } = await import("meilisearch");
    const client = new Meilisearch({
      host: process.env.MEILI_HOST || "http://127.0.0.1:7700",
      apiKey: process.env.MEILI_API_KEY || "paratunisie_dev_meili_key",
    });

    await client.createIndex("products", { primaryKey: "id" }).catch(() => {});
    const index = client.index("products");

    const allProducts = await prisma.product.findMany({
      where: { publishState: ProductPublishState.PUBLISHED },
      include: { brand: true, category: true },
    });

    const docs = allProducts.map((p) => ({
      id: p.id,
      name: p.name,
      brandName: p.brand.name,
      brandSlug: p.brand.slug,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      description: p.description ?? "",
      benefit: p.benefit ?? "",
      publishState: p.publishState,
    }));

    await index.deleteAllDocuments().catch(() => {});
    if (docs.length > 0) {
      await index.addDocuments(docs);
      console.log(`Indexed ${docs.length} products in Meilisearch.`);
    }
  } catch (err: any) {
    console.warn(`Meilisearch sync note: ${err.message}`);
  }

  console.log(`\n=== ACCESSOIRES SEEDING COMPLETED (${ACCESSOIRES_DATA.length} products) ===`);
}

seedAccessoires()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
