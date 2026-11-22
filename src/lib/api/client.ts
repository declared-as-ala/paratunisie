/**
 * API client for the ParaTunisie NestJS backend.
 * Handles fetching from /api/v1/* endpoints and transforming Prisma responses
 * into the flat ProductSummary shape the frontend expects.
 *
 * Falls back to local mock data when the API is unreachable (e.g. during build).
 */

import type { ProductSummary } from "@/lib/data/products";
import { products as localProducts } from "@/lib/data/products";
import { SHOP_DEPARTMENTS } from "@/lib/data/storefront-navigation";

const MOCK_FALLBACK_ENABLED = process.env.NODE_ENV !== "production";

function getApiBase() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  }
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
}

/**
 * Static uploads (apps/api/src/main.ts useStaticAssets) are served from the
 * API's origin root, not under the /api/v1 prefix baked into getApiBase() —
 * that prefix exists for JSON fetch calls, not static files, so it has to
 * be stripped or a relative product.image path 404s against a
 * /api/v1/uploads/... URL that doesn't exist.
 *
 * The browser resolves a root-relative "/uploads/..." src against the page's
 * own origin. That's correct in production (web and API share one public
 * origin behind the gateway) but wrong whenever the frontend's origin isn't
 * the API's — e.g. local dev pointed at the public prod API — so uploads are
 * always made absolute against NEXT_PUBLIC_API_URL's origin when it's set.
 */
function getAssetOrigin(): string {
  const publicBase = process.env.NEXT_PUBLIC_API_URL;
  if (!publicBase) return "";
  try {
    return new URL(publicBase).origin;
  } catch {
    return "";
  }
}

function resolveImageUrl(rawImage: string | null | undefined): string {
  if (!rawImage) return "/assets/product-unavailable.svg";
  if (
    rawImage.startsWith("http://") ||
    rawImage.startsWith("https://") ||
    rawImage.startsWith("/assets/")
  ) {
    return rawImage;
  }
  const path = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
  if (!path.startsWith("/uploads/")) return path;
  const origin = getAssetOrigin();
  return origin ? `${origin}${path}` : path;
}

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  createdAt: string;
  user: { name: string | null };
};

export type ProductRating = { average: number; count: number };

/* ─── Raw Prisma response types ────────────────────────────────────── */

export type RawBrand = { id: string; name: string; slug: string; tagline?: string | null; description?: string | null };
export type RawCategory = { id: string; name: string; slug: string };
export type RawConcern = { id: string; name: string; slug: string };
export type RawVariant = { id: string; label: string; priceMillimes: number; stock: number; sku?: string | null; gtin?: string | null; mpn?: string | null };
export type RawProductImage = { id: string; url: string; alt?: string | null; position: number };

export type RawProduct = {
  id: string;
  slug: string;
  name: string;
  benefit?: string | null;
  description?: string | null;
  usage?: string | null;
  image?: string | null;
  images?: RawProductImage[];
  skinTypes?: string;
  routineTime?: string;
  brand: RawBrand;
  category: RawCategory;
  variants: RawVariant[];
  concerns?: RawConcern[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  indexable?: boolean;
  followLinks?: boolean;
  seoH1?: string | null;
  seoIntro?: string | null;
  seoContent?: string | null;
  seoKeywords?: string;
  seoFaq?: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  imageAlt?: string | null;
};

/* ─── Transform: Prisma → ProductSummary ────────────────────────────── */

function transformProduct(raw: RawProduct): ProductSummary {
  const sizes = (raw.variants || []).map((v) => ({ label: v.label || raw.name, priceMillimes: v.priceMillimes || 0 }));
  const defaultVariant = raw.variants?.[0];
  const primaryImage = raw.image || raw.images?.[0]?.url || "";

  return {
    id: raw.id,
    sku: raw.variants?.[0]?.sku || raw.id,
    gtin: raw.variants?.[0]?.gtin || undefined,
    mpn: raw.variants?.[0]?.mpn || undefined,
    slug: raw.slug,
    brand: raw.brand?.name || "ParaTunisie",
    brandSlug: raw.brand?.slug,
    name: raw.name,
    benefit: raw.benefit || "",
    size: defaultVariant?.label || "",
    priceMillimes: defaultVariant?.priceMillimes || 0,
    category: raw.category?.name || "Nutrition Sportive",
    categorySlug: raw.category?.slug || "nutrition-sportive",
    concerns: (raw.concerns ?? []).map((c) => c.name),
    skinTypes: parseJsonStringArray(raw.skinTypes),
    image: resolveImageUrl(primaryImage),
    description: raw.description || "",
    benefits: [],
    usage: raw.usage || "",
    sizes,
    routineTime: parseJsonStringArray(raw.routineTime) as ("AM" | "PM")[],
    inStock: (raw.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0) > 0,
    seoTitle: raw.seoTitle ?? null,
    seoDescription: raw.seoDescription ?? null,
    canonicalUrl: raw.canonicalUrl ?? null,
    indexable: raw.indexable !== false,
    followLinks: raw.followLinks !== false,
    seoH1: raw.seoH1 ?? null,
    seoIntro: raw.seoIntro ?? null,
    seoContent: raw.seoContent ?? null,
    seoKeywords: parseJsonStringArray(raw.seoKeywords),
    faq: parseFaq(raw.seoFaq),
    ogTitle: raw.ogTitle ?? null,
    ogDescription: raw.ogDescription ?? null,
    ogImage: raw.ogImage ?? null,
    imageAlt: raw.imageAlt ?? null,
  };
}

function parseJsonStringArray(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseFaq(value?: string): { question: string; answer: string }[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is { question: string; answer: string } =>
        typeof item?.question === "string" && typeof item?.answer === "string" && item.question.trim() !== "" && item.answer.trim() !== ""
    );
  } catch {
    return [];
  }
}

