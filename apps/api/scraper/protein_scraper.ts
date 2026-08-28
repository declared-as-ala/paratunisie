import * as cheerio from "cheerio";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface ScrapedProduct {
  sourceUrl: string;
  sourceSku?: string;
  rawTitle: string;
  normalizedTitle: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug: string;
  priceMillimes: number;
  oldPriceMillimes?: number;
  formatSize: string;
  images: string[];
  localImages: string[];
  mainImage: string;
  benefit: string;
  description: string;
  usage: string;
  ingredients?: string;
  inStock: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  faq: { question: string; answer: string }[];
}

export const TARGET_URLS = [
  // Créatine
  "https://protein.tn/creatine/creatine-monohydrate-ostrovit-500gr",
  "https://protein.tn/creatine/micronised-creatine-optimum-nutrition-317g",
  "https://protein.tn/creatine/creatine-monohydrate-500g-quamtrax",
  "https://protein.tn/creatine/creatine-real-pharm-300g",
  "https://protein.tn/creatine/creatine-monohydrate-500gr-real-pharm",
  "https://protein.tn/creatine/100-creatine-monohydrate-300g-biotech-usa",
  // Pre-Workout
  "https://protein.tn/pre-workout/victor-martinez-break-out-pre-workout",
  "https://protein.tn/pre-workout/pre-workout-born-rage-original-eric-favre",
  "https://protein.tn/pre-workout/pump-extreme-pre-workout-challenger-nutrition-30-servings",
  "https://protein.tn/pre-workout/psychotic-pre-workout",
  // Zinc
  "https://protein.tn/zinc/zumub-zinc-100-comprimes",
  "https://protein.tn/zinc/zinc-duo-biotech-usa-60-capsules",
  "https://protein.tn/zinc/zinc-90-tab-real-pharm",
  // Omega 3
  "https://protein.tn/omega-3/zumub-omega-3-90-caps",
  "https://protein.tn/omega-3/mega-omega-3-90-caps-biotech",
  // Magnésium
  "https://protein.tn/magnesium/magnesium-vitamin-b6-90-tablets",
  "https://protein.tn/magnesium/magnesiumcalcium-vitamin-b6-90-tablet-muscle-care",
  // Vitamines
  "https://protein.tn/vitamines/vitamin-c-110-tabs-ostrovit",
  "https://protein.tn/vitamines/pro-vitamin-90-tabletas-muscle-care",
  "https://protein.tn/vitamines/vegan-vitamin-d3-k2-365-tablets-weightworld",
  "https://protein.tn/vitamines/vitamin-complex-sport-120-tablets-sfd-nutrition",
  "https://protein.tn/vitamines/vitamin-d3-k2-90-tabs-real-pharm",
  "https://protein.tn/vitamines/one-a-day-biotech-usa",
  "https://protein.tn/vitamines/opti-men-90tabs",
  // Ashwagandha
  "https://protein.tn/ashwagandha/ashwagandha-60-gelules-biotech-usa",
  "https://protein.tn/ashwagandha/ashwagandha-100-natural-90tabs",
  // Booster
  "https://protein.tn/boosters-hormonaux/t-9-testo-booster-120-caps",
  // Whey Protéine
  "https://protein.tn/whey-proteine/anabolic-whey-80-2-25kg-proactive",
  // Gainer
  "https://protein.tn/gainers-proteines/thunder-gainer-5-4kg-challenger-nutrition",
  // Beta-Alanine
  "https://protein.tn/beta-alanine/beta-alanine-300g-real-pharm",
  // BCAA
  "https://protein.tn/bcaa/xtend-bcaa-420g",
  // Citrulline
  "https://protein.tn/citrulline/citruargin-300-g-real-pharm",
  // EAA
  "https://protein.tn/eaa/eaa-master-amino-390g-scenit-nutrition",
  // L-Carnitine & Bruleurs de graisse
  "https://protein.tn/l-carnitine/gold-l-carnitine-3000-500ml",
  "https://protein.tn/l-carnitine/l-carnitina-1250-60-capsule-ostrovit",
  "https://protein.tn/bruleurs-de-graisse/lipo-6-black-ultra-concentrate-60caps",
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBrand(rawBrand: string, title: string): string {
  const t = `${rawBrand} ${title}`.toLowerCase();
  if (t.includes("ostrovit")) return "OstroVit";
  if (t.includes("optimum nutrition")) return "Optimum Nutrition";
  if (t.includes("quamtrax")) return "Quamtrax";
  if (t.includes("real pharm")) return "Real Pharm";
  if (t.includes("biotech") || t.includes("bio tech")) return "BioTechUSA";
  if (t.includes("eric favre")) return "Eric Favre";
  if (t.includes("challenger nutrition")) return "Challenger Nutrition";
  if (t.includes("zumub")) return "Zumub";
  if (t.includes("muscle care")) return "Muscle Care";
  if (t.includes("weightworld")) return "WeightWorld";
  if (t.includes("sfd nutrition") || t.includes("sfd")) return "SFD Nutrition";
  if (t.includes("proactive")) return "ProActive";
  if (t.includes("scenit")) return "Scenit Nutrition";
  if (t.includes("scitec")) return "Scitec Nutrition";
  if (t.includes("victor martinez")) return "Victor Martinez";
  if (t.includes("insane labz") || t.includes("psychotic")) return "Insane Labz";
  if (t.includes("nutrex") || t.includes("lipo-6") || t.includes("lipo 6")) return "Nutrex Research";
  if (t.includes("xtend")) return "Xtend";
  if (t.includes("fa engineered") || t.includes("gold l-carnitine")) return "FA Engineered Nutrition";

  return rawBrand ? rawBrand.trim() : "ParaTunisie";
}

function normalizeCategory(url: string, title: string): { name: string; slug: string } {
  const u = url.toLowerCase();
  const t = title.toLowerCase();

  if (u.includes("/creatine") || t.includes("creatine") || t.includes("créatine")) {
    return { name: "Créatine", slug: "creatine" };
  }
  if (u.includes("/whey-proteine") || t.includes("whey")) {
    return { name: "Whey Protéine", slug: "whey-proteine" };
  }
  if (u.includes("/gainers") || t.includes("gainer")) {
    return { name: "Gainers", slug: "gainers-proteines" };
  }
  if (u.includes("/pre-workout") || t.includes("pre-workout") || t.includes("pre workout") || t.includes("psychotic") || t.includes("born rage")) {
    return { name: "Pre-Workout", slug: "pre-workout" };
  }
  if (u.includes("/beta-alanine") || t.includes("beta-alanine") || t.includes("beta alanine")) {
    return { name: "Beta-Alanine", slug: "beta-alanine" };
  }
  if (u.includes("/citrulline") || t.includes("citrulline") || t.includes("citruargin")) {
    return { name: "Citrulline", slug: "citrulline" };
  }
  if (u.includes("/eaa") || t.includes("eaa")) {
    return { name: "EAA", slug: "eaa" };
  }
  if (u.includes("/bcaa") || t.includes("bcaa")) {
    return { name: "BCAA", slug: "bcaa" };
  }
  if (u.includes("/zinc") || t.includes("zinc")) {
    return { name: "Zinc", slug: "zinc" };
  }
  if (u.includes("/magnesium") || t.includes("magnesium") || t.includes("magnésium")) {
    return { name: "Magnésium", slug: "magnesium" };
  }
  if (u.includes("/omega-3") || t.includes("omega 3") || t.includes("omega-3")) {
    return { name: "Omega 3", slug: "omega-3" };
  }
  if (u.includes("/ashwagandha") || t.includes("ashwagandha")) {
    return { name: "Ashwagandha", slug: "ashwagandha" };
  }
  if (u.includes("/boosters-hormonaux") || t.includes("booster") || t.includes("testo")) {
    return { name: "Boosters", slug: "boosters-hormonaux" };
  }
  if (u.includes("/l-carnitine") || t.includes("carnitine") || t.includes("carnitina")) {
    return { name: "L-Carnitine", slug: "l-carnitine" };
  }
  if (u.includes("/bruleurs-de-graisse") || t.includes("lipo-6") || t.includes("bruleur")) {
    return { name: "Brûleurs de Graisse", slug: "bruleurs-de-graisse" };
  }
  if (u.includes("/vitamines") || t.includes("vitamin") || t.includes("opti-men") || t.includes("one a day")) {
    return { name: "Vitamines", slug: "vitamines" };
  }

  return { name: "Nutrition Sportive", slug: "nutrition-sportive" };
}

function extractFormat(title: string, desc: string): string {
  const text = `${title} ${desc}`;
  const patterns = [
    /(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|ml|l))\b/i,
    /(\d+\s*(?:capsules|capsule|caps|tablets|tabletas|tabs|gelules|gélules|comprimes|comprimés|servings))\b/i,
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match) {
      return match[1].replace(/gr\b/i, "g").replace(/tabs\b/i, "comprimés").replace(/caps\b/i, "gélules");
    }
  }
  return "Standard";
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
      });
      if (res.ok) {
        return await res.text();
      }
      console.warn(`HTTP ${res.status} on ${url}, retry ${i + 1}/${retries}`);
    } catch (err: any) {
      console.warn(`Fetch error for ${url}: ${err.message}, retry ${i + 1}/${retries}`);
    }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function downloadImage(imgUrl: string, productSlug: string, index: number): Promise<string | null> {
  try {
    const res = await fetch(imgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return null;

    const hash = crypto.createHash("sha256").update(buffer).digest("hex").substring(0, 8);
    const fileName = index === 0 ? `${productSlug}-${hash}.webp` : `${productSlug}-${index + 1}-${hash}.webp`;

    const apiUploadDir = path.join(__dirname, "..", "public", "uploads", "products");
    const webUploadDir = path.join(__dirname, "..", "..", "..", "public", "uploads", "products");

    if (!fs.existsSync(apiUploadDir)) fs.mkdirSync(apiUploadDir, { recursive: true });
    if (!fs.existsSync(webUploadDir)) fs.mkdirSync(webUploadDir, { recursive: true });

    fs.writeFileSync(path.join(apiUploadDir, fileName), buffer);
    fs.writeFileSync(path.join(webUploadDir, fileName), buffer);

    return `/uploads/products/${fileName}`;
  } catch (err: any) {
    console.error(`Failed to download image ${imgUrl}: ${err.message}`);
    return null;
  }
}

function generateOriginalSeo(product: {
  normalizedTitle: string;
  brand: string;
  category: string;
  formatSize: string;
  priceMillimes: number;
  slug: string;
}) {
  const { normalizedTitle, brand, category, formatSize, priceMillimes, slug } = product;
  const priceDt = (priceMillimes / 1000).toFixed(0);

  // SEO Title (45-60 chars)
  const seoTitle = `${normalizedTitle} en Tunisie | ParaTunisie`;

  // Meta Description (140-160 chars)
  const metaDescription = `Achetez ${normalizedTitle} (${formatSize}) de ${brand} au meilleur prix en Tunisie (${priceDt} DT). Livraison rapide partout en Tunisie sur ParaTunisie.`;

  // Benefit
  let benefit = `Formule haute qualité ${brand} pour vos objectifs`;
  if (category === "Créatine") benefit = "Amélioration de la force, puissance & volume musculaire";
  else if (category === "Whey Protéine") benefit = "Développement musculaire sec & récupération optimale";
  else if (category === "Gainers") benefit = "Prise de masse musculaire & apport calorique de qualité";
  else if (category === "Pre-Workout") benefit = "Énergie explosive, focus & congestion intense à l'entraînement";
  else if (category === "BCAA" || category === "EAA") benefit = "Soutien anti-catabolique & récupération musculaire rapide";
  else if (category === "Beta-Alanine") benefit = "Endurance musculaire accrue & réduction de la fatigue";
  else if (category === "Citrulline") benefit = "Congestion musculaire maximale & vasodilatation";
  else if (category === "Zinc") benefit = "Soutien immunitaire, synthèse protéique & vitalité";
  else if (category === "Magnésium") benefit = "Réduction de la fatigue musculaire & équilibre nerveux";
  else if (category === "Omega 3") benefit = "Santé cardiovasculaire, articulations & fonction cognitive";
  else if (category === "Ashwagandha") benefit = "Gestion du stress, vitalité & récupération globale";
  else if (category === "Vitamines") benefit = "Vitalité quotidienne, immunité & forme optimale";
  else if (category === "Boosters") benefit = "Formule avancée de vitalité & tonus masculin";
  else if (category === "L-Carnitine" || category === "Brûleurs de Graisse") benefit = "Déstockage des graisses, métabolisme & définition";

  // Original Description for ParaTunisie
  const description = `${normalizedTitle} de la marque ${brand} est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de ${formatSize}, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.`;

  // Usage instructions
  let usage = `Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.`;
  if (category === "Créatine") {
    usage = `Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.`;
  } else if (category === "Pre-Workout") {
    usage = `Prendre 1 dose diluée dans 200-300 ml d'eau fraîche 20 à 30 minutes avant votre séance d'entraînement. Ne pas dépasser la dose recommandée.`;
  } else if (category === "Whey Protéine" || category === "Gainers") {
    usage = `Mélanger 1 portion dans 250-350 ml d'eau ou de lait écrémé après l'entraînement ou en collation entre les repas.`;
  } else if (category === "Vitamines" || category === "Zinc" || category === "Magnésium" || category === "Omega 3" || category === "Ashwagandha") {
    usage = `Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).`;
  }

  // Keywords
  const keywords = [
    `${slug} tunisie`,
    `${brand.toLowerCase()} tunisie`,
    `${category.toLowerCase()} tunisie`,
    `prix ${slug} tunisie`,
    `acheter ${category.toLowerCase()} tunisie`,
    `nutrition sportive tunisie`,
    `complement alimentaire tunisie`,
  ];

  // FAQ
  const faq = [
    {
      question: `Comment consommer ${normalizedTitle} ?`,
      answer: usage,
    },
    {
      question: `Le produit ${normalizedTitle} est-il authentique ?`,
      answer: `Oui, tous nos produits de la marque ${brand} sont 100% certifiés et authentiques, importés directement des circuits officiels.`,
    },
    {
      question: `Quels sont les délais de livraison en Tunisie ?`,
      answer: `ParaTunisie livre sur toute la Tunisie en 24 à 72h ouvrables avec paiement à la livraison.`,
    },
  ];

  return { seoTitle, metaDescription, benefit, description, usage, keywords, faq };
}

export async function scrapeSingleProduct(url: string): Promise<ScrapedProduct> {
  console.log(`Scraping product: ${url}...`);
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  // 1. Extract JSON-LD if available
  let ldProduct: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text().trim());
      if (data["@type"] === "Product") {
        ldProduct = data;
      }
    } catch {}
  });

  // 2. Extract Title & SKU
  let rawTitle = ldProduct?.name || $("h1").first().text().trim() || $("title").text().split("–")[0].split("|")[0].trim();
  rawTitle = rawTitle.replace(/\s+/g, " ").trim();

  const sourceSku = ldProduct?.sku || ldProduct?.productID || $('[data-product-identifiers] dd').first().text().trim() || undefined;

  // 3. Extract Price
  let priceMillimes = 0;
  if (ldProduct?.offers?.price) {
    priceMillimes = Math.round(parseFloat(ldProduct.offers.price) * 1000);
  }
  if (!priceMillimes) {
    const priceText = $('[data-buy-box] span.text-brand, .font-display.text-brand, span:contains("DT")').first().text();
    const clean = priceText.replace(/[^\d.,]/g, "").replace(",", ".");
    const val = parseFloat(clean);
    if (!isNaN(val)) priceMillimes = Math.round(val * 1000);
  }

  // 4. Extract Old Price
  let oldPriceMillimes: number | undefined;
  const oldPriceText = $('[data-buy-box] span.line-through, .line-through').first().text();
  if (oldPriceText) {
    const cleanOld = oldPriceText.replace(/[^\d.,]/g, "").replace(",", ".");
    const valOld = parseFloat(cleanOld);
    if (!isNaN(valOld) && valOld > 0) {
      oldPriceMillimes = Math.round(valOld * 1000);
    }
  }

  // 5. Brand
  const rawBrand = ldProduct?.brand?.name || $('a[href*="/ostrovit"], a[href*="/biotech"], a[href*="/brands/"], span:contains("Marque") + span').first().text().trim() || "";
  const brand = normalizeBrand(rawBrand, rawTitle);

  // 6. Category
  const categoryInfo = normalizeCategory(url, rawTitle);

  // 7. Format & Clean Title
  const formatSize = extractFormat(rawTitle, $("body").text());

  // Clean title for ParaTunisie (Title Case, clean dashes)
  let normalizedTitle = rawTitle
    .replace(/–\s*Prix\s*Tunisie.*$/i, "")
    .replace(/-\s*Prix\s*Tunisie.*$/i, "")
    .replace(/\|\s*Protein\.tn.*$/i, "")
    .replace(/\bPROTEIN\.TN\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize Title casing if all uppercase
  if (normalizedTitle === normalizedTitle.toUpperCase()) {
    normalizedTitle = normalizedTitle
      .toLowerCase()
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const slug = slugify(normalizedTitle);

  // 8. Extract Images
  const rawImages: string[] = [];
  if (ldProduct?.image) {
    if (Array.isArray(ldProduct.image)) rawImages.push(...ldProduct.image);
    else rawImages.push(ldProduct.image);
  }
  if (ldProduct?.associatedMedia) {
    for (const media of ldProduct.associatedMedia) {
      if (media.url) rawImages.push(media.url);
    }
  }
  $('img[src*="/storage/produits/"], img[src*="/storage/products/"]').each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      // Decode if inside next/image proxy
      if (src.includes("url=")) {
        const decoded = decodeURIComponent(src.split("url=")[1].split("&")[0]);
        rawImages.push(decoded);
      } else if (src.startsWith("http")) {
        rawImages.push(src);
      }
    }
  });

  const uniqueImages = [...new Set(rawImages.filter((u) => u.startsWith("http")))];
  const localImages: string[] = [];

  for (let idx = 0; idx < uniqueImages.length && idx < 4; idx++) {
    const local = await downloadImage(uniqueImages[idx], slug, idx);
    if (local) localImages.push(local);
  }

  const mainImage = localImages[0] || "/assets/product-tube.webp";

  // 9. Generate SEO & Original Content
  const seo = generateOriginalSeo({
    normalizedTitle,
    brand,
    category: categoryInfo.name,
    formatSize,
    priceMillimes,
    slug,
  });

  return {
    sourceUrl: url,
    sourceSku,
    rawTitle,
    normalizedTitle,
    slug,
    brand,
    category: categoryInfo.name,
    categorySlug: categoryInfo.slug,
    priceMillimes,
    oldPriceMillimes,
    formatSize,
    images: uniqueImages,
    localImages,
    mainImage,
    benefit: seo.benefit,
    description: seo.description,
    usage: seo.usage,
    inStock: true,
    seoTitle: seo.seoTitle,
    seoDescription: seo.metaDescription,
    seoKeywords: seo.keywords,
    faq: seo.faq,
  };
}

