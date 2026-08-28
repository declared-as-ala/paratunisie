import { PrismaClient, ProductPublishState } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface BrandDef {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  origin?: string;
  featured?: boolean;
}

interface CategoryDef {
  name: string;
  slug: string;
  eyebrow?: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  position: number;
  featured?: boolean;
}

export const BRANDS_DATA: BrandDef[] = [
  {
    name: "OstroVit",
    slug: "ostrovit",
    tagline: "Qualité européenne, pureté & efficacité",
    description: "OstroVit est un fabricant européen réputé de compléments alimentaires et de nutrition sportive, reconnu pour la pureté de ses formules et ses prix accessibles.",
    origin: "Pologne",
    featured: true,
  },
  {
    name: "Optimum Nutrition",
    slug: "optimum-nutrition",
    tagline: "The Gold Standard in Sports Nutrition",
    description: "Optimum Nutrition (ON) est le leader mondial incontesté de la nutrition sportive, réputé pour sa Gold Standard 100% Whey et ses standards d'excellence.",
    origin: "USA",
    featured: true,
  },
  {
    name: "BioTechUSA",
    slug: "biotechusa",
    tagline: "The Feeling of Success",
    description: "BioTechUSA propose une vaste gamme de protéines, créatines, vitamines et acides aminés répondant aux normes internationales de sécurité alimentaire les plus strictes.",
    origin: "Europe / USA",
    featured: true,
  },
  {
    name: "Real Pharm",
    slug: "real-pharm",
    tagline: "Nutrition sportive & compléments purs",
    description: "Real Pharm est une marque européenne dédiée aux sportifs exigeants, proposant des formules concentrées en principes actifs sans additifs superflus.",
    origin: "Pologne",
    featured: true,
  },
  {
    name: "Quamtrax",
    slug: "quamtrax",
    tagline: "Nutrition sportive avancée",
    description: "Quamtrax Nutrition conçoit des formules haute performance pour la musculation, la récupération et l'endurance.",
    origin: "Espagne",
    featured: true,
  },
  {
    name: "Eric Favre",
    slug: "eric-favre",
    tagline: "Laboratoire français de santé & performance",
    description: "Le laboratoire Eric Favre développe des produits innovants de nutrition sportive et de santé naturelle selon les standards pharmaceutiques français.",
    origin: "France",
    featured: true,
  },
  {
    name: "Challenger Nutrition",
    slug: "challenger-nutrition",
    tagline: "Power Your Goals",
    description: "Challenger Nutrition élabore des poudres et compléments ultra-puissants conçus pour les bodybuilders et athlètes de force.",
    origin: "USA",
    featured: true,
  },
  {
    name: "Zumub",
    slug: "zumub",
    tagline: "Healthy Living & Nutrition",
    description: "Zumub offre une large sélection de compléments de santé, vitamines, minéraux et oméga-3 au meilleur rapport qualité-prix.",
    origin: "Portugal",
    featured: true,
  },
  {
    name: "Muscle Care",
    slug: "muscle-care",
    tagline: "Professional Care for Athletes",
    description: "Muscle Care conçoit des minéraux, multivitamines et compléments pour optimiser les performances physiques et la récupération.",
    origin: "Pologne",
    featured: true,
  },
  {
    name: "WeightWorld",
    slug: "weightworld",
    tagline: "Bien-être naturel & formules végétales",
    description: "WeightWorld propose des vitamines et compléments alimentaires naturels et certifiés pour soutenir la santé globale.",
    origin: "Royaume-Uni",
    featured: true,
  },
  {
    name: "SFD Nutrition",
    slug: "sfd-nutrition",
    tagline: "Sport Nutrition & Health",
    description: "SFD Nutrition propose des formules complètes de vitamines et de minéraux pour les sportifs et les personnes actives.",
    origin: "Pologne",
    featured: true,
  },
  {
    name: "ProActive",
    slug: "proactive",
    tagline: "Pro Active Performance",
    description: "ProActive développe des protéines et compléments de récupération de haute valeur biologique pour sportifs réguliers.",
    origin: "Pologne",
    featured: true,
  },
  {
    name: "Scenit Nutrition",
    slug: "scenit-nutrition",
    tagline: "Elite Sports Formulation",
    description: "Scenit Nutrition formule des acides aminés, boosters hormonaux et pre-workouts de qualité supérieure.",
    origin: "Espagne",
    featured: true,
  },
  {
    name: "Victor Martinez",
    slug: "victor-martinez",
    tagline: "Signature Athlete Series",
    description: "Gamme exclusive développée avec l'athlète professionnel IFBB Victor Martinez pour des performances de haut niveau.",
    origin: "USA",
    featured: false,
  },
  {
    name: "Insane Labz",
    slug: "insane-labz",
    tagline: "Extreme Energy Pre-Workouts",
    description: "Insane Labz est légendaire pour ses pre-workouts ultra-puissants stimulant la concentration et l'intensité d'entraînement.",
    origin: "USA",
    featured: false,
  },
  {
    name: "Nutrex Research",
    slug: "nutrex-research",
    tagline: "Innovative Sports Supplements",
    description: "Nutrex Research est mondialement célèbre pour sa gamme de brûleurs de graisse thermogéniques Lipo-6.",
    origin: "USA",
    featured: true,
  },
  {
    name: "Xtend",
    slug: "xtend",
    tagline: "The World's #1 BCAA Brand",
    description: "Xtend est la référence mondiale absolue en acides aminés à chaîne ramifiée (BCAA) pour l'hydratation et la récupération.",
    origin: "USA",
    featured: true,
  },
  {
    name: "FA Engineered Nutrition",
    slug: "fa-engineered-nutrition",
    tagline: "Engineered For Champions",
    description: "Fitness Authority (FA) Engineered Nutrition conçoit des formules liquides et en poudre pour l'énergie, l'endurance et la minceur.",
    origin: "Pologne",
    featured: true,
  },
];

