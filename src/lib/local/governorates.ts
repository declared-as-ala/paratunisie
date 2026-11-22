/**
 * Single source of truth for the 24 governorate landing pages (/parapharmacie/<slug> and /proteine/<slug>).
 * Only verifiable geography lives here (official governorate names, well-known towns). No phone numbers, addresses,
 * branches or opening hours: ParaTunisie is an online store and does not claim a physical presence in any governorate.
 */

export type RegionGroup = "Grand Tunis" | "Nord-Est" | "Nord-Ouest" | "Centre-Est" | "Centre-Ouest" | "Sud-Est" | "Sud-Ouest";
export type Cluster = "parapharmacie" | "proteine";

export type Governorate = {
  slug: string;
  name: string;
  /** Preposition + name for French sentences ("à Sousse", "au Kef"). */
  in: string;
  region: RegionGroup;
  /** Well-known towns of the governorate (factual). */
  towns: string[];
};

export const GOVERNORATES: Governorate[] = [
  { slug: "tunis", name: "Tunis", in: "à Tunis", region: "Grand Tunis", towns: ["Tunis", "La Marsa", "Carthage", "Le Bardo", "La Goulette", "Le Kram"] },
  { slug: "ariana", name: "Ariana", in: "à l'Ariana", region: "Grand Tunis", towns: ["Ariana", "La Soukra", "Raoued", "Ettadhamen", "Sidi Thabet"] },
  { slug: "ben-arous", name: "Ben Arous", in: "à Ben Arous", region: "Grand Tunis", towns: ["Ben Arous", "Radès", "Hammam Lif", "Mégrine", "El Mourouj", "Ezzahra", "Fouchana"] },
  { slug: "manouba", name: "La Manouba", in: "à la Manouba", region: "Grand Tunis", towns: ["La Manouba", "Douar Hicher", "Oued Ellil", "Mornaguia", "Tebourba"] },
  { slug: "nabeul", name: "Nabeul", in: "à Nabeul", region: "Nord-Est", towns: ["Nabeul", "Hammamet", "Kélibia", "Korba", "Grombalia", "Menzel Temime", "Soliman"] },
  { slug: "zaghouan", name: "Zaghouan", in: "à Zaghouan", region: "Nord-Est", towns: ["Zaghouan", "El Fahs", "Zriba", "Nadhour"] },
  { slug: "bizerte", name: "Bizerte", in: "à Bizerte", region: "Nord-Est", towns: ["Bizerte", "Menzel Bourguiba", "Mateur", "Ras Jebel", "Menzel Jemil", "Ghar El Melh"] },
  { slug: "beja", name: "Béja", in: "à Béja", region: "Nord-Ouest", towns: ["Béja", "Testour", "Medjez el-Bab", "Téboursouk", "Nefza"] },
  { slug: "jendouba", name: "Jendouba", in: "à Jendouba", region: "Nord-Ouest", towns: ["Jendouba", "Tabarka", "Aïn Draham", "Bou Salem", "Ghardimaou"] },
  { slug: "le-kef", name: "Le Kef", in: "au Kef", region: "Nord-Ouest", towns: ["Le Kef", "Dahmani", "Tajerouine", "Sakiet Sidi Youssef", "Nebeur"] },
  { slug: "siliana", name: "Siliana", in: "à Siliana", region: "Nord-Ouest", towns: ["Siliana", "Bou Arada", "Makthar", "Gaâfour", "Rouhia"] },
  { slug: "sousse", name: "Sousse", in: "à Sousse", region: "Centre-Est", towns: ["Sousse", "Msaken", "Hammam Sousse", "Akouda", "Kalâa Kebira", "Enfidha", "Hergla"] },
  { slug: "monastir", name: "Monastir", in: "à Monastir", region: "Centre-Est", towns: ["Monastir", "Moknine", "Ksar Hellal", "Jemmal", "Téboulba", "Sahline"] },
  { slug: "mahdia", name: "Mahdia", in: "à Mahdia", region: "Centre-Est", towns: ["Mahdia", "Ksour Essef", "El Jem", "Chebba", "Souassi"] },
  { slug: "sfax", name: "Sfax", in: "à Sfax", region: "Centre-Est", towns: ["Sfax", "Sakiet Ezzit", "Sakiet Eddaïer", "El Ain", "Agareb", "Jebiniana", "Mahrès"] },
  { slug: "kairouan", name: "Kairouan", in: "à Kairouan", region: "Centre-Ouest", towns: ["Kairouan", "Haffouz", "Oueslatia", "Sbikha", "Bou Hajla"] },
  { slug: "kasserine", name: "Kasserine", in: "à Kasserine", region: "Centre-Ouest", towns: ["Kasserine", "Sbeitla", "Fériana", "Thala", "Sbiba"] },
  { slug: "sidi-bouzid", name: "Sidi Bouzid", in: "à Sidi Bouzid", region: "Centre-Ouest", towns: ["Sidi Bouzid", "Regueb", "Meknassy", "Menzel Bouzaiane", "Jelma"] },
  { slug: "gabes", name: "Gabès", in: "à Gabès", region: "Sud-Est", towns: ["Gabès", "Mareth", "El Hamma", "Métouia", "Matmata"] },
  { slug: "medenine", name: "Médenine", in: "à Médenine", region: "Sud-Est", towns: ["Médenine", "Djerba Houmt Souk", "Djerba Midoun", "Zarzis", "Ben Gardane"] },
  { slug: "tataouine", name: "Tataouine", in: "à Tataouine", region: "Sud-Est", towns: ["Tataouine", "Ghomrassen", "Remada", "Bir Lahmar"] },
  { slug: "gafsa", name: "Gafsa", in: "à Gafsa", region: "Sud-Ouest", towns: ["Gafsa", "Métlaoui", "Redeyef", "El Guettar", "Moularès"] },
  { slug: "tozeur", name: "Tozeur", in: "à Tozeur", region: "Sud-Ouest", towns: ["Tozeur", "Nefta", "Degache", "Tameghza"] },
  { slug: "kebili", name: "Kébili", in: "à Kébili", region: "Sud-Ouest", towns: ["Kébili", "Douz", "Souk Lahad", "Faouar"] },
];

