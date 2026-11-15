import { RESTRICTED_SUBSTANCE } from "./product-seo-quality";

/**
 * Brand SEO engine (pure functions, no database access).
 *
 * Principles
 *  - Only catalogue facts are used: category names/counts, product names, stock state. Nothing about a brand's history,
 *    origin, certifications, partnerships or health effects is ever generated.
 *  - Brands are classified into tiers; only tiers A and B may be indexable. Thin, empty, generic, machine-only or
 *    legally sensitive brands stay noindex (tier C) and get no generated copy.
 *  - Existing human-written copy is preserved; the old generic template is recognised and replaced.
 *  - The score is an internal quality indicator, never a ranking promise.
 */

export type BrandCategoryFact = { slug: string; name: string; indexable: boolean; count: number };
export type BrandProductFact = { slug: string; name: string; inStock: boolean };

export type BrandFacts = {
  id: string;
  slug: string;
  name: string;
  status: string;
  indexable: boolean;
  seoIsCustom: boolean;
  image: string | null;
  imageAlt: string | null;
  origin: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoH1: string | null;
  seoIntro: string | null;
  seoContent: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  publishedCount: number;
  indexableCount: number;
  inStockCount: number;
  indexableInStockCount: number;
  /** Published products whose category is a gym-machine/cardio category (prices not verified). */
  machineCount: number;
  /**
   * Published products that name a restricted compound or sit in a hormonal/booster category AND are actively offered
   * (in stock or indexable). On-order restricted items are listed like on every category page and do not block a brand.
   */
  restrictedCount: number;
  /** Categories of the brand's INDEXABLE products, most products first. */
  categories: BrandCategoryFact[];
  /** Up to a handful of indexable products, in-stock first. */
  topProducts: BrandProductFact[];
};

export type Tier = "A" | "B" | "C";
export type Classification = { tier: Tier; reasons: string[] };

export const SITE_URL = "https://paratunisie.com";
export const MACHINE_CATEGORY = /^(materiel-de-musculation|cardio-fitness)$/;
export const SENSITIVE_CATEGORY = /(hormon|booster|testo|tribulus|dhea|tongkat|anabol|sarm|prohorm)/i;
const GENERIC_BRAND = /^(autres?( marques?)?|other|generic|divers|sans marque|unknown|non renseign)/i;

/** Wording that must never be generated: unverifiable claims, history, certifications, official status, medical effects. */
export const BANNED_CLAIM =
  /(100\s*%\s*(authentique|original)|distributeur officiel|revendeur officiel|partenaire officiel|repr[ée]sentant officiel|meilleur prix|garanti|certifi|fond[ée]e? en|depuis\s+\d{4}|n[°ºo]\s*1\b|leader|gu[ée]ri|soigne|traite\s|cure\b|anti-?cancer)/i;

const CATEGORY_LABEL: Record<string, string> = {
  creatine: "créatine",
  "whey-proteine": "whey protéine",
  "whey-isolate": "whey isolate",
  "whey-hydrolysee": "whey hydrolysée",
  "gainers-proteines": "gainers",
  vitamines: "vitamines",
  magnesium: "magnésium",
  "omega-3": "oméga-3",
  zinc: "zinc",
  bcaa: "BCAA",
  eaa: "EAA",
  "acides-amines": "acides aminés",
  "pre-workout": "pre-workout",
  ashwagandha: "ashwagandha",
  collagene: "collagène",
  probiotiques: "probiotiques",
  accessoires: "accessoires et shakers",
  glucides: "glucides",
  caseine: "caséine",
  "l-carnitine": "L-carnitine",
};

/** One vetted, claim-free buying tip per product family. */
const CATEGORY_TIP: Record<string, string> = {
  creatine: "Créatine : comparez la forme (monohydrate, micronisée), le format et le prix par dose.",
  "whey-proteine": "Whey : lisez les protéines par portion, la liste des ingrédients et le prix par portion.",
  "whey-isolate": "Whey isolate : comparez les protéines par portion et les ingrédients ajoutés.",
  "gainers-proteines": "Gainers : comparez les calories et les protéines par portion ainsi que la part de sucres.",
  vitamines: "Vitamines : vérifiez le dosage par prise, la forme du nutriment et le nombre de doses du flacon.",
  magnesium: "Magnésium : comparez la forme (bisglycinate, citrate, etc.), le dosage par prise et le format.",
  zinc: "Zinc : comparez la forme, le dosage par prise et le nombre de doses.",
  "omega-3": "Oméga-3 : comparez la teneur en EPA et DHA par prise et le format.",
  bcaa: "BCAA : comparez le ratio leucine, isoleucine, valine et la quantité par portion.",
  eaa: "EAA : comparez la quantité de chaque acide aminé essentiel par portion.",
  "pre-workout": "Pre-workout : vérifiez la teneur en caféine par portion et les autres ingrédients.",
  ashwagandha: "Ashwagandha : comparez l'extrait utilisé, le dosage par prise et le format.",
};
const DEFAULT_TIP = "Lisez la composition, le dosage par prise et comparez le prix par portion plutôt que le prix du pot.";