export const CATEGORIES_DATA: CategoryDef[] = [
  {
    name: "Créatine",
    slug: "creatine",
    eyebrow: "Force & Puissance",
    shortDescription: "Créatines monohydrates micronisées pures pour augmenter la force et le volume musculaire.",
    description: "Découvrez notre sélection de créatines monohydrates en poudre et gélules en Tunisie. Idéales pour optimiser vos performances, votre force explosive et accélérer votre développement musculaire.",
    seoTitle: "Créatine en Tunisie | Créatine Monohydrate Pure au Meilleur Prix | ParaTunisie",
    seoDescription: "Achetez votre créatine monohydrate en Tunisie sur ParaTunisie. Produits 100% authentiques (OstroVit, Optimum Nutrition, BioTechUSA, Real Pharm). Livraison rapide partout en Tunisie.",
    position: 1,
    featured: true,
  },
  {
    name: "Whey Protéine",
    slug: "whey-proteine",
    eyebrow: "Construction Musculaire",
    shortDescription: "Protéines de lactosérum de haute qualité pour la prise de muscle sec et la récupération.",
    description: "Sélection des meilleures whey protéines en Tunisie : concentrées, isolats et formules anaboliques pour nourrir vos fibres musculaires après l'effort.",
    seoTitle: "Whey Protéine en Tunisie | Protéines Musculation au Meilleur Prix | ParaTunisie",
    seoDescription: "Commandez votre Whey Protéine en Tunisie sur ParaTunisie. Grand choix de marques authentiques pour prise de masse sèche et récupération. Paiement à la livraison.",
    position: 2,
    featured: true,
  },
  {
    name: "Gainers",
    slug: "gainers-proteines",
    eyebrow: "Prise de Masse",
    shortDescription: "Formules riches en protéines et glucides complexes pour une prise de masse rapide et efficace.",
    description: "Nos gainers caloriques et protéinés aident les profils ectomorphes et sportifs à prendre du poids et développer leur masse musculaire.",
    seoTitle: "Gainers Prise de Masse en Tunisie | Prix & Authenticité Garantie | ParaTunisie",
    seoDescription: "Trouvez le meilleur gainer pour votre prise de masse en Tunisie sur ParaTunisie. Formules équilibrées en glucides et protéines avec livraison rapide.",
    position: 3,
    featured: true,
  },
  {
    name: "Pre-Workout",
    slug: "pre-workout",
    eyebrow: "Énergie & Focus",
    shortDescription: "Boosters d'entraînement puissants pour l'énergie, la congestion et la concentration.",
    description: "Boostez vos séances d'entraînement avec notre sélection de pre-workouts puissants contenant caféine, bêta-alanine et précurseurs d'oxyde nitrique.",
    seoTitle: "Pre-Workout & Boosters en Tunisie | Énergie & Congestion | ParaTunisie",
    seoDescription: "Achetez vos pre-workouts et boosters d'énergie en Tunisie sur ParaTunisie (Psychotic, Born Rage, Victor Martinez). Livraison express 24-72h.",
    position: 4,
    featured: true,
  },
  {
    name: "BCAA",
    slug: "bcaa",
    eyebrow: "Acides Aminés",
    shortDescription: "Acides aminés branchés (Leucine, Isoleucine, Valine) pour préserver le muscle et récupérer.",
    description: "Les BCAA sont essentiels pour stopper le catabolisme musculaire et favoriser une récupération rapide pendant et après vos séances de sport.",
    seoTitle: "BCAA en Tunisie | Acides Aminés Récupération Musculaire | ParaTunisie",
    seoDescription: "Commandez vos BCAA en poudre et comprimés en Tunisie sur ParaTunisie. Marques reconnues (Xtend, Real Pharm). Produits 100% originaux.",
    position: 5,
    featured: true,
  },
  {
    name: "EAA",
    slug: "eaa",
    eyebrow: "Acides Aminés Essentiels",
    shortDescription: "Le profil complet des 9 acides aminés essentiels pour la synthèse des protéines.",
    description: "Les acides aminés essentiels (EAA) soutiennent la synthèse musculaire maximale et l'hydratation cellulaire durant l'effort.",
    seoTitle: "EAA en Tunisie | Acides Aminés Essentiels Musculation | ParaTunisie",
    seoDescription: "Achetez vos EAA Master Amino en Tunisie sur ParaTunisie. Profil complet d'acides aminés essentiels pour sportifs. Paiement à la livraison.",
    position: 6,
    featured: false,
  },
  {
    name: "Beta-Alanine",
    slug: "beta-alanine",
    eyebrow: "Endurance & Puissance",
    shortDescription: "Acide aminé précurseur de la carnosine pour repousser la fatigue musculaire.",
    description: "La bêta-alanine permet de retarder l'apparition de l'acide lactique et d'améliorer l'endurance musculaire lors d'efforts intenses.",
    seoTitle: "Beta-Alanine en Tunisie | Endurance & Performance Musculaire | ParaTunisie",
    seoDescription: "Beta-Alanine pure en Tunisie sur ParaTunisie. Optimisez votre endurance et réduisez la sensation de brûlure musculaire. Livraison rapide.",
    position: 7,
    featured: false,
  },
  {
    name: "Citrulline",
    slug: "citrulline",
    eyebrow: "Vasodilatation & Congestion",
    shortDescription: "Précurseur d'oxyde nitrique pour une vascularité et une congestion exceptionnelles.",
    description: "La citrulline et l'arginine améliorent le flux sanguin, l'oxygénation des muscles et la congestion lors des séances d'entraînement.",
    seoTitle: "Citrulline & CitruArgin en Tunisie | Congestion & Vascularité | ParaTunisie",
    seoDescription: "Commandez de la citrulline pure et formules de congestion en Tunisie sur ParaTunisie. Améliorez votre flux sanguin à l'entraînement.",
    position: 8,
    featured: false,
  },
  {
    name: "Vitamines",
    slug: "vitamines",
    eyebrow: "Vitalité & Immunité",
    shortDescription: "Vitamines C, D3+K2 et complexes multivitaminés complets pour la vitalité quotidienne.",
    description: "Découvrez notre gamme de vitamines essentielles pour renforcer votre système immunitaire, combattre la fatigue et soutenir votre métabolisme.",
    seoTitle: "Vitamines en Tunisie | Vitamine C, D3 K2, Multivitamines | ParaTunisie",
    seoDescription: "Achetez vos vitamines en Tunisie sur ParaTunisie : Vitamine C, D3+K2, Multivitamines sport et One-A-Day. Produits certifiés, livraison à domicile.",
    position: 9,
    featured: true,
  },
  {
    name: "Zinc",
    slug: "zinc",
    eyebrow: "Minéraux Essentiels",
    shortDescription: "Soutien immunitaire, équilibre hormonal et santé de la peau et des ongles.",
    description: "Le zinc est un oligo-élément capital participant à plus de 300 réactions enzymatiques, au maintien du taux de testostérone et à l'immunité.",
    seoTitle: "Zinc en Tunisie | Complément Alimentaire Zinc au Meilleur Prix | ParaTunisie",
    seoDescription: "Zinc en comprimés et gélules en Tunisie sur ParaTunisie (Zumub, BioTechUSA, Real Pharm). Soutien immunitaire et vitalité garanti.",
    position: 10,
    featured: true,
  },
  {
    name: "Magnésium",
    slug: "magnesium",
    eyebrow: "Équilibre Nerveux & Musculaire",
    shortDescription: "Magnésium avec Vitamine B6 pour réduire le stress, les crampes et la fatigue.",
    description: "Indispensable pour la contraction musculaire et la relaxation du système nerveux, le magnésium combat la fatigue et le surmenage.",
    seoTitle: "Magnésium en Tunisie | Magnésium Vitamine B6 au Meilleur Prix | ParaTunisie",
    seoDescription: "Achetez votre magnésium avec vitamine B6 en Tunisie sur ParaTunisie. Réduisez la fatigue et les crampes musculaires. Livraison rapide.",
    position: 11,
    featured: true,
  },
  {
    name: "Omega 3",
    slug: "omega-3",
    eyebrow: "Acides Gras Essentiels",
    shortDescription: "Huiles de poisson hautement concentrées en EPA & DHA pour le cœur et les articulations.",
    description: "Les oméga-3 favorisent la santé cardiovasculaire, réduisent les inflammations articulaires et soutiennent les fonctions cérébrales.",
    seoTitle: "Omega 3 en Tunisie | Huile de Poisson Pure EPA DHA | ParaTunisie",
    seoDescription: "Omega 3 en capsules en Tunisie sur ParaTunisie (Zumub, BioTechUSA). Acides gras essentiels de haute pureté pour votre santé.",
    position: 12,
    featured: true,
  },
  {
    name: "Ashwagandha",
    slug: "ashwagandha",
    eyebrow: "Plante Adaptogène",
    shortDescription: "Extrait naturel pour réguler le cortisol, réduire le stress et booster la vitalité.",
    description: "L'ashwagandha est une plante adaptogène ancestrale qui aide l'organisme à résister au stress physique et mental et améliore la qualité du sommeil.",
    seoTitle: "Ashwagandha en Tunisie | Extrait Pur Anti-Stress & Vitalité | ParaTunisie",
    seoDescription: "Commandez votre Ashwagandha en gélules en Tunisie sur ParaTunisie. Plante adaptogène naturelle pour le stress, l'énergie et la récupération.",
    position: 13,
    featured: true,
  },
  {
    name: "Boosters",
    slug: "boosters-hormonaux",
    eyebrow: "Vitalité & Tonus",
    shortDescription: "Formules avancées à base de plantes et minéraux pour stimuler le tonus masculin.",
    description: "Nos boosters soutiennent la production naturelle de testostérone, la vigueur et les performances physiques des athlètes.",
    seoTitle: "Testo Booster en Tunisie | Stimulant de Vitalité Masculine | ParaTunisie",
    seoDescription: "Achetez votre Testo Booster en Tunisie sur ParaTunisie (T-9 Testo Booster). Formules puissantes pour le tonus et la vitalité.",
    position: 14,
    featured: false,
  },
  {
    name: "L-Carnitine",
    slug: "l-carnitine",
    eyebrow: "Énergie & Définition",
    shortDescription: "Transporteur d'acides gras vers les cellules pour la production d'énergie à l'effort.",
    description: "La L-Carnitine aide à mobiliser les graisses stockées pour les convertir en énergie disponible pendant vos entraînements cardio et fitness.",
    seoTitle: "L-Carnitine en Tunisie | Liquide & Gélules Minceur & Énergie | ParaTunisie",
    seoDescription: "L-Carnitine liquide 3000 et gélules 1250 en Tunisie sur ParaTunisie (OstroVit, FA Nutrition). Déstockage des graisses et énergie.",
    position: 15,
    featured: true,
  },
  {
    name: "Brûleurs de Graisse",
    slug: "bruleurs-de-graisse",
    eyebrow: "Sèche & Métabolisme",
    shortDescription: "Formules thermogéniques concentrées pour accélérer la combustion des calories.",
    description: "Nos brûleurs de graisse vous accompagnent dans vos périodes de sèche et de perte de poids en stimulant votre métabolisme de base.",
    seoTitle: "Brûleurs de Graisse en Tunisie | Lipo-6 Black Ultra Concentrate | ParaTunisie",
    seoDescription: "Commandez votre brûleur de graisse Lipo-6 Black en Tunisie sur ParaTunisie. Formule thermogénique concentrée pour une sèche optimale.",
    position: 16,
    featured: true,
  },
];