/* ─── Fetch helpers ─────────────────────────────────────────────────── */

/**
 * Opt-in short-TTL caching for PUBLIC catalogue reads (home, product pages, home widgets, public reviews). OFF unless PUBLIC_CACHE_SECONDS > 0,
 * so production behaviour is unchanged until a rollout is explicitly approved. Never applied in the browser, to
 * non-GET calls, or to anything outside the public catalogue (cart, checkout, account, admin stay uncached).
 * Freshness: entries expire after N seconds and can be flushed immediately with revalidateTag("catalogue").
 * See docs/seo/CACHING_PLAN.md.
 */
function publicCacheSeconds(path: string, init?: RequestInit): number {
  if (typeof window !== "undefined" || (init?.method && init.method !== "GET")) return 0;
  if (!/^\/(catalogue\/(products|categories|brands|concerns|seo\/redirect|sitemap-data)|content\/articles|homepage\/(featured|best-sellers)|reviews\/product\/[^/?]+(?:\/rating)?)(?:[/?]|$)/.test(path)) return 0;
  const seconds = Number(process.env.PUBLIC_CACHE_SECONDS);
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 600) : 0;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const url = `${getApiBase()}${path}`;
  const cacheSeconds = publicCacheSeconds(path, init);
  const criticalCatalogue = typeof window === "undefined" && process.env.NODE_ENV === "production" && /^\/catalogue\/(products|categories|brands)(?:[/?]|$)/.test(path);
  try {
    const res = await fetch(url, {
      ...(cacheSeconds > 0 ? { next: { revalidate: cacheSeconds, tags: ["catalogue"] } } : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(5000),
      ...init,
    });
    if (!res.ok) {
      if (criticalCatalogue && res.status >= 500) throw new Error(`Catalogue HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error(`[API FETCH] Exception for ${url}:`, err.message);
    if (criticalCatalogue) throw err;
    return null;
  }
}

/* ─── Public API ────────────────────────────────────────────────────── */

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export async function fetchPaginatedProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  concern?: string;
  sort?: string;
}): Promise<{ products: ProductSummary[]; meta: PaginationMeta }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("q", params.search);
  if (params?.brand) query.set("brand", params.brand);
  if (params?.category) query.set("category", params.category);
  if (params?.concern) query.set("concern", params.concern);
  if (params?.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const raw = await apiFetch<any>(`/catalogue/products${qs ? `?${qs}` : ""}`);

  if (raw && Array.isArray(raw.data)) {
    return {
      products: raw.data.map(transformProduct),
      meta: raw.meta || {
        page: params?.page || 1,
        limit: params?.limit || 24,
        total: raw.data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  } else if (Array.isArray(raw)) {
    return {
      products: raw.map(transformProduct),
      meta: {
        page: 1,
        limit: raw.length,
        total: raw.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  /* Development-only fallback. Production must fail closed rather than expose
     stale fixtures after an API error or a real 404. */
  if (!MOCK_FALLBACK_ENABLED) {
    return {
      products: [],
      meta: { page: params?.page || 1, limit: params?.limit || 24, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
  }

  /* Fallback: filter local mock data */
  let result = [...localProducts];
  if (params?.brand) result = result.filter((p) => p.brand.toLowerCase().replace(/\s+/g, "-") === params.brand);
  if (params?.category) result = result.filter((p) => p.category.toLowerCase() === params.category);
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  const p = params?.page || 1;
  const l = params?.limit || 24;
  const total = result.length;
  const totalPages = Math.ceil(total / l) || 1;
  const sliced = result.slice((p - 1) * l, p * l);

  return {
    products: sliced,
    meta: {
      page: p,
      limit: l,
      total,
      totalPages,
      hasNextPage: p < totalPages,
      hasPreviousPage: p > 1,
    },
  };
}

export async function fetchProducts(params?: {
  brand?: string;
  category?: string;
  concern?: string;
  limit?: number;
}): Promise<ProductSummary[]> {
  const res = await fetchPaginatedProducts({ ...params, limit: params?.limit || 100 });
  return res.products;
}

export type HomepageCategoryRow = {
  key: string;
  title: string;
  subtitle: string;
  slug: string;
  products: ProductSummary[];
};

export const HOMEPAGE_CATEGORY_DEFINITIONS = [
  {
    key: "creatine",
    title: "Créatine Monohydrate",
    subtitle: "Développez votre force et votre puissance musculaire avec nos créatines pures et micronisées.",
    slug: "creatine",
    matches: ["creatine", "créatine", "creatine-monohydrate"]
  },
  {
    key: "gainers-proteines",
    title: "Mass Gainer & Prise de Masse",
    subtitle: "Formules caloriques et glucides complexes pour une prise de masse rapide et propre.",
    slug: "gainers-proteines",
    matches: ["gainers-proteines"]
  },
  {
    key: "whey-proteine",
    title: "Whey Protéine & Isolate",
    subtitle: "Isolates et concentrées de haute pureté pour le développement musculaire sec et la récupération.",
    slug: "whey-proteine",
    matches: ["whey-proteine", "whey-isolate"]
  },
  {
    key: "ashwagandha",
    title: "Ashwagandha & Sommeil",
    subtitle: "Ashwagandha KSM-66 et formules adaptogènes pour le stress, le sommeil et la vitalité.",
    slug: "ashwagandha",
    matches: ["ashwagandha", "sommeil-stress"]
  },
  {
    key: "vitamines",
    title: "Vitamines & Immunité",
    subtitle: "Vitamines C, D3+K2 et complexes multivitaminés pour une vitalité quotidienne optimale.",
    slug: "vitamines",
    matches: ["vitamines", "multivitamines"]
  },
  {
    key: "pre-workout",
    title: "Pre-Workout & Énergie",
    subtitle: "Boosters d'entraînement puissants pour une énergie explosive et une congestion maximale.",
    slug: "pre-workout",
    matches: ["pre-workout"]
  },
  {
    key: "bcaa-eaa",
    title: "BCAA & Acides Aminés",
    subtitle: "BCAA et acides aminés : comparez les formules et conseils d’utilisation.",
    slug: "bcaa",
    matches: ["bcaa", "eaa", "beta-alanine", "citrulline"]
  },
  {
    key: "mineraux",
    title: "Zinc & Magnésium",
    subtitle: "Zinc et magnésium : comparez les dosages et formats indiqués.",
    slug: "zinc",
    matches: ["zinc", "magnesium", "magnésium"]
  },
  {
    key: "omega-3",
    title: "Omega 3 & Acides Gras",
    subtitle: "Acides gras essentiels EPA & DHA pour la santé cardiovasculaire, cérébrale et articulaire.",
    slug: "omega-3",
    matches: ["omega-3"]
  },
  {
    key: "minceur",
    title: "Minceur & Brûleurs",
    subtitle: "L-Carnitine et formules thermogéniques pour la définition musculaire et le métabolisme.",
    slug: "l-carnitine",
    matches: ["l-carnitine", "bruleurs-de-graisse"]
  }
];

export async function fetchHomepageCategoryRows(): Promise<HomepageCategoryRow[]> {
  const rows = await Promise.all(
    HOMEPAGE_CATEGORY_DEFINITIONS.map(async (def) => {
      let categoryProducts: ProductSummary[] = [];

      for (const slugMatch of def.matches) {
        const res = await fetchPaginatedProducts({ category: slugMatch, limit: 5 });
        if (res.products && res.products.length > 0) {
          categoryProducts = res.products.slice(0, 5);
          break;
        }
      }

      if (categoryProducts.length === 0 && MOCK_FALLBACK_ENABLED) {
        const fallback = localProducts.filter((p) =>
          def.matches.some((m) => p.category.toLowerCase().includes(m))
        );
        categoryProducts = (fallback.length ? fallback : localProducts).slice(0, 5);
      }

      return {
        key: def.key,
        title: def.title,
        subtitle: def.subtitle,
        slug: def.slug,
        products: categoryProducts.slice(0, 5),
      };
    })
  );

  return rows;
}

/* ─── Advertising landing page ───────────────────────────────────────── */

export type LandingProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  benefit: string;
  description: string;
  usage: string;
  images: { url: string; alt: string }[];
  variant: { id: string; label: string; priceMillimes: number; stock: number };
};

/** Live catalogue read for a landing page. Price and stock always come from the database. */
export async function fetchLandingProduct(slug: string): Promise<LandingProduct | null> {
  const raw = await apiFetch<RawProduct>(`/catalogue/products/${slug}`);
  const variant = raw?.variants?.[0];
  if (!raw || !variant) return null;
  const urls = [raw.image, ...(raw.images ?? []).sort((a, b) => a.position - b.position).map((i) => i.url)].filter(Boolean) as string[];
  const unique = [...new Set(urls.map(resolveImageUrl))];
  const alt = raw.imageAlt || `${raw.name} - ${raw.brand?.name ?? ""}`.trim();
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    brand: raw.brand?.name ?? "",
    benefit: raw.benefit ?? "",
    description: raw.description ?? "",
    usage: raw.usage ?? "",
    images: unique.map((url, i) => ({ url, alt: i === 0 ? alt : `${alt} - Vue ${i + 1}` })),
    variant: { id: variant.id, label: variant.label, priceMillimes: variant.priceMillimes, stock: variant.stock },
  };
}

export type LandingOrderResponse = {
  id: string;
  reference: string;
  totalMillimes: number;
  subtotalMillimes: number;
  deliveryFeeMillimes: number;
  quantity: number;
  eventId: string;
  replayed: boolean;
};

export type LandingOrderPayload = {
  checkoutSessionId: string;
  landingId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  customerName: string;
  phone: string;
  gouvernorat: string;
  fullAddress: string;
  purchaseEventId: string;
  sourceUrl?: string;
  contactConsent?: boolean;
  privacyNoticeShown?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
  referrerHost?: string;
  fbp?: string;
  fbc?: string;
};

/**
 * One-step order. Safe to retry: the server is idempotent per checkoutSessionId, so a retry after a lost
 * response returns the original order. `retryable` tells the UI the outcome is unknown (network/5xx).
 */
export async function createLandingOrder(
  payload: LandingOrderPayload,
): Promise<{ order: LandingOrderResponse; error: null; retryable: false } | { order: null; error: string; retryable: boolean; status: number }> {
  const cookie = (name: string) => (typeof document === "undefined" ? undefined : document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1]);
  const body = { ...payload, fbp: payload.fbp ?? cookie("_fbp"), fbc: payload.fbc ?? cookie("_fbc") };
  try {
    const res = await fetch("/api/v1/orders/landing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.id) return { order: json as LandingOrderResponse, error: null, retryable: false };
    const message = Array.isArray(json?.message) ? json.message.join(" ") : typeof json?.message === "string" ? json.message : "";
    return { order: null, error: message, retryable: res.status >= 500 || res.status === 409 && /en cours/i.test(message), status: res.status };
  } catch {
    return { order: null, error: "", retryable: true, status: 0 };
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductSummary | null> {
  const raw = await apiFetch<RawProduct>(`/catalogue/products/${slug}`);
  if (raw) return transformProduct(raw);

  return MOCK_FALLBACK_ENABLED ? localProducts.find((p) => p.slug === slug) ?? null : null;
}

/* ─── Homepage merchandising ─────────────────────────────────────────── */

export type FeaturedProduct = {
  config: {
    headline: string | null;
    description: string | null;
    bullets: string[];
    imageUrl: string | null;
    ctaLabel: string | null;
    secondaryCtaLabel: string | null;
    secondaryCtaUrl: string | null;
  };
  product: ProductSummary;
};

type RawFeatured = {
  config: FeaturedProduct["config"];
  product: {
    id: string; slug: string; name: string; benefit: string | null; image: string | null; imageAlt: string | null;
    brand: { name: string; slug: string }; category: { name: string; slug: string };
    variants: { label: string; priceMillimes: number }[]; inStock: boolean;
  };
};

/** Live featured product (price/stock/image come from the catalogue; copy from the admin config). */
export async function fetchFeaturedProduct(): Promise<FeaturedProduct | null> {
  const raw = await apiFetch<RawFeatured | null>("/homepage/featured");
  if (!raw || !raw.product) return null;
  const p = raw.product;
  const summary = transformProduct({
    id: p.id,
    slug: p.slug,
    name: p.name,
    benefit: p.benefit,
    image: p.image,
    imageAlt: p.imageAlt,
    brand: { id: "", name: p.brand.name, slug: p.brand.slug },
    category: { id: "", name: p.category.name, slug: p.category.slug },
    variants: p.variants.map((v, i) => ({ id: String(i), label: v.label, priceMillimes: v.priceMillimes, stock: p.inStock ? 1 : 0 })),
  });
  return { config: raw.config, product: { ...summary, inStock: p.inStock } };
}

/**
 * One selectable entry of the homepage "Les petits prix par catégorie" module. The product carries exactly ONE size:
 * the cheapest purchasable variant, which is both the price shown and the line added to the cart.
 */
export type CheapestByCategoryEntry = {
  categoryName: string;
  categorySlug: string;
  eligibleCount: number;
  /** True only when at least two eligible products were compared, so "lowest price" is a proven statement. */
  cheapestProven: boolean;
  /** Size label that is safe to display (null when the catalogue label contradicts the product name). */
  displaySize: string | null;
  product: ProductSummary;
};

type RawCheapest = {
  category: { name: string; slug: string };
  eligibleCount: number;
  cheapestProven: boolean;
  product: {
    id: string; slug: string; name: string; benefit: string | null; image: string; imageAlt: string | null;
    brand: { name: string; slug: string }; category: { name: string; slug: string };
    variant: { id: string; label: string; priceMillimes: number; stock: number };
    displaySize: string | null;
  };
};

/** Cheapest genuinely purchasable product of each main category (live catalogue; never cached). */
export async function fetchCheapestByCategory(): Promise<CheapestByCategoryEntry[]> {
  const raw = await apiFetch<RawCheapest[]>("/homepage/cheapest-by-category");
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => e?.product?.variant && e.product.variant.priceMillimes > 0 && e.product.image)
    .map((e) => ({
      categoryName: e.category.name,
      categorySlug: e.category.slug,
      eligibleCount: e.eligibleCount,
      cheapestProven: e.cheapestProven,
      displaySize: e.product.displaySize,
      product: transformProduct({
        id: e.product.id,
        slug: e.product.slug,
        name: e.product.name,
        benefit: e.product.benefit,
        image: e.product.image,
        imageAlt: e.product.imageAlt,
        brand: { id: "", name: e.product.brand.name, slug: e.product.brand.slug },
        category: { id: "", name: e.product.category.name, slug: e.product.category.slug },
        variants: [e.product.variant],
      }),
    }));
}

/** Top products by real units sold; empty until enough genuine sales exist. */
export async function fetchBestSellers(limit = 8): Promise<ProductSummary[]> {
  const raw = await apiFetch<RawProduct[]>(`/homepage/best-sellers?limit=${limit}`);
  return Array.isArray(raw) ? raw.map(transformProduct) : [];
}

export type BrandListItem = {
  id?: string;
  name: string;
  slug: string;
  logo?: string | null;
  image?: string | null;
  tagline?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  origin?: string | null;
  featured?: boolean;
  productCount?: number;
};

export async function fetchBrands(): Promise<BrandListItem[]> {
  const raw = await apiFetch<BrandListItem[]>("/catalogue/brands");
  if (raw) return raw;

  if (!MOCK_FALLBACK_ENABLED) return [];
  /* Fallback: derive from local products */
  const brandSet = [...new Set(localProducts.map((p) => p.brand))].sort();
  return brandSet.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }));
}

export type BrandDetail = {
  name: string;
  slug: string;
  image?: string | null;
  logo?: string | null;
  origin?: string | null;
  featured?: boolean;
  tagline?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  indexable?: boolean;
  followLinks?: boolean;
  seoH1?: string | null;
  seoIntro?: string | null;
  seoContent?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  imageAlt?: string | null;
};

export async function fetchBrandBySlug(slug: string): Promise<BrandDetail | null> {
  return apiFetch(`/catalogue/brands/${slug}`);
}

export type CategoryDetail = { id: string; name: string; slug: string; parentId?: string | null; parent?: { name: string; slug: string } | null; shortDescription?: string | null; description?: string | null; image?: string | null; heroImage?: string | null; seoTitle?: string | null; seoDescription?: string | null; seoH1?: string | null; seoIntro?: string | null; seoContent?: string | null; canonicalUrl?: string | null; indexable?: boolean; followLinks?: boolean; ogTitle?: string | null; ogDescription?: string | null; ogImage?: string | null; imageAlt?: string | null; children?: { name: string; slug: string }[] };

export async function fetchCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  return apiFetch<CategoryDetail>(`/catalogue/categories/${slug}`);
}

export async function fetchSeoRedirect(path: string): Promise<string | null> {
  const result = await apiFetch<{ newPath: string }>(`/catalogue/seo/redirect?path=${encodeURIComponent(path)}`);
  return result?.newPath || null;
}

export async function fetchCategories(): Promise<{ name: string; slug: string }[]> {
  const raw = await apiFetch<{ name: string; slug: string }[]>("/catalogue/categories");
  if (raw) return raw;

  if (!MOCK_FALLBACK_ENABLED) return [];
  /* Fallback: derive from local products */
  const catSet = [...new Set(localProducts.map((p) => p.category))].sort();
  return catSet.map((name) => ({ name, slug: name.toLowerCase() }));
}

export type CategoryDepartment = {
  key: string;
  name: string;
  slug: string;
  totalCount: number;
  children: { name: string; slug: string; count: number }[];
};

type RawCategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  _count?: { products: number };
};

/**
 * The two real top-level catalogue departments (Nutrition Sportive,
 * Compléments Alimentaires), each with their real subcategories and live
 * product counts. Single-product orphan categories with no children
 * (leftover taxonomy leaves) are dropped rather than shown as departments.
 */
export async function fetchCategoryDepartments(): Promise<CategoryDepartment[]> {
  const raw = await apiFetch<RawCategoryWithCount[]>("/catalogue/categories");
  if (!raw) return [];

  const roots = raw.filter((c) => !c.parentId);
  return roots
    .map((root) => {
      const children = raw
        .filter((c) => c.parentId === root.id)
        .map((c) => ({ name: c.name, slug: c.slug, count: c._count?.products ?? 0 }))
        .sort((a, b) => b.count - a.count);
      const directCount = root._count?.products ?? 0;
      const totalCount = directCount + children.reduce((sum, c) => sum + c.count, 0);
      return { key: root.slug, name: root.name, slug: root.slug, totalCount, children };
    })
    .filter((d) => d.children.length > 0)
    .sort((a, b) => b.totalCount - a.totalCount);
}

export type ShopDepartment = {
  key: string;
  label: string;
  href: string;
  thumbnail: string | null;
  categories: { name: string; slug: string; count: number }[];
  products: { slug: string; name: string; image: string; priceMillimes: number }[];
};

const NAV_CACHE: RequestInit = { cache: "force-cache", next: { revalidate: 300, tags: ["catalogue"] } };

/**
 * Mega-menu data: the six shop departments resolved against the live
 * catalogue (real category names, counts and three products each).
 * Cached five minutes because it renders in the header of every page.
 * Departments whose categories no longer exist are dropped.
 */
async function loadShopDepartments(): Promise<ShopDepartment[]> {
  const raw = await apiFetch<RawCategoryWithCount[]>("/catalogue/categories", NAV_CACHE);
  if (!raw) return [];
  const bySlug = new Map(raw.map((c) => [c.slug, c]));

  const departments = await Promise.all(
    SHOP_DEPARTMENTS.map(async (dept): Promise<ShopDepartment | null> => {
      const categories = dept.slugs
        .map((slug) => bySlug.get(slug))
        .filter((c): c is RawCategoryWithCount => Boolean(c))
        .map((c) => ({ name: c.name, slug: c.slug, count: c._count?.products ?? 0 }));
      if (categories.length === 0) return null;

      const res = await apiFetch<{ data: RawProduct[] }>(`/catalogue/products?category=${categories[0].slug}&limit=3`, NAV_CACHE);
      const products = (res?.data ?? []).map(transformProduct).map((p) => ({
        slug: p.slug,
        name: p.name,
        image: p.image,
        priceMillimes: p.priceMillimes,
      }));
      return { key: dept.key, label: dept.label, href: dept.href, thumbnail: products[0]?.image ?? null, categories, products };
    })
  );
  return departments.filter((d): d is ShopDepartment => d !== null);
}

export type BrandRayonStat = { slug: string; name: string; count: number; inStock: number };
export type BrandRayon = {
  slug: string;
  title: string;
  linkLabel: string;
  sport: boolean;
  brandCount: number;
  productCount: number;
  brands: BrandRayonStat[];
};

const BRAND_RAYONS = [
  { slug: "whey-proteine", title: "Whey protéine", linkLabel: "whey protéine", sport: true },
  { slug: "whey-isolate", title: "Whey isolate", linkLabel: "whey isolate", sport: true },
  { slug: "creatine", title: "Créatine", linkLabel: "créatine", sport: true },
  { slug: "pre-workout", title: "Pré-workout", linkLabel: "pré-workout", sport: true },
  { slug: "gainers-proteines", title: "Mass gainers", linkLabel: "mass gainers", sport: true },
  { slug: "bruleurs-de-graisse", title: "Brûleurs de graisse", linkLabel: "brûleurs de graisse", sport: true },
  { slug: "bcaa", title: "BCAA", linkLabel: "BCAA", sport: true },
  { slug: "omega-3", title: "Oméga 3", linkLabel: "oméga 3", sport: false },
] as const;

const BRANDS_CACHE: RequestInit = { cache: "force-cache", next: { revalidate: 300 } };

/**
 * Brands per shelf, aggregated from the live catalogue (every product of each
 * rayon, paged 100 at a time). Brands with the most products in stock first.
 */
export async function fetchBrandRayons(): Promise<BrandRayon[]> {
  return Promise.all(
    BRAND_RAYONS.map(async (rayon): Promise<BrandRayon> => {
      const products: ProductSummary[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await apiFetch<{ data: RawProduct[]; meta?: PaginationMeta }>(
          `/catalogue/products?category=${rayon.slug}&limit=100&page=${page}`,
          BRANDS_CACHE
        );
        if (!res) break;
        products.push(...res.data.map(transformProduct));
        totalPages = res.meta?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages);

      const byBrand = new Map<string, BrandRayonStat>();
      for (const p of products) {
        const slug = p.brandSlug;
        if (!slug) continue;
        const entry = byBrand.get(slug) ?? { slug, name: p.brand, count: 0, inStock: 0 };
        entry.count += 1;
        if (p.inStock) entry.inStock += 1;
        byBrand.set(slug, entry);
      }
      const brands = [...byBrand.values()].sort((a, b) => b.inStock - a.inStock || b.count - a.count || a.name.localeCompare(b.name));
      return { slug: rayon.slug, title: rayon.title, linkLabel: rayon.linkLabel, sport: rayon.sport, brandCount: brands.length, productCount: products.length, brands };
    })
  );
}

/**
 * The header renders on every page, so a catalogue outage (or an unreachable
 * API during `next build`) must degrade to a plain "Boutique" link, never fail the page.
 */
export async function fetchShopDepartments(): Promise<ShopDepartment[]> {
  try {
    return await loadShopDepartments();
  } catch {
    return [];
  }
}

export async function fetchProductReviews(productId: string): Promise<PublicReview[]> {
  return (await apiFetch<PublicReview[]>(`/reviews/product/${productId}`, undefined)) ?? [];
}

export async function fetchProductRating(productId: string): Promise<ProductRating> {
  return (await apiFetch<ProductRating>(`/reviews/product/${productId}/rating`, undefined)) ?? { average: 0, count: 0 };
}

export async function fetchConcerns(): Promise<{ name: string; slug: string }[]> {
  const raw = await apiFetch<{ name: string; slug: string }[]>("/catalogue/concerns");
  if (raw) return raw;

  if (!MOCK_FALLBACK_ENABLED) return [];
  /* Fallback: derive from local products */
  const concernSet = [...new Set(localProducts.flatMap((p) => p.concerns))].sort();
  return concernSet.map((name) => ({ name, slug: name.toLowerCase().replace(/[\s&]+/g, "-") }));
}

/**
 * Order creation surfaces the backend's real validation message (e.g. "Produit
 * introuvable — veuillez actualiser votre panier") rather than a generic
 * failure string, since that's the one message a checkout customer can
 * actually act on — a plain apiFetch<T>() would discard it and return null.
 */
export async function createExpressOrder(data: {
  userId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gouvernorat: string;
  fullAddress: string;
  deliveryNote?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  checkoutSessionId?: string;
  loyaltyPointsToRedeem?: number;
  shippingFeeMillimes?: number;
  items: { productId?: string; productVariantId?: string; quantity: number; priceMillimes: number }[];
}): Promise<{ order: any; error: null } | { order: null; error: string }> {
  // Extract Meta cookies if present in browser
  let fbp = data.fbp;
  let fbc = data.fbc;
  if (typeof document !== "undefined") {
    if (!fbp) {
      const matchFbp = document.cookie.match(/(?:^|; )_fbp=([^;]*)/);
      if (matchFbp) fbp = decodeURIComponent(matchFbp[1]);
    }
    if (!fbc) {
      const matchFbc = document.cookie.match(/(?:^|; )_fbc=([^;]*)/);
      if (matchFbc) fbc = decodeURIComponent(matchFbc[1]);
    }
  }
  const eventSourceUrl =
    data.eventSourceUrl || (typeof window !== "undefined" ? window.location.href : undefined);

  const payload = {
    ...data,
    fbp,
    fbc,
    eventSourceUrl,
  };

  const url = `${getApiBase()}/orders`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message = typeof json?.message === "string" ? json.message : "Une erreur s'est produite lors de la validation de la commande. Veuillez réessayer.";
      console.error(`[API FETCH] HTTP ${res.status} error for ${url}:`, message);
      return { order: null, error: message };
    }
    return { order: json, error: null };
  } catch (err: any) {
    console.error(`[API FETCH] Exception for ${url}:`, err.message);
    return { order: null, error: "Impossible de communiquer avec le serveur de commande." };
  }
}

/* ─── Diagnostic ────────────────────────────────────────────────────── */

export type DiagnosticDomain = "SKIN" | "HAIR";

export type DiagnosticOption = { id: string; value: string; label: string; position: number };
export type DiagnosticQuestion = {
  id: string;
  key: string;
  label: string;
  type: "single" | "multi";
  required: boolean;
  position: number;
  options: DiagnosticOption[];
};
export type DiagnosticConfig = {
  domain: DiagnosticDomain;
  questions: DiagnosticQuestion[];
  photoAnalysisEnabled: boolean;
};

export type RoutineRoleItem = {
  role: string;
  slot: "AM" | "PM";
  productId: string;
  name: string;
  slug: string;
  brandName: string;
  priceMillimes: number;
  sizeLabel: string;
  image: string;
  inStock: boolean;
  reason: string;
};

export type RoutineResult = {
  domain: DiagnosticDomain;
  tier: "Essentielle" | "Complète" | "Premium";
  profile: {
    skinType?: string;
    hairType?: string;
    needs: string[];
    sensitivity: "low" | "medium" | "high";
    routineComplexity: "Essentielle" | "Complète" | "Premium";
    budgetMaxMillimes: number | null;
  };
  am: RoutineRoleItem[];
  pm: RoutineRoleItem[];
  unfilledRoles: string[];
  totalMillimes: number;
  itemCount: number;
  redFlag?: boolean;
  redFlagReason?: string | null;
  referralNotice?: string | null;
};

export async function fetchDiagnosticConfig(domain: DiagnosticDomain): Promise<DiagnosticConfig | null> {
  return apiFetch<DiagnosticConfig>(`/diagnostic/config?domain=${domain}`);
}

export async function createDiagnosticSession(domain: DiagnosticDomain): Promise<{ id: string; sessionToken: string | null } | null> {
  return apiFetch(`/diagnostic/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  });
}

export async function saveDiagnosticAnswers(sessionId: string, answers: Record<string, unknown>) {
  return apiFetch(`/diagnostic/session/${sessionId}/answers`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
}

export async function uploadDiagnosticPhoto(
  sessionId: string,
  file: File,
): Promise<{ photoId: string; storageKey: string } | null> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${getApiBase()}/diagnostic/session/${sessionId}/photo`;
  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("uploadDiagnosticPhoto error:", err);
    return null;
  }
}

export async function analyzeDiagnosticPhoto(sessionId: string): Promise<{
  observations: Record<string, string>;
  confidence: Record<string, string>;
  redFlag: boolean;
  redFlagReason: string | null;
} | null> {
  return apiFetch(`/diagnostic/session/${sessionId}/analyze`, {
    method: "POST",
  });
}

export async function fetchDiagnosticResult(sessionId: string): Promise<RoutineResult | null> {
  return apiFetch<RoutineResult>(`/diagnostic/session/${sessionId}/result`, { cache: "no-store" });
}

export async function adjustDiagnosticBudget(sessionId: string, budget: string): Promise<RoutineResult | null> {
  return apiFetch<RoutineResult>(`/diagnostic/session/${sessionId}/adjust-budget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget }),
  });
}

