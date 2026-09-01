/**
 * API client for the ParaTunisie NestJS backend.
 * Handles fetching from /api/v1/* endpoints and transforming Prisma responses
 * into the flat ProductSummary shape the frontend expects.
 *
 * Falls back to local mock data when the API is unreachable (e.g. during build).
 */

import type { ProductSummary } from "@/lib/data/products";
import { products as localProducts } from "@/lib/data/products";

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
 */
function resolveImageUrl(rawImage: string | null | undefined): string {
  if (!rawImage) return "/assets/product-tube.webp";
  if (
    rawImage.startsWith("http://") ||
    rawImage.startsWith("https://") ||
    rawImage.startsWith("/assets/") ||
    rawImage.startsWith("/uploads/")
  ) {
    return rawImage;
  }
  if (rawImage.startsWith("uploads/")) {
    return `/${rawImage}`;
  }
  return rawImage;
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
export type RawVariant = { id: string; label: string; priceMillimes: number; stock: number; sku?: string | null };
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
    slug: raw.slug,
    brand: raw.brand?.name || "ParaTunisie",
    name: raw.name,
    benefit: raw.benefit || "",
    size: defaultVariant?.label || "",
    priceMillimes: defaultVariant?.priceMillimes || 0,
    category: raw.category?.name || "Nutrition Sportive",
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

/* ─── Fetch helpers ─────────────────────────────────────────────────── */

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const url = `${getApiBase()}${path}`;
  console.log(`[API FETCH] ${init?.method || "GET"} ${url}`);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
      ...init,
    });
    console.log(`[API FETCH] Response status for ${url}: ${res.status}`);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[API FETCH] HTTP ${res.status} error for ${url}:`, errText);
      return null;
    }
    const json = await res.json();
    console.log(`[API FETCH] Success JSON for ${url}:`, json);
    return json;
  } catch (err: any) {
    console.error(`[API FETCH] Exception for ${url}:`, err.message);
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
    key: "whey-proteine",
    title: "Whey Protéine & Gainers",
    subtitle: "Protéines pures et formules anaboliques pour la construction musculaire et la prise de masse.",
    slug: "whey-proteine",
    matches: ["whey-proteine", "whey", "gainers-proteines", "gainers"]
  },
  {
    key: "pre-workout",
    title: "Pre-Workout & Énergie",
    subtitle: "Boosters d'entraînement puissants pour une énergie explosive et une congestion maximale.",
    slug: "pre-workout",
    matches: ["pre-workout", "boosters-hormonaux", "boosters"]
  },
  {
    key: "vitamines",
    title: "Vitamines & Immunité",
    subtitle: "Vitamines C, D3+K2 et complexes multivitaminés pour une vitalité quotidienne optimale.",
    slug: "vitamines",
    matches: ["vitamines", "multivitamines"]
  },
  {
    key: "bcaa-eaa",
    title: "BCAA & Acides Aminés",
    subtitle: "Soutien anti-catabolique, endurance et récupération musculaire accélérée.",
    slug: "bcaa",
    matches: ["bcaa", "eaa", "beta-alanine", "citrulline"]
  },
  {
    key: "mineraux",
    title: "Zinc & Magnésium",
    subtitle: "Minéraux essentiels pour l'immunité, l'équilibre nerveux et la réduction de la fatigue.",
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
    key: "ashwagandha",
    title: "Ashwagandha & Sommeil",
    subtitle: "Plante adaptogène premium pour réguler le cortisol, réduire le stress et optimiser la récupération.",
    slug: "ashwagandha",
    matches: ["ashwagandha"]
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

      if (categoryProducts.length === 0) {
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

export async function fetchProductBySlug(slug: string): Promise<ProductSummary | null> {
  const raw = await apiFetch<RawProduct>(`/catalogue/products/${slug}`);
  if (raw) return transformProduct(raw);

  /* Fallback: find in local data */
  return localProducts.find((p) => p.slug === slug) ?? null;
}

export async function fetchBrands(): Promise<{ name: string; slug: string }[]> {
  const raw = await apiFetch<{ name: string; slug: string }[]>("/catalogue/brands");
  if (raw) return raw;

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

  /* Fallback: derive from local products */
  const catSet = [...new Set(localProducts.map((p) => p.category))].sort();
  return catSet.map((name) => ({ name, slug: name.toLowerCase() }));
}

export async function fetchProductReviews(productId: string): Promise<PublicReview[]> {
  return (await apiFetch<PublicReview[]>(`/reviews/product/${productId}`, { cache: "no-store" })) ?? [];
}

export async function fetchProductRating(productId: string): Promise<ProductRating> {
  return (await apiFetch<ProductRating>(`/reviews/product/${productId}/rating`, { cache: "no-store" })) ?? { average: 0, count: 0 };
}

export async function fetchConcerns(): Promise<{ name: string; slug: string }[]> {
  const raw = await apiFetch<{ name: string; slug: string }[]>("/catalogue/concerns");
  if (raw) return raw;

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
