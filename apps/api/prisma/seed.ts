/**
 * Prisma seed script — populates the PostgreSQL database with ParaTunisie catalogue & sample orders.
 * Run with: npx prisma db seed
 */
import { PrismaClient, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ─── Brand data ────────────────────────────────────────────────────── */

const brandsData = [
  { name: "La Roche-Posay", slug: "la-roche-posay", tagline: "Dermatologique, sensible", description: "La Roche-Posay est une marque dermocosmétique de référence, formulée pour les peaux sensibles." },
  { name: "Bioderma", slug: "bioderma", tagline: "La biologie au service de la dermatologie", description: "Bioderma conçoit des soins inspirés de la biologie cutanée." },
  { name: "Avène", slug: "avene", tagline: "La force de l'eau thermale", description: "Avène développe des soins pour peaux sensibles à partir d'eau thermale." },
  { name: "CeraVe", slug: "cerave", tagline: "La science de la peau", description: "CeraVe développe des soins à base de céramides essentiels." },
  { name: "Vichy", slug: "vichy", tagline: "La force de l'eau volcanique", description: "Vichy combine l'eau thermale volcanique avec la science dermatologique." },
  { name: "Uriage", slug: "uriage", tagline: "L'eau thermale française", description: "Uriage puise dans l'eau thermale de Grenoble pour ses formules." },
  { name: "SVR", slug: "svr", tagline: "Dermatologique, engagement", description: "SVR développe des soins dermatologiques efficaces et respectueux." },
  { name: "Nuxe", slug: "nuxe", tagline: "La nature au service de la beauté", description: "Nuxe combine nature et science pour des soins sensoriels." },
  { name: "Eucerin", slug: "eucerin", tagline: "La science de la peau", description: "Eucerin développe des soins dermatologiques de confiance." },
  { name: "Ducray", slug: "ducray", tagline: "Le soin capillaire et cutané", description: "Ducray est spécialiste du soin capillaire et dermatologique." },
  { name: "Filorga", slug: "filorga", tagline: "La médecine esthétique", description: "Filorga puise dans l'esthétique médicale pour ses soins." },
];

/* ─── Category + Concern + Product data ── */

const categoryMap: Record<string, string> = {
  "Solaire": "solaire",
  "Visage": "visage",
  "Corps": "corps",
  "Cheveux": "cheveux",
};

const concernsData = [
  { name: "Protection solaire", slug: "protection-solaire" },
  { name: "Peau sensible", slug: "peau-sensible" },
  { name: "Peau sèche", slug: "peau-seche" },
  { name: "Taches & éclat", slug: "taches-eclat" },
  { name: "Premiers signes de l'âge", slug: "premiers-signes-age" },
  { name: "Imperfections", slug: "acne-imperfections" },
  { name: "Chute de cheveux", slug: "chute-cheveux" },
];

const productsData = [
  {
    slug: "anthelios-fluide-invisible", brand: "La Roche-Posay", name: "Anthelios Fluide Invisible SPF50+",
    benefit: "Protection élevée, fini invisible", description: "Un fluide solaire haute protection à la texture légère, pensé pour un usage quotidien sur le visage sans laisser de trace blanche ni d'effet gras.",
    usage: "Appliquer généreusement le matin sur le visage propre, avant l'exposition au soleil. Renouveler l'application régulièrement en cas d'exposition prolongée.",
    image: "/assets/product-tube.webp", category: "Solaire",
    skinTypes: ["Toutes peaux"], routineTime: ["AM"],
    sizes: [{ label: "50 ml", priceMillimes: 58900 }],
    concerns: ["Protection solaire"],
  },
  {
    slug: "sensibio-h2o", brand: "Bioderma", name: "Sensibio H2O",
    benefit: "Nettoie et apaise sans rinçage", description: "L'eau micellaire de référence pour les peaux sensibles : elle nettoie et démaquille visage et yeux en un geste, sans rinçage et sans sensation de tiraillement.",
    usage: "Imbiber un coton et passer délicatement sur le visage et les yeux, sans rincer.",
    image: "/assets/product-micellar.webp", category: "Visage",
    skinTypes: ["Peau sensible"], routineTime: ["AM", "PM"],
    sizes: [
      { label: "100 ml", priceMillimes: 18900 },
      { label: "250 ml", priceMillimes: 36900 },
      { label: "500 ml", priceMillimes: 58900 },
    ],
    concerns: ["Peau sensible"],
  },
  {
    slug: "creme-hydratante-visage", brand: "CeraVe", name: "Crème Hydratante Visage",
    benefit: "Hydratation et barrière cutanée", description: "Une crème hydratante quotidienne à la texture riche mais non grasse, formulée pour accompagner le confort de la peau sèche à normale.",
    usage: "Appliquer matin et/ou soir sur le visage propre et sec.",
    image: "/assets/product-jar.webp", category: "Visage",
    skinTypes: ["Peau sèche", "Peau normale"], routineTime: ["AM", "PM"],
    sizes: [
      { label: "52 ml", priceMillimes: 42500 },
      { label: "340 ml", priceMillimes: 89900 },
    ],
    concerns: ["Peau sèche", "Peau sensible"],
  },
  {
    slug: "liftactiv-vitamine-c", brand: "Vichy", name: "Liftactiv Sérum Vitamine C",
    benefit: "Éclat et premiers signes de l'âge", description: "Un sérum concentré en vitamine C, à intégrer dans une routine du matin pour accompagner l'éclat du teint.",
    usage: "Appliquer quelques gouttes le matin sur peau propre, avant la crème de jour et la protection solaire.",
    image: "/assets/product-serum.webp", category: "Visage",
    skinTypes: ["Toutes peaux"], routineTime: ["AM"],
    sizes: [{ label: "20 ml", priceMillimes: 91000 }],
    concerns: ["Taches & éclat", "Premiers signes de l'âge"],
  },
  {
    slug: "cleanance-gel", brand: "Avène", name: "Cleanance Gel Nettoyant",
    benefit: "Nettoyage doux des peaux à imperfections", description: "Un gel nettoyant moussant conçu pour les peaux à tendance grasse ou à imperfections, qui nettoie sans agresser.",
    usage: "Faire mousser sur peau humide, matin et soir, puis rincer à l'eau tiède.",
    image: "/assets/product-micellar.webp", category: "Visage",
    skinTypes: ["Peau grasse", "Peau mixte"], routineTime: ["AM", "PM"],
    sizes: [{ label: "200 ml", priceMillimes: 39500 }],
    concerns: ["Imperfections"],
  },
  {
    slug: "aquapower-gel-creme", brand: "Uriage", name: "Eau Thermale Gel-Crème",
    benefit: "Hydratation légère et fraîche", description: "Un gel-crème hydratant à la sensation fraîche, adapté à un usage quotidien sur peau normale à mixte.",
    usage: "Appliquer matin et/ou soir sur le visage nettoyé.",
    image: "/assets/product-jar.webp", category: "Visage",
    skinTypes: ["Peau normale", "Peau mixte"], routineTime: ["AM", "PM"],
    sizes: [{ label: "40 ml", priceMillimes: 48900 }],
    concerns: ["Peau sèche"],
  },
  {
    slug: "sebiaclear-serum", brand: "SVR", name: "Sebiaclear Sérum",
    benefit: "Lisse le grain de peau", description: "Un sérum ciblé pour les peaux à imperfections, à intégrer dans une routine pour affiner l'aspect du grain de peau.",
    usage: "Appliquer le soir sur peau propre, avant la crème de nuit.",
    image: "/assets/product-serum.webp", category: "Visage",
    skinTypes: ["Peau grasse", "Peau mixte"], routineTime: ["PM"],
    sizes: [{ label: "30 ml", priceMillimes: 64900 }],
    concerns: ["Imperfections", "Taches & éclat"],
  },
  {
    slug: "huile-prodigieuse", brand: "Nuxe", name: "Huile Prodigieuse",
    benefit: "Nourrit le visage, le corps et les cheveux", description: "Une huile sèche multi-usage, à utiliser sur le visage, le corps et les pointes de cheveux pour un fini nourri et non gras.",
    usage: "Appliquer sur peau sèche ou humide, en massant délicatement.",
    image: "/assets/product-serum.webp", category: "Corps",
    skinTypes: ["Toutes peaux"], routineTime: ["AM", "PM"],
    sizes: [
      { label: "50 ml", priceMillimes: 49900 },
      { label: "100 ml", priceMillimes: 79500 },
    ],
    concerns: ["Peau sèche"],
  },
  {
    slug: "dermopure-fluide", brand: "Eucerin", name: "DermoPure Fluide Matifiant",
    benefit: "Hydrate et aide à limiter la brillance", description: "Un fluide hydratant au fini matifiant, conçu pour les peaux grasses à mixtes sujettes aux imperfections.",
    usage: "Appliquer matin et/ou soir sur le visage propre.",
    image: "/assets/product-tube.webp", category: "Visage",
    skinTypes: ["Peau grasse", "Peau mixte"], routineTime: ["AM", "PM"],
    sizes: [{ label: "50 ml", priceMillimes: 55900 }],
    concerns: ["Imperfections"],
  },
  {
    slug: "anaphase-shampooing", brand: "Ducray", name: "Anaphase+ Shampooing",
    benefit: "Fortifie les cheveux fragilisés", description: "Un shampooing complément anti-chute, à utiliser en alternance avec le shampooing habituel pour accompagner une routine capillaire.",
    usage: "Faire mousser sur cheveux mouillés, laisser poser quelques instants, puis rincer.",
    image: "/assets/product-tube.webp", category: "Cheveux",
    skinTypes: ["Toutes peaux"], routineTime: ["AM", "PM"],
    sizes: [
      { label: "200 ml", priceMillimes: 46500 },
      { label: "400 ml", priceMillimes: 79900 },
    ],
    concerns: ["Chute de cheveux"],
  },
  {
    slug: "atoderm-gel-douche", brand: "Bioderma", name: "Atoderm Gel Douche",
    benefit: "Nettoie en douceur et protège du dessèchement", description: "Un gel douche surgras pour le corps, pensé pour les peaux sèches à sensibles qui ont besoin d'un nettoyage doux au quotidien.",
    usage: "Appliquer sur peau humide, faire mousser légèrement puis rincer.",
    image: "/assets/product-micellar.webp", category: "Corps",
    skinTypes: ["Peau sèche", "Peau sensible"], routineTime: ["AM", "PM"],
    sizes: [{ label: "500 ml", priceMillimes: 44900 }],
    concerns: ["Peau sèche", "Peau sensible"],
  },
  {
    slug: "cicaplast-baume-b5", brand: "La Roche-Posay", name: "Cicaplast Baume B5+",
    benefit: "Apaise et protège les zones fragilisées", description: "Un baume multi-usage à appliquer sur les zones fragilisées du visage ou du corps, pour un geste de confort au quotidien.",
    usage: "Appliquer une à plusieurs fois par jour sur la zone concernée.",
    image: "/assets/product-tube.webp", category: "Visage",
    skinTypes: ["Toutes peaux"], routineTime: ["AM", "PM"],
    sizes: [{ label: "40 ml", priceMillimes: 34900 }],
    concerns: ["Peau sensible"],
  },
];

async function main() {
  console.log("Seeding database...");

  // 1. Create brands
  const brandRecords = await Promise.all(
    brandsData.map((b) =>
      prisma.brand.upsert({
        where: { slug: b.slug },
        update: {},
        create: b,
      })
    )
  );
  const brandMap = new Map(brandRecords.map((b) => [b.name, b.id]));

  // 2. Create categories
  const uniqueCategories = [...new Set(productsData.map((p) => p.category))];
  const categoryRecords = await Promise.all(
    uniqueCategories.map((name) =>
      prisma.category.upsert({
        where: { slug: categoryMap[name] || name.toLowerCase() },
        update: {},
        create: { name, slug: categoryMap[name] || name.toLowerCase() },
      })
    )
  );
  const categoryMapById = new Map(categoryRecords.map((c) => [c.name, c.id]));

  // 3. Create concerns
  const concernRecords = await Promise.all(
    concernsData.map((c) =>
      prisma.concern.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  const concernMapByName = new Map(concernRecords.map((c) => [c.name, c.id]));

  // 4. Create products with variants
  const createdProducts: any[] = [];
  for (const p of productsData) {
    const brandId = brandMap.get(p.brand);
    const categoryId = categoryMapById.get(p.category);
    if (!brandId || !categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { image: p.image },
      create: {
        slug: p.slug,
        name: p.name,
        benefit: p.benefit,
        description: p.description,
        usage: p.usage,
        image: p.image,
        brandId,
        categoryId,
        skinTypes: JSON.stringify(p.skinTypes),
        routineTime: JSON.stringify(p.routineTime),
        variants: {
          create: p.sizes.map((s) => ({
            label: s.label,
            priceMillimes: s.priceMillimes,
            stock: 50,
          })),
        },
        concerns: {
          connect: p.concerns.map((cName) => ({ name: cName })).filter((c) => concernMapByName.has(c.name)),
        },
      },
      include: { variants: true },
    });
    createdProducts.push(product);
  }
  console.log(`  ✓ ${createdProducts.length} real products created/updated`);

  // 5. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "client@paratunisie.tn" },
    update: {},
    create: {
      email: "client@paratunisie.tn",
      name: "RAED Y",
      phone: "27578505",
      password: "password123",
      role: "CUSTOMER",
    },
  });

  const demoUser2 = await prisma.user.upsert({
    where: { email: "amira.bensalah@email.tn" },
    update: {},
    create: {
      email: "amira.bensalah@email.tn",
      name: "Amira Ben Salah",
      phone: "22765421",
      password: "password123",
      role: "CUSTOMER",
    },
  });

  const demoUser3 = await prisma.user.upsert({
    where: { email: "mohamed.karoui@email.tn" },
    update: {},
    create: {
      email: "mohamed.karoui@email.tn",
      name: "Mohamed Karoui",
      phone: "29522746",
      password: "password123",
      role: "CUSTOMER",
    },
  });

  // 5.5 Seed Articles
  const articlesSeedData = [
    {
      slug: "routine-peau-grasse-guide-complet",
      title: "Routine peau grasse : le guide complet",
      excerpt: "Comment construire une routine efficace pour une peau à tendance grasse, sans agresser la barrière cutanée.",
      category: "Visage",
      readTime: "5 min",
      date: "2026-07-15",
      authorName: "Dr. Amira Selmi",
      status: "PUBLISHED",
      publishedAt: new Date("2026-07-15T10:00:00Z"),
      seoTitle: "Routine peau grasse : le guide complet | ParaTunisie",
      metaDescription: "Comment construire une routine efficace pour une peau à tendance grasse en Tunisie.",
      indexable: true,
      content: JSON.stringify([
        { type: "paragraph", text: "La peau grasse est causée par une production excessive de sébum, souvent liée à des facteurs hormonaux et génétiques. Contrairement aux idées reçues, une peau grasse a aussi besoin d'hydratation — mais avec les bons actifs." },
        { type: "heading2", text: "1. Le nettoyage doux" },
        { type: "paragraph", text: "Le nettoyage est la première étape essentielle. Un gel moussant doux nettoie sans agresser. Évitez les nettoyants trop détergents qui stimulent encore la production de sébum." },
        { type: "heading2", text: "2. Les sérums régulateurs" },
        { type: "paragraph", text: "Après le nettoyage, un sérum à l'acide salicylique ou à la niacinamide aide à réguler la séborrhée et à resserrer les pores." },
        { type: "heading2", text: "3. L'hydratation non comédogène" },
        { type: "paragraph", text: "L'hydratation est non négociable même pour les peaux grasses. Choisissez une texture gel ou fluide, non comédogène." },
        { type: "heading2", text: "4. La protection solaire" },
        { type: "paragraph", text: "Enfin, la protection solaire est indispensable. Un écran solaire léger, non gras, protège sans laisser de film blanc ni d'effet brillant." }
      ]),
      faqs: [
        { question: "Faut-il hydrater une peau grasse ?", answer: "Oui ! Une peau grasse déshydratée produira encore plus de sébum pour se protéger." },
        { question: "Quel ingrédient privilégier ?", answer: "L'acide salicylique (BHA) et la niacinamide sont particulièrement recommandés." }
      ]
    },
    {
      slug: "protection-solaire-tunisie-guide",
      title: "Protection solaire en Tunisie : comment bien choisir",
      excerpt: "Quel SPF, quelle texture, quelle fréquence d'application ? Le guide pratique pour se protéger du soleil en Tunisie.",
      category: "Solaire",
      readTime: "4 min",
      date: "2026-06-28",
      authorName: "Dr. Amira Selmi",
      status: "PUBLISHED",
      publishedAt: new Date("2026-06-28T10:00:00Z"),
      seoTitle: "Protection solaire en Tunisie — Guide complet | ParaTunisie",
      metaDescription: "Quel SPF, quelle texture, quelle fréquence d'application ? Le guide pratique pour se protéger du soleil en Tunisie.",
      indexable: true,
      content: JSON.stringify([
        { type: "paragraph", text: "En Tunisie, l'indice UV est élevé toute l'année, même en hiver. Une protection solaire adaptée n'est pas un luxe — c'est un geste de santé essentiel." },
        { type: "heading2", text: "Quel SPF choisir ?" },
        { type: "paragraph", text: "Le SPF 50+ est recommandé pour le visage, surtout pour les peaux claires ou sensibles. Pour le corps, le SPF 30 peut suffire au quotidien." }
      ]),
      faqs: [
        { question: "À quelle fréquence réappliquer ?", answer: "Toutes les 2 heures en cas d'exposition active, ou après chaque baignade." }
      ]
    },
    {
      slug: "routine-anti-age-debut",
      title: "Quand commencer une routine anti-âge ?",
      excerpt: "Les premiers signes de l'âge apparaissent souvent dès 25-30 ans. Voici comment anticiper sans surcharger sa routine.",
      category: "Visage",
      readTime: "4 min",
      date: "2026-06-10",
      authorName: "Dr. Amira Selmi",
      status: "PUBLISHED",
      publishedAt: new Date("2026-06-10T10:00:00Z"),
      seoTitle: "Quand commencer une routine anti-âge ? | ParaTunisie",
      metaDescription: "Les premiers signes de l'âge apparaissent souvent dès 25-30 ans. Voici comment anticiper sans surcharger sa routine.",
      indexable: true,
      content: JSON.stringify([
        { type: "paragraph", text: "Il n'y a pas d'âge précis pour commencer une routine anti-âge. Le plus tôt est le mieux, pour préserver la santé de la peau sur le long terme." }
      ])
    },
    {
      slug: "peau-sensible-calmee",
      title: "Peau sensible : les gestes pour l'apaiser",
      excerpt: "Cuir chevelu qui tire, rougeurs, inconfort — voici comment apaiser une peau sensible au quotidien.",
      category: "Visage",
      readTime: "3 min",
      date: "2026-05-22",
      authorName: "Dr. Amira Selmi",
      status: "PUBLISHED",
      publishedAt: new Date("2026-05-22T10:00:00Z"),
      seoTitle: "Peau sensible : gestes pour l'apaiser | ParaTunisie",
      metaDescription: "Cuir chevelu qui tire, rougeurs, inconfort — voici comment apaiser une peau sensible au quotidien.",
      indexable: true,
      content: JSON.stringify([
        { type: "paragraph", text: "La peau sensible est une peau réactive qui répond fortement aux agressions extérieures. Elle nécessite une approche douce et ciblée." }
      ])
    },
    {
      slug: "chute-cheveux-precautions",
      title: "Chute de cheveux : les précautions à prendre",
      excerpt: "La chute de cheveux est un sujet fréquent. Voici les premiers réflexes à adopter avant de consulter.",
      category: "Cheveux",
      readTime: "4 min",
      date: "2026-05-08",
      authorName: "Dr. Amira Selmi",
      status: "PUBLISHED",
      publishedAt: new Date("2026-05-08T10:00:00Z"),
      seoTitle: "Chute de cheveux : précautions | ParaTunisie",
      metaDescription: "La chute de cheveux est un sujet fréquent. Voici les premiers réflexes à adopter.",
      indexable: true,
      content: JSON.stringify([
        { type: "paragraph", text: "Il est normal de perdre entre 50 et 100 cheveux par jour. Au-delà, on parle de chute significative qui mérite attention." }
      ])
    },
    {
      slug: "hydratation-peau-seche-hiver",
      title: "Hydrater sa peau sèche en hiver",
      excerpt: "Le froid, le vent et le chauffage assèchent la peau. Comment adapter sa routine pour garder une peau confortable.",
      category: "Corps",
      readTime: "3 min",
      date: "2026-04-18",
      authorName: "Dr. Amira Selmi",
      status: "PUBLISHED",
      publishedAt: new Date("2026-04-18T10:00:00Z"),
      seoTitle: "Hydrater sa peau sèche en hiver | ParaTunisie",
      metaDescription: "Le froid, le vent et le chauffage assèchent la peau. Conseils hydratation hiver.",
      indexable: true,
      content: JSON.stringify([
        { type: "paragraph", text: "L'hiver est la saison la plus éprouvante pour les peaux sèches. Le froid extérieur et le chauffage intérieur réduisent l'humidité de l'air." }
      ])
    }
  ];

  for (const artData of articlesSeedData) {
    const { faqs, ...data } = artData;
    const article = await prisma.article.upsert({
      where: { slug: artData.slug },
      update: data,
      create: data,
    });

    if (faqs && faqs.length > 0) {
      await prisma.articleFaq.deleteMany({ where: { articleId: article.id } });
      await prisma.articleFaq.createMany({
        data: faqs.map((f, i) => ({ articleId: article.id, question: f.question, answer: f.answer, position: i })),
      });
    }

    if (artData.slug === "routine-peau-grasse-guide-complet" && createdProducts.length >= 3) {
      await prisma.articleProduct.deleteMany({ where: { articleId: article.id } });
      await prisma.articleProduct.createMany({
        data: [
          { articleId: article.id, productId: createdProducts[1].id, rationale: "Nettoyage micellaire doux sans rincer", position: 0 },
          { articleId: article.id, productId: createdProducts[2].id, rationale: "Hydratation quotidienne aux céramides non comédogène", position: 1 },
        ],
      });
    }
  }
  console.log(`  ✓ 6 articles seeded with FAQs & product links`);

  // 6. Create Real Database Orders
  const sampleOrdersData: {
    userId: string;
    status: OrderStatus;
    totalMillimes: number;
    gouvernorat: string;
    fullAddress: string;
    deliveryNote: string;
    product: (typeof createdProducts)[number];
  }[] = [
    {
      userId: demoUser.id,
      status: OrderStatus.CONFIRMEE,
      totalMillimes: 58900,
      gouvernorat: "Bizerte",
      fullAddress: "JARJOUNA BALADIYET WED ROMEN",
      deliveryNote: "Livraison le matin SVP",
      product: createdProducts[0], // Anthelios Invisible
    },
    {
      userId: demoUser2.id,
      status: OrderStatus.EN_ATTENTE,
      totalMillimes: 36900,
      gouvernorat: "Tunis",
      fullAddress: "Avenue Habib Bourguiba, Le Kram",
      deliveryNote: "",
      product: createdProducts[1], // Sensibio H2O
    },
    {
      userId: demoUser3.id,
      status: OrderStatus.TENTATIVE_CONTACT,
      totalMillimes: 42500,
      gouvernorat: "Sfax",
      fullAddress: "Route de Teniour Km 3",
      deliveryNote: "",
      product: createdProducts[2], // CeraVe
    },
    {
      userId: demoUser.id,
      status: OrderStatus.ANNULEE,
      totalMillimes: 91000,
      gouvernorat: "Sousse",
      fullAddress: "Kantaoui Center",
      deliveryNote: "",
      product: createdProducts[3], // Vitamine C Vichy
    },
  ];

  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.order.deleteMany({});

  for (const oData of sampleOrdersData) {
    if (!oData.product || !oData.product.variants?.[0]) continue;
    const variant = oData.product.variants[0];

    await prisma.order.create({
      data: {
        userId: oData.userId,
        status: oData.status,
        totalMillimes: oData.totalMillimes,
        gouvernorat: oData.gouvernorat,
        fullAddress: oData.fullAddress,
        deliveryNote: oData.deliveryNote,
        paymentMethod: "cod",
        items: {
          create: [
            {
              productId: oData.product.id,
              productVariantId: variant.id,
              quantity: 1,
              priceMillimes: variant.priceMillimes,
            },
          ],
        },
        payment: {
          create: { method: "cod", amount: oData.totalMillimes, status: "pending" },
        },
        shipment: {
          create: { carrier: "Standard", status: "pending" },
        },
      },
    });
  }
  console.log(`  ✓ Sample database orders created successfully`);

  // 7. Staff account (local dev admin login)
  const staffPasswordHash = await bcrypt.hash(
    process.env.SEED_STAFF_PASSWORD || "ParaTunisie2026!",
    10,
  );
  await prisma.staffUser.upsert({
    where: { email: "admin@paratunisie.tn" },
    update: {},
    create: {
      email: "admin@paratunisie.tn",
      passwordHash: staffPasswordHash,
      name: "Admin ParaTunisie",
      role: "SUPER_ADMIN",
    },
  });
  console.log(`  ✓ Staff account seeded (admin@paratunisie.tn)`);

  // 8. Suppliers, purchase price history, inventory & batches
  const suppliersData = [
    { name: "Cosmetica Distribution", contactPerson: "Sami Bouazizi", phone: "71 234 567", email: "contact@cosmetica-dist.tn", address: "Zone Industrielle, Ben Arous", leadTimeDays: 7, paymentTerms: "30 jours net" },
    { name: "Pharma Import Tunisie", contactPerson: "Nadia Trabelsi", phone: "71 987 654", email: "commandes@pharma-import.tn", address: "Rue de l'Industrie, Tunis", leadTimeDays: 14, paymentTerms: "Comptant à la livraison" },
    { name: "MedBeauty Wholesale", contactPerson: "Karim Jendoubi", phone: "73 456 123", email: "sales@medbeauty.tn", address: "Zone Franche, Sfax", leadTimeDays: 10, paymentTerms: "45 jours net" },
  ];
  await prisma.batch.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.supplierProduct.deleteMany({});
  await prisma.purchasePriceHistory.deleteMany({});
  await prisma.supplier.deleteMany({});
  const supplierRecords = await Promise.all(
    suppliersData.map((s) => prisma.supplier.create({ data: s })),
  );

  const warehouse = await prisma.warehouse.upsert({
    where: { name: "Entrepôt Principal - Tunis" },
    update: {},
    create: { name: "Entrepôt Principal - Tunis", address: "Zone Industrielle, Tunis" },
  });

  let batchCounter = 1;
  const variantCurrentCostMillimes = new Map<string, number>();
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    const variant = product.variants?.[0];
    if (!variant) continue;
    const supplier = supplierRecords[i % supplierRecords.length];

    // Purchase cost proxy at ~65% of selling price (realistic parapharmacy markup).
    const currentCost = Math.round(variant.priceMillimes * 0.65);
    const olderCost = Math.round(currentCost * 0.94);
    variantCurrentCostMillimes.set(variant.id, currentCost);

    await prisma.purchasePriceHistory.create({
      data: {
        variantId: variant.id,
        supplierId: supplier.id,
        purchasePriceMillimes: olderCost,
        effectiveFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
      },
    });
    const latestPriceHistory = await prisma.purchasePriceHistory.create({
      data: {
        variantId: variant.id,
        supplierId: supplier.id,
        purchasePriceMillimes: currentCost,
        effectiveFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      },
    });

    await prisma.supplierProduct.upsert({
      where: { supplierId_variantId: { supplierId: supplier.id, variantId: variant.id } },
      update: { latestPurchasePriceMillimes: currentCost },
      create: {
        supplierId: supplier.id,
        variantId: variant.id,
        latestPurchasePriceMillimes: currentCost,
        isPrimarySupplier: true,
      },
    });

    // Stagger stock levels so the dashboard/inventory pages have real low-stock and
    // near-expiry alerts to show, not just healthy rows.
    const onHand = i % 5 === 0 ? 2 : i % 4 === 0 ? 8 : 40;
    const inventoryItem = await prisma.inventoryItem.upsert({
      where: { variantId_warehouseId: { variantId: variant.id, warehouseId: warehouse.id } },
      update: { quantityOnHand: onHand },
      create: {
        variantId: variant.id,
        warehouseId: warehouse.id,
        quantityOnHand: onHand,
        quantityReserved: 0,
        reorderThreshold: 10,
      },
    });

    const expiryDays = i % 6 === 0 ? 25 : i % 3 === 0 ? 75 : 400;
    await prisma.batch.create({
      data: {
        variantId: variant.id,
        inventoryItemId: inventoryItem.id,
        batchNumber: `LOT-${String(batchCounter++).padStart(4, "0")}`,
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * expiryDays),
        warehouseId: warehouse.id,
        quantity: onHand,
        purchasePriceHistoryId: latestPriceHistory.id,
      },
    });
  }
  console.log(`  ✓ Suppliers, purchase price history & inventory seeded`);

  // 9. Backfill cost snapshot on the seeded CONFIRMEE order's item(s), so
  // /admin/rentabilite has real numbers immediately. Dev-seed-only convenience —
  // the production backfill path is ProfitabilityService.backfillMissingCosts()
  // (POST /profitability/backfill-missing-costs), which uses the real
  // weighted-average cost service rather than this seed's cost map. Marked
  // costIsEstimated: true either way — a backfilled value is never "exact"
  // (REQUIREMENTS.md §4).
  const confirmedOrders = await prisma.order.findMany({
    where: { status: "CONFIRMEE" },
    include: { items: true },
  });
  for (const order of confirmedOrders) {
    for (const item of order.items) {
      const cost = variantCurrentCostMillimes.get(item.productVariantId);
      if (cost === undefined || item.unitCostMillimes !== null) continue;
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { unitCostMillimes: cost, costIsEstimated: true },
      });
    }
  }
  console.log(`  ✓ Backfilled cost snapshot on ${confirmedOrders.length} confirmed order(s)`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