export async function fetchDiagnosticAlternative(
  sessionId: string,
  currentProductId: string,
  role: string,
  preference?: "moins-cher" | "autre-marque" | "autre-texture",
): Promise<
  | { productId: string; slug: string; name: string; brandName: string; priceMillimes: number; sizeLabel: string; image: string; inStock: boolean; reason: string }
  | null
> {
  return apiFetch(`/diagnostic/session/${sessionId}/alternatives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentProductId, role, preference }),
  });
}

// ─── Conversational AI Beauty Advisor API Helpers ────────────────────

export async function createDiagnosticChatSession(domain: "SKIN" | "HAIR" = "SKIN") {
  return apiFetch<any>("/diagnostic/chat/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  });
}

export async function fetchDiagnosticChatSession(sessionToken: string) {
  return apiFetch<any>(`/diagnostic/chat/${sessionToken}`, { cache: "no-store" });
}

export async function sendDiagnosticChatMessage(sessionToken: string, text: string) {
  return apiFetch<any>(`/diagnostic/chat/${sessionToken}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

export async function uploadDiagnosticChatPhoto(sessionToken: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const url = `${getApiBase()}/diagnostic/chat/${sessionToken}/photo`;
  try {
    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("uploadDiagnosticChatPhoto error:", err);
    return null;
  }
}

export async function resetDiagnosticChatSession(sessionToken: string) {
  return apiFetch<any>(`/diagnostic/chat/${sessionToken}/reset`, {
    method: "POST",
  });
}

/* ─── Demande Produit (Sur Commande) ────────────────────────────── */

export interface ProductRequestPayload {
  productId: string;
  fullName: string;
  phone: string;
  email?: string;
  quantity?: number;
  message?: string;
}

export async function submitProductRequest(payload: ProductRequestPayload): Promise<{ data: any; error: string | null }> {
  const url = `${getApiBase()}/product-requests`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message = typeof json?.message === "string" ? json.message : "Une erreur est survenue lors de l'envoi de votre demande.";
      return { data: null, error: message };
    }
    return { data: json, error: null };
  } catch (err: any) {
    return { data: null, error: "Impossible de joindre le serveur. Veuillez vérifier votre connexion." };
  }
}