export const getGovernorate = (slug: string) => GOVERNORATES.find((g) => g.slug === slug) ?? null;

/**
 * Quality gate. A regional page is indexable ONLY if listed here. Regional pages carry little local information
 * beyond geography and real, uniform delivery terms, so indexing starts with a measured pilot (largest markets, both
 * clusters). Everything else stays reachable but noindex and out of the sitemap until Search Console shows the pilot
 * is useful and a page has real local value to add.
 */
export const INDEXED_PILOT: Record<Cluster, string[]> = {
  parapharmacie: ["tunis", "sousse", "sfax"],
  proteine: ["tunis", "sousse", "sfax"],
};

export const isIndexable = (cluster: Cluster, slug: string) => INDEXED_PILOT[cluster].includes(slug);

/**
 * Delivery facts used on regional pages. They mirror what the platform really does today:
 *  - the order API charges a flat fee for every order (see apps/api/src/common/tunisia.ts),
 *  - payment is cash on delivery (see /livraison, /paiement),
 *  - timing wording matches the site-wide commitment "24h-48h".
 * No free-shipping threshold is published here: /livraison currently mentions one that the checkout does not apply.
 */
export const DELIVERY = {
  feeDt: 7,
  timing: "24 à 48 h ouvrables",
  payment: "paiement en espèces à la livraison",
} as const;

export const CLUSTER_LABEL: Record<Cluster, { path: string; short: string }> = {
  parapharmacie: { path: "/parapharmacie", short: "Parapharmacie" },
  proteine: { path: "/proteine", short: "Protéine & nutrition sportive" },
};

export const regionNeighbours = (slug: string) => {
  const g = getGovernorate(slug);
  return g ? GOVERNORATES.filter((x) => x.region === g.region && x.slug !== slug) : [];
};