export async function scrapeAllCatalog(): Promise<ScrapedProduct[]> {
  console.log(`Starting scrape of ${TARGET_URLS.length} products from protein.tn...`);
  const results: ScrapedProduct[] = [];
  const errors: { url: string; error: string }[] = [];

  for (let i = 0; i < TARGET_URLS.length; i++) {
    const url = TARGET_URLS[i];
    try {
      const product = await scrapeSingleProduct(url);
      results.push(product);
      console.log(`[${i + 1}/${TARGET_URLS.length}] Scraped successfully: ${product.normalizedTitle} (${product.brand} - ${(product.priceMillimes / 1000).toFixed(3)} DT)`);
    } catch (err: any) {
      console.error(`[${i + 1}/${TARGET_URLS.length}] Failed to scrape ${url}: ${err.message}`);
      errors.push({ url, error: err.message });
    }
    // Respectful delay between requests
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\nScraping complete: ${results.length} succeeded, ${errors.length} failed.`);

  const outputPath = path.join(__dirname, "scraped_protein_catalog.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Saved scraped dataset to ${outputPath}`);

  if (errors.length > 0) {
    const errPath = path.join(__dirname, "scraped_errors.json");
    fs.writeFileSync(errPath, JSON.stringify(errors, null, 2), "utf8");
  }

  return results;
}

if (require.main === module) {
  scrapeAllCatalog().catch(console.error);
}
