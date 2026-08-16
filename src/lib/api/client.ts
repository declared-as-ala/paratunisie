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
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://") || rawImage.startsWith("/assets/")) {
    return rawImage;
  }
  const origin = getApiBase().replace(/\/api\/v\d+\/?$/, "");
  return `${origin}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
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
export type RawVariant = { id: string; label: string; priceMillimes: number; stock: number };

export type RawProduct = {
  id: string;
  slug: string;
  name: string;
  benefit: string;
  description: string;
  usage: string;
  image: string;
  skinTypes: string;
  routineTime: string;
  brand: RawBrand;
  category: RawCategory;
  variants: RawVariant[];
  concerns?: RawConcern[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  indexable?: boolean;
};

/* ─── Transform: Prisma → ProductSummary ────────────────────────────── */

function transformProduct(raw: RawProduct): ProductSummary {
  const sizes = (raw.variants || []).map((v) => ({ label: v.label || raw.name, priceMillimes: v.priceMillimes || 0 }));
  const defaultVariant = raw.variants?.[0];

  return {
    id: raw.id,
    slug: raw.slug,
    brand: raw.brand?.name || "ParaTunisie",
    name: raw.name,
    benefit: raw.benefit || "",
    size: defaultVariant?.label || "",
    priceMillimes: defaultVariant?.priceMillimes || 0,
    category: raw.category?.name || "Parapharmacie",
    concerns: (raw.concerns ?? []).map((c) => c.name),
    skinTypes: parseJsonStringArray(raw.skinTypes),
    image: resolveImageUrl(raw.image),
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
    key: "bebe-maman",
    title: "Bébé & Maman",
    subtitle: "Les essentiels pour prendre soin de bébé et accompagner les mamans au quotidien.",
    slug: "bebe-maman",
    matches: ["bebe-maman", "bebe-maternite", "bebe", "maternite", "bébé"]
  },
  {
    key: "visage",
    title: "Soins du visage",
    subtitle: "Nettoyants, hydratants et soins ciblés pour votre routine quotidienne.",
    slug: "visage",
    matches: ["visage", "soins-visage"]
  },
  {
    key: "cheveux",
    title: "Soins des cheveux",
    subtitle: "Shampooings, soins et solutions capillaires pour tous les besoins.",
    slug: "cheveux",
    matches: ["cheveux", "soins-des-cheveux", "capillaire"]
  },
  {
    key: "corps",
    title: "Soins du corps",
    subtitle: "Hydratation, confort et soin pour prendre soin de votre peau au quotidien.",
    slug: "corps",
    matches: ["corps", "soins-du-corps", "hygiene-corps"]
  },
  {
    key: "solaire",
    title: "Protection solaire",
    subtitle: "Une sélection de protections solaires pour le visage et le corps.",
    slug: "solaire",
    matches: ["solaire", "protection-solaire"]
  },
  {
    key: "hygiene",
    title: "Hygiène au quotidien",
    subtitle: "Les essentiels pour une routine simple, pratique et complète.",
    slug: "hygiene",
    matches: ["hygiene", "hygiene-au-quotidien"]
  },
  {
    key: "complements",
    title: "Compléments alimentaires",
    subtitle: "Découvrez notre sélection de compléments pour accompagner votre bien-être.",
    slug: "complements",
    matches: ["complements-alimentaires", "complements", "nutrition"]
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
  tagline?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  indexable?: boolean;
};

export async function fetchBrandBySlug(slug: string): Promise<BrandDetail | null> {
  return apiFetch(`/catalogue/brands/${slug}`);
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
  items: { productId?: string; productVariantId?: string; quantity: number; priceMillimes: number }[];
}): Promise<{ order: any; error: null } | { order: null; error: string }> {
  const url = `${getApiBase()}/orders`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