const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
const plain = (v: unknown) => clean(String(v ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*_`>]/g, " "));
const norm = (v: unknown) => plain(v).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const words = (v: unknown) => norm(v).match(/[a-z0-9]+/g) ?? [];

export function categoryLabel(c: BrandCategoryFact): string {
  return CATEGORY_LABEL[c.slug] ?? clean(c.name.replace(/&.*$/, "")).toLowerCase();
}

/** "CREATINE MONOHYDRATE 150GR - REAL PHARM" → "Creatine Monohydrate 150gr - Real Pharm" (only when the name is shouting). */
export function readableProductName(name: string): string {
  const n = clean(name);
  if (n !== n.toUpperCase()) return n;
  return n
    .toLowerCase()
    .replace(/(^|[\s\-/(])([a-zà-ÿ])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/\b(bcaa|eaa|usa|uk|dhea|zma|hmb|gaba|nad|mct|kg|ml)\b/gi, (m) => m.toUpperCase());
}

export function classifyBrand(f: BrandFacts): Classification {
  const reasons: string[] = [];
  if (f.status !== "ACTIVE") reasons.push("Marque inactive.");
  if (GENERIC_BRAND.test(clean(f.name)) || clean(f.name).length < 3) reasons.push("Nom générique ou non identifiable : aucune identité de marque vérifiable.");
  if (f.publishedCount === 0) reasons.push("Aucun produit publié.");
  else if (f.indexableCount === 0) reasons.push("Aucun produit indexable : la page n'apporterait rien aux moteurs de recherche.");
  else if (f.indexableCount === 1) reasons.push("Un seul produit indexable : contenu insuffisant pour une page marque.");
  if (f.restrictedCount > 0) reasons.push(`${f.restrictedCount} produit(s) à examen légal ou médical (composé restreint ou booster hormonal) en stock ou indexable : validation humaine requise.`);
  if (f.publishedCount > 0 && f.machineCount / f.publishedCount >= 0.5) reasons.push("Marque d'équipements dont les prix ne sont pas vérifiés.");
  if (reasons.length > 0) return { tier: "C", reasons };
  if (f.indexableCount >= 4 && f.indexableInStockCount >= 2) return { tier: "A", reasons: ["≥ 4 produits indexables dont ≥ 2 en stock."] };
  return { tier: "B", reasons: ["≥ 2 produits indexables."] };
}

export type BrandDraft = {
  seoTitle: string;
  seoDescription: string;
  seoH1: string;
  seoIntro: string;
  seoContent: string;
  seoKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  imageAlt: string;
};

function joinFr(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1].slice(0, max).replace(/\s+\S*$/, "");
}

export function draftBrandSeo(f: BrandFacts, tier: "A" | "B"): BrandDraft {
  const name = clean(f.name);
  const families = f.categories.filter((c) => !SENSITIVE_CATEGORY.test(c.slug));
  const labels = families.slice(0, 3).map(categoryLabel);
  const [l1, l2, l3] = labels;

  const titleCandidates =
    tier === "A"
      ? [
          l3 && `${name} en Tunisie : ${l1}, ${l2}, ${l3} | ParaTunisie`,
          l2 && `${name} en Tunisie : ${l1} et ${l2} | ParaTunisie`,
          l1 && `${name} en Tunisie : ${l1} | ParaTunisie`,
          `${name} en Tunisie | ParaTunisie`,
        ]
      : [
          l3 && `${name} : ${l1}, ${l2} et ${l3} | ParaTunisie`,
          l2 && `${name} : ${l1} et ${l2} | ParaTunisie`,
          l1 && `${name} : ${l1} | ParaTunisie`,
          `${name} | ParaTunisie`,
        ];
  const seoTitle = fit(titleCandidates.filter((x): x is string => Boolean(x)), 60);

  const list = joinFr(labels);
  const descCandidates = [
    list && `${name} sur ParaTunisie : ${list}. Comparez les formats et les compositions, livraison en 24 à 48 h en Tunisie, paiement à la livraison.`,
    list && `${name} : ${list}. Comparez les formats et les compositions, livraison en 24 à 48 h, paiement à la livraison.`,
    `Produits ${name} sur ParaTunisie : comparez les formats et les compositions. Livraison en 24 à 48 h en Tunisie, paiement à la livraison.`,
  ].filter((x): x is string => Boolean(x));
  const seoDescription = fit(descCandidates, 160);

  const seoH1 = tier === "A" ? `${name} en Tunisie` : `Produits ${name}`;
  const seoIntro = list
    ? `Découvrez les produits ${name} de ParaTunisie : ${list}. Chaque fiche indique le format, le prix et l'état de stock.`
    : `Découvrez les produits ${name} de ParaTunisie. Chaque fiche indique le format, le prix et l'état de stock.`;

  const linkedFamilies = families.filter((c) => c.indexable).slice(0, 4);
  const familyLinks = linkedFamilies.map((c) => `[${categoryLabel(c)}](/${c.slug})`);
  const examples = f.topProducts.slice(0, 3).map((p) => `[${readableProductName(p.name)}](/produits/${p.slug})`);
  const tips = (families.length ? families.slice(0, 3) : []).map((c) => `- ${CATEGORY_TIP[c.slug] ?? DEFAULT_TIP}`);
  const tipBlock = tips.length ? tips.join("\n") : `- ${DEFAULT_TIP}`;

  const gammes: string[] = [`## Les gammes ${name} sur ParaTunisie`, ""];
  gammes.push(
    familyLinks.length
      ? `Le catalogue comprend des produits ${name} dans ${familyLinks.length > 1 ? "plusieurs catégories" : "la catégorie"} : ${joinFr(familyLinks)}.`
      : `Le catalogue comprend des produits ${name}, à retrouver dans la liste ci-dessus.`,
  );
  if (examples.length) gammes.push("", `Parmi les références disponibles : ${joinFr(examples)}. L'état de stock affiché sur chaque fiche fait foi.`);

  const seoContent = [
    ...gammes,
    "",
    `## Bien choisir un produit ${name}`,
    "",
    tipBlock,
    "",
    "## Commander",
    "",
    "Livraison en 24 à 48 h partout en Tunisie, paiement à la livraison : voir nos pages [livraison](/livraison) et [retours](/retours), ainsi que notre démarche [authenticité](/authenticite). Les noms de marque appartiennent à leurs propriétaires respectifs. Les compléments alimentaires ne remplacent pas une alimentation variée ; demandez l'avis d'un professionnel de santé en cas de doute.",
  ].join("\n");

  const seoKeywords = [...new Set([`${name} Tunisie`, `${name} prix Tunisie`, `acheter ${name}`, ...labels.slice(0, 3).map((l) => `${name} ${l}`)])];
  const image = f.image && !/placeholder|product-unavailable|\/assets\//i.test(f.image) ? f.image : null;

  return {
    seoTitle,
    seoDescription,
    seoH1,
    seoIntro,
    seoContent,
    seoKeywords,
    canonicalUrl: `${SITE_URL}/marques/${f.slug}`,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogImage: image,
    imageAlt: `Logo ${name}`,
  };
}

/** True for the generic copy produced by the old bulk generator (and the Batch-5 category template). */
export function isTemplateText(text: string | null | undefined): boolean {
  const t = norm(text);
  if (!t) return false;
  return (
    /explorez les references .* proposees dans notre catalogue/.test(t) ||
    /retrouvez la selection .* disponible en tunisie sur paratunisie/.test(t) ||
    /decouvrez les produits .* disponibles en tunisie sur paratunisie/.test(t) ||
    /achetez les produits .* au meilleur prix/.test(t) ||
    /^.{0,40} tunisie \| produits .* \| paratunisie$/.test(t)
  );
}

export type DraftIssue = { code: string; severity: "BLOCKER" | "WARNING"; message: string };

const FIELDS: (keyof BrandDraft)[] = ["seoTitle", "seoDescription", "seoH1", "seoIntro", "seoContent", "ogTitle", "ogDescription", "imageAlt"];

export function validateDraft(d: BrandDraft, f: BrandFacts): DraftIssue[] {
  const out: DraftIssue[] = [];
  const add = (code: string, severity: "BLOCKER" | "WARNING", message: string) => out.push({ code, severity, message });
  const brand = norm(f.name);
  if (d.seoTitle.length < 15 || d.seoTitle.length > 60) add("TITLE_LENGTH", "BLOCKER", `Titre de ${d.seoTitle.length} caractères (attendu 15–60).`);
  if (d.seoDescription.length < 90 || d.seoDescription.length > 160) add("META_LENGTH", "BLOCKER", `Méta description de ${d.seoDescription.length} caractères (attendu 90–160).`);
  for (const key of ["seoTitle", "seoDescription", "seoH1", "seoIntro"] as const) {
    if (!norm(d[key]).includes(brand)) add("BRAND_MISSING", "BLOCKER", `Le champ ${key} ne contient pas le nom de la marque.`);
  }
  for (const key of FIELDS) if (BANNED_CLAIM.test(plain(d[key]))) add("UNSUPPORTED_CLAIM", "BLOCKER", `Formulation non vérifiable dans ${key}.`);
  const count = words(d.seoContent).length;
  if (count < 90) add("THIN_CONTENT", "BLOCKER", `Contenu de ${count} mots (minimum 90).`);
  const links = [...d.seoContent.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
  if (new Set(links).size < 3) add("FEW_LINKS", "BLOCKER", "Moins de 3 liens internes distincts dans le contenu.");
  const tunisie = (plain(d.seoTitle + " " + d.seoH1 + " " + d.imageAlt).match(/tunisie/gi) ?? []).length;
  if (tunisie > 2) add("KEYWORD_STUFFING", "WARNING", `« Tunisie » répété ${tunisie} fois dans titre, H1 et alt.`);
  if (!d.ogImage) add("NO_IMAGE", "WARNING", "Pas de logo réel : aperçu social sans image.");
  return out;
}

/** Word-set Jaccard similarity between two texts, ignoring very short words. */
export function similarity(a: string, b: string): number {
  const A = new Set(words(a).filter((w) => w.length > 3));
  const B = new Set(words(b).filter((w) => w.length > 3));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export type ScoreContext = { titleCounts: Map<string, number>; descCounts: Map<string, number>; h1Counts: Map<string, number> };
export function buildScoreContext(rows: { seoTitle: string | null; seoDescription: string | null; seoH1: string | null }[]): ScoreContext {
  const count = (pick: (r: (typeof rows)[number]) => string | null) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = norm(pick(r));
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  return { titleCounts: count((r) => r.seoTitle), descCounts: count((r) => r.seoDescription), h1Counts: count((r) => r.seoH1) };
}

export type ScoreCheck = { id: string; label: string; passed: boolean; reason: string };
export type BrandScore = { score: number; total: 10; checks: ScoreCheck[]; tier: Tier; tierReasons: string[] };

/** Internal quality score. 10 evidence-based checks; a filled field alone never earns a point. */
export function scoreBrand(f: BrandFacts, ctx: ScoreContext): BrandScore {
  const { tier, reasons } = classifyBrand(f);
  const brand = norm(f.name);
  const title = plain(f.seoTitle), meta = plain(f.seoDescription), h1 = plain(f.seoH1);
  const content = f.seoContent ?? "";
  const checks: ScoreCheck[] = [];
  const add = (id: string, label: string, passed: boolean, ok: string, ko: string) => checks.push({ id, label, passed, reason: passed ? ok : ko });

  add("title", "Titre SEO valide et unique",
    title.length >= 15 && title.length <= 60 && norm(title).includes(brand) && (ctx.titleCounts.get(norm(title)) ?? 0) <= 1 && !isTemplateText(title),
    "Titre de 15–60 caractères, avec la marque, unique.", "Titre absent, hors 15–60 caractères, sans la marque, dupliqué ou issu du modèle générique.");
  add("meta", "Méta description valide et unique",
    meta.length >= 90 && meta.length <= 160 && norm(meta).includes(brand) && (ctx.descCounts.get(norm(meta)) ?? 0) <= 1 && !isTemplateText(meta),
    "Description de 90–160 caractères, avec la marque, unique.", "Description absente, hors 90–160 caractères, sans la marque, dupliquée ou générique.");
  add("h1", "H1 unique", h1.length >= 4 && norm(h1).includes(brand) && (ctx.h1Counts.get(norm(h1)) ?? 0) <= 1, "H1 distinct contenant la marque.", "H1 absent, sans la marque ou dupliqué.");
  add("canonical", "Canonical auto-référente", f.canonicalUrl === `${SITE_URL}/marques/${f.slug}`, "Canonical = URL de la page.", "Canonical absente ou différente de l'URL de la page.");
  const links = [...content.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
  add("content", "Contenu original", words(content).length >= 90 && !isTemplateText(content) && !isTemplateText(f.seoIntro), "Contenu de 90 mots ou plus, hors modèle générique.", "Contenu absent, trop court (< 90 mots) ou issu du modèle générique.");
  add("links", "Liens internes pertinents", new Set(links).size >= 3, "Au moins 3 liens internes distincts.", "Moins de 3 liens internes dans le contenu.");
  add("image", "Logo réel et texte alternatif", Boolean(f.image) && !/placeholder|product-unavailable/i.test(f.image ?? "") && plain(f.imageAlt).length >= 5, "Logo réel avec texte alternatif.", "Logo absent ou texte alternatif manquant.");
  const wantsIndex = tier !== "C";
  add("indexability", "Décision d'indexation cohérente", f.indexable === wantsIndex, wantsIndex ? "Indexable et éligible (tier A/B)." : "Non indexable, conforme à son statut.", wantsIndex ? "Éligible à l'indexation mais marquée noindex." : `Indexable alors que non éligible : ${reasons[0] ?? "critères non remplis"}`);
  add("og", "Open Graph complet", plain(f.ogTitle).length >= 5 && plain(f.ogDescription).length >= 40 && Boolean(f.ogImage), "Titre, description et image de partage.", "Titre, description ou image de partage manquants.");
  const claimText = [f.seoTitle, f.seoDescription, f.seoH1, f.seoIntro, f.seoContent].map(plain).join(" ");
  add("claims", "Aucune affirmation non vérifiable", claimText.length > 0 && !BANNED_CLAIM.test(claimText), "Aucune affirmation d'histoire, de certification ou d'effet santé.", claimText.length === 0 ? "Aucun contenu à contrôler." : "Contient une formulation non vérifiable (officiel, certifié, n°1, depuis …).");

  return { score: checks.filter((c) => c.passed).length, total: 10, checks, tier, tierReasons: reasons };
}

export type BrandPlan = {
  slug: string;
  name: string;
  tier: Tier;
  action: "generate" | "preserve" | "noindex" | "blocked" | "unchanged";
  reason: string;
  issues: DraftIssue[];
  draft?: BrandDraft;
  indexable: boolean;
  duplicateOf?: string;
  /** Preserved brands only: empty or generic-template fields that a validated draft completes. Original text is never touched. */
  fill?: Partial<BrandDraft>;
};

export type PlanOptions = { regenerate: boolean; overwriteCustom: boolean };

const FILL_KEYS = ["seoTitle", "seoDescription", "seoH1", "seoIntro", "seoContent", "canonicalUrl", "ogTitle", "ogDescription", "ogImage", "imageAlt"] as const;

/** Fields of a preserved brand that are empty or still hold the generic template and can safely be completed. */
export function fillMissing(f: BrandFacts, draft: BrandDraft): Partial<BrandDraft> {
  const out: Partial<BrandDraft> = {};
  const set = <K extends keyof BrandDraft>(key: K, value: BrandDraft[K]) => { (out as Record<string, unknown>)[key] = value; };
  for (const key of FILL_KEYS) {
    const current = (f as unknown as Record<string, string | null>)[key];
    const empty = !clean(current);
    // Length defects (a 70-character title is truncated in results) are technical, not editorial: they are replaced too.
    const badLength =
      (key === "seoTitle" && !empty && (clean(current).length > 60 || clean(current).length < 15)) ||
      (key === "seoDescription" && !empty && (clean(current).length > 160 || clean(current).length < 90));
    if ((empty || badLength || isTemplateText(current)) && draft[key]) set(key, draft[key]);
  }
  // A canonical pointing elsewhere is a defect, not content: align it.
  if (clean(f.canonicalUrl) && f.canonicalUrl !== draft.canonicalUrl) set("canonicalUrl", draft.canonicalUrl);
  return out;
}

/**
 * Decides, for one brand, what a run would do. Never touches the database.
 *  - tier C → keep (or make) noindex, copy untouched
 *  - custom or already-good copy → preserved (indexability still follows the tier)
 *  - otherwise a validated draft replaces the missing / generic copy
 */
export function planBrand(f: BrandFacts, options: PlanOptions): BrandPlan {
  const { tier, reasons } = classifyBrand(f);
  const base = { slug: f.slug, name: f.name, tier, issues: [] as DraftIssue[] };
  if (tier === "C") {
    if (f.seoIsCustom && !options.overwriteCustom) {
      // Hand-edited brands are never switched off by a bulk run; the audit still reports them for manual review.
      return { ...base, action: "preserve", reason: `Marque personnalisée non éligible : revue manuelle requise. ${reasons.join(" ")}`, indexable: f.indexable };
    }
    return { ...base, action: f.indexable ? "noindex" : "unchanged", reason: reasons.join(" "), indexable: false };
  }
  const existingGood =
    clean(f.seoContent).length > 0 &&
    !isTemplateText(f.seoContent) && !isTemplateText(f.seoIntro) && !isTemplateText(f.seoDescription) && !isTemplateText(f.seoTitle) &&
    words(f.seoContent).length >= 90;
  if (f.seoIsCustom && !options.overwriteCustom) {
    const d = draftBrandSeo(f, tier);
    const fill = validateDraft(d, f).some((i) => i.severity === "BLOCKER") ? {} : fillMissing(f, d);
    return { ...base, action: "preserve", reason: "Contenu personnalisé conservé (seoIsCustom) ; seuls les champs vides ou génériques sont complétés.", indexable: f.indexable, fill };
  }
  if (existingGood && !options.regenerate) {
    const d = draftBrandSeo(f, tier);
    const fill = validateDraft(d, f).some((i) => i.severity === "BLOCKER") ? {} : fillMissing(f, d);
    return { ...base, action: "preserve", reason: "Contenu existant original conservé ; seuls les champs vides ou génériques sont complétés.", indexable: true, fill };
  }
  const draft = draftBrandSeo(f, tier);
  const issues = validateDraft(draft, f);
  if (issues.some((i) => i.severity === "BLOCKER")) {
    return { ...base, action: "blocked", reason: "Le brouillon échoue à la validation.", issues, draft, indexable: false };
  }
  return { ...base, action: "generate", reason: "Brouillon original généré à partir des données du catalogue.", issues, draft, indexable: true };
}

/** Flags drafts that are (almost) identical to another brand's draft so they are never published as near-duplicates. */
export function markDuplicates(plans: BrandPlan[], threshold = 0.9): void {
  const drafted = plans.filter((p) => p.draft);
  const seen = new Map<string, string>();
  for (const p of drafted) {
    for (const key of ["seoTitle", "seoDescription", "seoH1"] as const) {
      const k = `${key}:${norm(p.draft![key])}`;
      const other = seen.get(k);
      if (other && other !== p.slug) {
        p.issues.push({ code: "DUPLICATE_METADATA", severity: "BLOCKER", message: `${key} identique à celui de ${other}.` });
        p.duplicateOf = other;
      } else seen.set(k, p.slug);
    }
  }
  for (let i = 0; i < drafted.length; i++) {
    for (let j = i + 1; j < drafted.length; j++) {
      const sim = similarity(drafted[i].draft!.seoContent, drafted[j].draft!.seoContent);
      if (sim >= threshold) {
        drafted[j].issues.push({ code: "NEAR_DUPLICATE_CONTENT", severity: "BLOCKER", message: `Contenu similaire à ${Math.round(sim * 100)} % à celui de ${drafted[i].slug}.` });
        drafted[j].duplicateOf = drafted[i].slug;
      }
    }
  }
  for (const p of drafted) {
    if (p.action === "generate" && p.issues.some((x) => x.severity === "BLOCKER")) {
      p.action = "blocked";
      p.indexable = false;
      p.reason = "Doublon de métadonnées ou de contenu détecté.";
    }
  }
}

/** Mirror of the sensitive-product rule used by classification, exposed for the data-gathering layer. */
export function isRestrictedProduct(name: string, slug: string, categorySlug: string): boolean {
  return RESTRICTED_SUBSTANCE.test(`${name} ${slug.replace(/-/g, " ")}`) || SENSITIVE_CATEGORY.test(categorySlug);
}