async function main() {
  console.log("=== SEEDING REORGANIZED SPORTS NUTRITION & WELLNESS CATALOG ===");

  // 1. Seed Brands
  console.log(`Seeding ${BRANDS_DATA.length} canonical brands...`);
  const brandMap = new Map<string, string>();
  for (const b of BRANDS_DATA) {
    const record = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        tagline: b.tagline,
        description: b.description,
        origin: b.origin,
        featured: b.featured ?? false,
        status: "ACTIVE",
        seoTitle: `${b.name} en Tunisie | Produits Authentiques | ParaTunisie`,
        seoDescription: `Achetez les produits ${b.name} en Tunisie sur ParaTunisie. Large sélection authentique avec livraison rapide partout en Tunisie.`,
      },
      create: {
        name: b.name,
        slug: b.slug,
        tagline: b.tagline,
        description: b.description,
        origin: b.origin,
        featured: b.featured ?? false,
        status: "ACTIVE",
        seoTitle: `${b.name} en Tunisie | Produits Authentiques | ParaTunisie`,
        seoDescription: `Achetez les produits ${b.name} en Tunisie sur ParaTunisie. Large sélection authentique avec livraison rapide partout en Tunisie.`,
      },
    });
    brandMap.set(b.name.toLowerCase(), record.id);
  }

  // 2. Seed Categories
  console.log(`Seeding ${CATEGORIES_DATA.length} categories...`);
  const categoryMap = new Map<string, string>();
  for (const c of CATEGORIES_DATA) {
    const record = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        shortDescription: c.shortDescription,
        description: c.description,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        position: c.position,
        featured: c.featured ?? false,
        status: "ACTIVE",
      },
      create: {
        name: c.name,
        slug: c.slug,
        shortDescription: c.shortDescription,
        description: c.description,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        position: c.position,
        featured: c.featured ?? false,
        status: "ACTIVE",
      },
    });
    categoryMap.set(c.slug, record.id);
    categoryMap.set(c.name.toLowerCase(), record.id);
  }

  // 3. Load Scraped Catalog
  const scrapedPath = path.join(__dirname, "..", "scraper", "scraped_protein_catalog.json");
  if (!fs.existsSync(scrapedPath)) {
    throw new Error(`Scraped dataset not found at ${scrapedPath}`);
  }
  const scrapedData = JSON.parse(fs.readFileSync(scrapedPath, "utf8"));
  console.log(`Loaded ${scrapedData.length} scraped products from JSON.`);

  // 4. Clean up existing products (safe replacement)
  // Delete variants, images, and products not in the new set
  console.log("Safely preparing database for catalog replacement...");

  const newSlugs = new Set<string>();

  for (const p of scrapedData) {
    // Brand ID resolution
    let brandId = brandMap.get(p.brand.toLowerCase());
    if (!brandId) {
      const existing = await prisma.brand.findFirst({
        where: { name: { equals: p.brand, mode: "insensitive" } },
      });
      if (existing) {
        brandId = existing.id;
        brandMap.set(p.brand.toLowerCase(), brandId);
      } else {
        const brandSlug = p.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const createdBrand = await prisma.brand.upsert({
          where: { slug: brandSlug },
          update: { name: p.brand, status: "ACTIVE" },
          create: {
            name: p.brand,
            slug: brandSlug,
            status: "ACTIVE",
          },
        });
        brandId = createdBrand.id;
        brandMap.set(p.brand.toLowerCase(), brandId);
      }
    }

    // Category ID resolution
    let categoryId = categoryMap.get(p.categorySlug) || categoryMap.get(p.category.toLowerCase());
    if (!categoryId) {
      categoryId = categoryMap.get("creatine") || Array.from(categoryMap.values())[0];
    }

    // Cleaned Title & Slug
    let cleanTitle = p.normalizedTitle
      .replace(/–\s*Prix\s*Tunisie.*$/i, "")
      .replace(/-\s*Prix\s*Tunisie.*$/i, "")
      .replace(/\|\s*Protein\.tn.*$/i, "")
      .replace(/\s+/g, " ")
      .trim();

    // Specific cleanups for polished brand titles
    if (p.slug.includes("ostrovit-500gr")) cleanTitle = "Créatine Monohydrate OstroVit 500 g";
    else if (p.slug.includes("optimum-nutrition-317g")) cleanTitle = "Micronised Creatine Optimum Nutrition 317 g";
    else if (p.slug.includes("500g-quamtrax")) cleanTitle = "Créatine Monohydrate Quamtrax 500 g";
    else if (p.slug.includes("real-pharm-300g")) cleanTitle = "Créatine Real Pharm 300 g";
    else if (p.slug.includes("500gr-real-pharm")) cleanTitle = "Créatine Monohydrate Real Pharm 500 g";
    else if (p.slug.includes("300g-biotech-usa")) cleanTitle = "100% Creatine Monohydrate BioTechUSA 300 g";
    else if (p.slug.includes("victor-martinez")) cleanTitle = "Break-Out Pre-Workout Victor Martinez";
    else if (p.slug.includes("born-rage")) cleanTitle = "Pre-Workout Born Rage Eric Favre";
    else if (p.slug.includes("pump-extreme")) cleanTitle = "Pump Extreme Pre-Workout Challenger Nutrition";
    else if (p.slug.includes("psychotic")) cleanTitle = "Psychotic Pre-Workout Insane Labz";
    else if (p.slug.includes("zinc-100-comprimes")) cleanTitle = "Zinc 100 Comprimés Zumub";
    else if (p.slug.includes("zinc-duo")) cleanTitle = "Zinc Duo BioTechUSA 60 Gélules";
    else if (p.slug.includes("zinc-90-tab")) cleanTitle = "Zinc 90 Comprimés Real Pharm";
    else if (p.slug.includes("zumub-omega-3")) cleanTitle = "Omega 3 90 Gélules Zumub";
    else if (p.slug.includes("mega-omega-3")) cleanTitle = "Mega Omega 3 BioTechUSA 90 Gélules";
    else if (p.slug.includes("magnesium-vitamin-b6-90-tablets")) cleanTitle = "Magnésium + Vitamine B6 90 Comprimés";
    else if (p.slug.includes("magnesiumcalcium-vitamin-b6")) cleanTitle = "Magnésium Calcium + Vitamine B6 Muscle Care 90 Comprimés";
    else if (p.slug.includes("vitamin-c-110-tabs")) cleanTitle = "Vitamine C 1000 mg OstroVit 110 Comprimés";
    else if (p.slug.includes("pro-vitamin-90")) cleanTitle = "Pro Vitamin Multivitamines Muscle Care 90 Comprimés";
    else if (p.slug.includes("vegan-vitamin-d3-k2")) cleanTitle = "Vitamine D3 + K2 Vegan WeightWorld 365 Comprimés";
    else if (p.slug.includes("vitamin-complex-sport")) cleanTitle = "Vitamin Complex Sport+ SFD Nutrition 120 Comprimés";
    else if (p.slug.includes("vitamin-d3-k2-90-tabs")) cleanTitle = "Vitamine D3 + K2 Real Pharm 90 Comprimés";
    else if (p.slug.includes("one-a-day")) cleanTitle = "One-A-Day Multivitamines BioTechUSA 100 Comprimés";
    else if (p.slug.includes("opti-men")) cleanTitle = "Opti-Men Multivitamines Optimum Nutrition 90 Comprimés";
    else if (p.slug.includes("ashwagandha-60-gelules")) cleanTitle = "Ashwagandha BioTechUSA 60 Gélules";
    else if (p.slug.includes("ashwagandha-100-natural")) cleanTitle = "Ashwagandha 100% Natural Real Pharm 90 Comprimés";
    else if (p.slug.includes("t-9-testo-booster")) cleanTitle = "T-9 Testo Booster Scenit Nutrition 120 Gélules";
    else if (p.slug.includes("anabolic-whey-80")) cleanTitle = "Anabolic Whey 80 ProActive 2.25 kg";
    else if (p.slug.includes("thunder-gainer")) cleanTitle = "Thunder Gainer Challenger Nutrition 5.4 kg";
    else if (p.slug.includes("beta-alanine-300g")) cleanTitle = "Beta-Alanine Real Pharm 300 g";
    else if (p.slug.includes("xtend-bcaa")) cleanTitle = "Xtend BCAA 420 g";
    else if (p.slug.includes("citruargin")) cleanTitle = "CitruArgin Citrulline & Arginine Real Pharm 300 g";
    else if (p.slug.includes("eaa-master-amino")) cleanTitle = "EAA Master Amino Scenit Nutrition 390 g";
    else if (p.slug.includes("gold-l-carnitine")) cleanTitle = "Gold L-Carnitine 3000 FA Nutrition 500 ml";
    else if (p.slug.includes("l-carnitina-1250")) cleanTitle = "L-Carnitine 1250 OstroVit 60 Gélules";
    else if (p.slug.includes("lipo-6-black")) cleanTitle = "Lipo-6 Black Ultra Concentrate Nutrex Research 60 Gélules";

    const productSlug = p.slug;
    newSlugs.add(productSlug);

    const priceMillimes = p.priceMillimes || 99000;
    const formatSize = p.formatSize || "Standard";

    // Routine timing based on category
    let routineTime = JSON.stringify(["AM"]);
    if (p.category === "Pre-Workout" || p.category === "Créatine" || p.category === "Whey Protéine" || p.category === "BCAA" || p.category === "EAA") {
      routineTime = JSON.stringify(["AM", "PM"]);
    }

    // Product Upsert
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: cleanTitle,
        benefit: p.benefit,
        description: p.description,
        usage: p.usage,
        image: p.mainImage,
        brandId,
        categoryId,
        skinTypes: JSON.stringify(["Tous sportifs"]),
        routineTime,
        seoTitle: `${cleanTitle} en Tunisie | ParaTunisie`,
        seoDescription: `Achetez ${cleanTitle} au meilleur prix en Tunisie (${(priceMillimes / 1000).toFixed(0)} DT). Produit 100% authentique avec livraison rapide partout en Tunisie.`,
        seoKeywords: JSON.stringify(p.seoKeywords || []),
        seoFaq: JSON.stringify(p.faq || []),
        publishState: ProductPublishState.PUBLISHED,
        seoScore: 95,
      },
      create: {
        slug: productSlug,
        name: cleanTitle,
        benefit: p.benefit,
        description: p.description,
        usage: p.usage,
        image: p.mainImage,
        brandId,
        categoryId,
        skinTypes: JSON.stringify(["Tous sportifs"]),
        routineTime,
        seoTitle: `${cleanTitle} en Tunisie | ParaTunisie`,
        seoDescription: `Achetez ${cleanTitle} au meilleur prix en Tunisie (${(priceMillimes / 1000).toFixed(0)} DT). Produit 100% authentique avec livraison rapide partout en Tunisie.`,
        seoKeywords: JSON.stringify(p.seoKeywords || []),
        seoFaq: JSON.stringify(p.faq || []),
        publishState: ProductPublishState.PUBLISHED,
        seoScore: 95,
      },
    });

    // Delete existing variants for clean setup
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    // Create primary Variant
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        label: formatSize,
        priceMillimes,
        sku: p.sourceSku || `PT-${productSlug.substring(0, 10).toUpperCase()}`,
        stock: 25, // Available local stock
      },
    });

    // Delete existing images for clean setup
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    // Create ProductImages
    const imagesToSave = p.localImages && p.localImages.length > 0 ? p.localImages : [p.mainImage];
    for (let idx = 0; idx < imagesToSave.length; idx++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imagesToSave[idx],
          alt: `${cleanTitle} - Vue ${idx + 1}`,
          position: idx,
        },
      });
    }

    console.log(`[OK] Imported: ${cleanTitle} (${(priceMillimes / 1000).toFixed(3)} DT) -> Category: ${p.category}`);
  }

  // 5. Fast Batch Cleanup of obsolete old products not in the new dataset
  console.log("Cleaning up obsolete demo/old products...");
  const obsoleteWithOrders = await prisma.product.findMany({
    where: {
      slug: { notIn: Array.from(newSlugs) },
      orderItems: { some: {} },
    },
    select: { id: true },
  });

  const obsoleteWithoutOrders = await prisma.product.findMany({
    where: {
      slug: { notIn: Array.from(newSlugs) },
      orderItems: { none: {} },
    },
    select: { id: true },
  });

  const withOrderIds = obsoleteWithOrders.map((p) => p.id);
  const withoutOrderIds = obsoleteWithoutOrders.map((p) => p.id);

  if (withOrderIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: withOrderIds } },
      data: { publishState: ProductPublishState.DRAFT },
    });
  }

  if (withoutOrderIds.length > 0) {
    console.log(`Batch deleting ${withoutOrderIds.length} obsolete products...`);
    const CHUNK_SIZE = 200;
    for (let i = 0; i < withoutOrderIds.length; i += CHUNK_SIZE) {
      const chunk = withoutOrderIds.slice(i, i + CHUNK_SIZE);
      await prisma.productVariant.deleteMany({ where: { productId: { in: chunk } } });
      await prisma.productImage.deleteMany({ where: { productId: { in: chunk } } });
      await prisma.wishlistItem.deleteMany({ where: { productId: { in: chunk } } }).catch(() => {});
      await prisma.review.deleteMany({ where: { productId: { in: chunk } } }).catch(() => {});
      await prisma.routineItem.deleteMany({ where: { productId: { in: chunk } } }).catch(() => {});
      await prisma.importedProduct.deleteMany({ where: { productId: { in: chunk } } }).catch(() => {});
      await prisma.competitorPrice.deleteMany({ where: { productId: { in: chunk } } }).catch(() => {});
      await prisma.articleProduct.deleteMany({ where: { productId: { in: chunk } } }).catch(() => {});
      await prisma.product.deleteMany({ where: { id: { in: chunk } } });
      console.log(`Deleted chunk ${Math.min(i + CHUNK_SIZE, withoutOrderIds.length)} / ${withoutOrderIds.length}`);
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  // 6. Clean up obsolete categories with 0 products
  const obsoleteCategories = await prisma.category.findMany({
    where: {
      slug: { notIn: CATEGORIES_DATA.map((c) => c.slug) },
      products: { none: {} },
      children: { none: {} },
    },
    select: { id: true },
  });
  if (obsoleteCategories.length > 0) {
    const catIds = obsoleteCategories.map((c) => c.id);
    await prisma.categoryMapping.deleteMany({ where: { targetCategoryId: { in: catIds } } }).catch(() => {});
    await prisma.category.deleteMany({ where: { id: { in: catIds } } });
    console.log(`Cleaned up ${obsoleteCategories.length} obsolete categories.`);
  }

  console.log(`Obsolete cleanup completed: ${withoutOrderIds.length} deleted, ${withOrderIds.length} archived.`);

  // 7. Meilisearch Index Synchronization
  console.log("Syncing Meilisearch product index...");
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Meilisearch } = require("meilisearch");
    const client = new Meilisearch({
      host: process.env.MEILI_HOST || "http://127.0.0.1:7700",
      apiKey: process.env.MEILI_API_KEY || "paratunisie_dev_meili_key",
    });

    await client.createIndex("products", { primaryKey: "id" }).catch(() => {});
    const index = client.index("products");
    await index.deleteAllDocuments().catch(() => {});

    const activeProducts = await prisma.product.findMany({
      where: { publishState: ProductPublishState.PUBLISHED },
      include: { brand: true, category: true },
    });

    const docs = activeProducts.map((p) => ({
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

    if (docs.length > 0) {
      await index.addDocuments(docs);
      console.log(`Indexed ${docs.length} products in Meilisearch.`);
    }
  } catch (err: any) {
    console.warn(`Meilisearch sync note: ${err.message}`);
  }

  console.log(`=== CATALOG SEEDING & SYNC COMPLETED SUCCESSFULLY (${newSlugs.size} active products) ===`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
