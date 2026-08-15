export type ArticleProductLink = {
  productId?: string;
  productName?: string;
  rationale?: string;
  product?: {
    id?: string;
    name?: string;
    slug?: string;
    image?: string;
    variants?: { id: string; label: string; priceMillimes: number }[];
  };
};

export type ArticleFaqItem = {
  id?: string;
  question: string;
  answer: string;
};

export type Article = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string | string[];
  status?: string;
  authorName?: string;
  expertReviewer?: string;
  featuredImage?: string;
  publishedAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  products?: ArticleProductLink[];
  faqs?: ArticleFaqItem[];
};

export const articles: Article[] = [
  {
    slug: "routine-peau-grasse-guide-complet",
    title: "Routine peau grasse : le guide complet",
    excerpt:
      "Comment construire une routine efficace pour une peau à tendance grasse, sans agresser la barrière cutanée.",
    category: "Visage",
    readTime: "5 min",
    date: "2026-07-15",
    content: [
      "La peau grasse est causée par une production excessive de sébum, souvent liée à des facteurs hormonaux et génétiques. Contrairement aux idées reçues, une peau grasse a aussi besoin d'hydratation — mais pas le bon type.",
      "Le nettoyage est la première étape essentielle. Un gel moussant doux, comme le Cleanance Gel d'Avène ou le DermoPure Gel d'Eucerin, nettoie sans agresser. Évitez les nettoyants trop détergents qui stimulent encore la production de sébum.",
      "Après le nettoyage, un sérum à l'acide salicylique ou à la niacinamide aide à réguler la séborrhée et à resserrer les pores. Appliquez-le sur peau humide, avant la crème hydratante.",
      "L'hydratation est non négociable même pour les peaux grasses. Choisissez une texture gel ou fluide, non comédogène. Le CeraVe Hydratant Visage ou le Vichy Aqualia Thermal Gel-Crème sont d'excellentes options.",
      "Enfin, la protection solaire est indispensable. Un écran solaire léger, non gras, comme l'Anthelios de La Roche-Posay, protège sans laisser de film blanc ni d'effet brillant.",
    ],
  },
  {
    slug: "protection-solaire-tunisie-guide",
    title: "Protection solaire en Tunisie : comment bien choisir",
    excerpt:
      "Quel SPF, quelle texture, quelle fréquence d'application ? Le guide pratique pour se protéger du soleil en Tunisie.",
    category: "Solaire",
    readTime: "4 min",
    date: "2026-06-28",
    content: [
      "En Tunisie, l'indice UV est élevé toute l'année, même en hiver. Une protection solaire adaptée n'est pas un luxe — c'est un geste de santé essentiel pour prévenir le vieillissement prématuré et les risques cutanés.",
      "Le SPF 50+ est recommandé pour le visage, surtout pour les peaux claires ou sensibles. Pour le corps, le SPF 30 peut suffire dans un usage quotidien, mais le SPF 50 reste préférable lors d'expositions prolongées.",
      "La texture compte autant que le SPF. Les peaux grasses préféreront des fluides non gras ou des crèmes gel. Les peaux sèches seront à l'aise avec des crèmes plus riches qui hydratent en même temps.",
      "L'application doit être généreuse — environ une cuillère à café pour le visage — et renouvelée toutes les 2 heures, ou immédiatement après la baignade ou la transpiration.",
      "N'oubliez pas les zones souvent négligées : les oreilles, le cou, le décolleté et le dos des mains. Ces zones vieillissent plus vite si elles ne sont pas protégées.",
    ],
  },
  {
    slug: "routine-anti-age-debut",
    title: "Quand commencer une routine anti-âge ?",
    excerpt:
      "Les premiers signes de l'âge apparaissent souvent dès 25-30 ans. Voici comment anticiper sans surcharger sa routine.",
    category: "Visage",
    readTime: "4 min",
    date: "2026-06-10",
    content: [
      "Il n'y a pas d'âge précis pour commencer une routine anti-âge. Le plus tôt est le mieux, non pas pour « lutter » contre le vieillissement, mais pour préserver la santé de la peau sur le long terme.",
      "Dès 25 ans, la production de collagène commence à ralentir. Intégrer un sérum antioxydant — vitamine C le matin, rétinol le soir — est une base solide. Le Liftactiv Vitamine C de Vichy est un bon point de départ.",
      "L'hydratation reste fondamentale. Une crème qui nourrit sans alourdir, avec des actifs comme l'acide hyaluronique ou les céramides, maintient la souplesse et la fermeté de la peau.",
      "La protection solaire est le geste anti-âge le plus efficace. Le soleil est responsable de 80 % du vieillissement visible de la peau. Un écran solaire quotidien, même par temps couvert, fait une différence mesurable à long terme.",
      "Enfin, la constance est la clé. Une routine simple mais suivie chaque jour est infiniment plus efficace qu'un protocole complexe abandonné au bout d'une semaine.",
    ],
  },
  {
    slug: "peau-sensible-calmee",
    title: "Peau sensible : les gestes pour l'apaiser",
    excerpt:
      "Cuir chevelu qui tire, rougeurs, inconfort — voici comment apaiser une peau sensible au quotidien.",
    category: "Visage",
    readTime: "3 min",
    date: "2026-05-22",
    content: [
      "La peau sensible est une peau réactive qui répond fortement aux agressions extérieures : froid, chaleur, pollution, produits inadaptés. Elle nécessite une approche douce et ciblée.",
      "Le nettoyage doit être ultra-doux. L'eau micellaire Sensibio H2O de Bioderma est un classique pour sa capacité à nettoyer sans rincer, sans tiraillement. Évitez l'eau trop chaude qui fragilise la barrière cutanée.",
      "Les soins apaisants sont essentiels. Les produits à base d'eau thermale — Avène ou La Roche-Posay — apportent un soulagement immédiat. Le Cicaplast Baume B5 de La Roche-Posay est un incontournable pour les zones irritées.",
      "Simplifiez votre routine : moins de produits, mais les bons. Un nettoyant doux, un soin apaisant, une crème hydratante et une protection solaire suffisent pour la plupart des peaux sensibles.",
      "En cas de rougeurs persistantes ou d'inconfort qui ne s'améliore pas, consultez un dermatologue — certaines affections comme la rosacée nécessitent un traitement spécifique.",
    ],
  },
  {
    slug: "chute-cheveux-precautions",
    title: "Chute de cheveux : les précautions à prendre",
    excerpt:
      "La chute de cheveux est un sujet fréquent. Voici les premiers réflexes à adopter avant de consulter.",
    category: "Cheveux",
    readTime: "4 min",
    date: "2026-05-08",
    content: [
      "Il est normal de perdre entre 50 et 100 cheveux par jour. Au-delà, on parle de chute significative qui mérite une attention particulière. Les causes sont multiples : stress, carences, déséquilibre hormonal, agressions extérieures.",
      "Le premier réflexe est de vérifier son alimentation. Les carences en fer, zinc, biotine et vitamines du groupe B sont des causes fréquentes de chute. Une alimentation équilibrée ou une supplémentation ciblée peut faire la différence.",
      "Le shampooing joue un rôle important. Un shampooing anti-chute comme l'Anaphase+ de Ducray stimule le cuir chevelu et fortifie les cheveux existants. Utilisez-le en alternance avec votre shampooing habituel.",
      "Évitez les agressions mécaniques : sèche-cheveux trop chaud, coiffage serré, brossage brutal. Séchez vos cheveux en tapotant doucement avec une serviette en microfibre.",
      "Si la chute persiste au-delà de 2-3 malgré ces précautions, consultez un dermatologue ou un trichologue pour un diagnostic précis.",
    ],
  },
  {
    slug: "hydratation-peau-seche-hiver",
    title: "Hydrater sa peau sèche en hiver",
    excerpt:
      "Le froid, le vent et le chauffage assèchent la peau. Comment adapter sa routine pour garder une peau confortable tout l'hiver.",
    category: "Corps",
    readTime: "3 min",
    date: "2026-04-18",
    content: [
      "L'hiver est la saison la plus éprouvante pour les peaux sèches. Le froid extérieur et le chauffage intérieur réduisent l'humidité de l'air, ce qui déshydrate la peau et fragilise sa barrière protectrice.",
      "Le gel douche surgras est un premier geste essentiel. L'Atoderm Gel Douche de Bioderma nettoie en douceur sans dessécher. Évitez les gels douche moussants agressifs qui retirent les lipides naturels de la peau.",
      "L'application d'un baume ou d'une crème riche immédiatement après la douche, sur peau encore humide, scelle l'hydratation. Le XeraCalm A.D Baume d'Avène ou le Bariéderm Cica-Crème d'Uriage sont d'excellents choix pour les peaux très sèches.",
      "Pour le visage, une crème plus riche que d'habitude s'impose en hiver. L'Huile Prodigieuse de Nuxe peut être ajoutée quelques gouttes à votre crème pour un confort supplémentaire.",
      "N'oubliez pas vos lèvres et vos mains — deux zones particulièrement exposées au froid. Un baume à lèvres et une crème des mains réguliers préviennent les crevasses.",
    ],
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export const articleCategories = [...new Set(articles.map((a) => a.category))].sort();
