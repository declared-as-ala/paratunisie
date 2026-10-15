import type { Metadata } from "next";
import { buildCanonicalUrl, type CanonicalOptions } from "./canonical";
import { COMPANY_CONFIG } from "../config/company";

const DEFAULT_OG_IMAGE = "https://paratunisie.com/assets/logo.png";
const SITE_BRAND = "ParaTunisie";

/**
 * Normalizes a title to prevent duplicate "| ParaTunisie" branding
 * and ensures clean display length.
 */
export function formatSeoTitle(rawTitle: string): string {
  if (!rawTitle) return `${COMPANY_CONFIG.commercialName} | ${SITE_BRAND}`;

  let title = rawTitle.replace(/\s+/g, " ").trim();

  // Strip duplicate or existing brand occurrences
  title = title
    .replace(/\s*(?:\||-)\s*ParaTunisie.*$/gi, "")
    .replace(/ParaTunisie/gi, "")
    .replace(/\s*\|\s*$/, "")
    .trim();

  return `${title} | ${SITE_BRAND}`;
}

/**
 * Normalizes a meta description to prevent truncated or empty descriptions.
 */
export function formatSeoDescription(rawDescription?: string | null, fallback?: string): string {
  const text = (rawDescription || fallback || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length > 160) {
    return text.slice(0, 157) + "...";
  }
  return text;
}

export interface StoredSeo {
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  imageAlt?: string | null;
  followLinks?: boolean;
  seoKeywords?: string[] | string;
}

export interface BaseMetadataInput extends StoredSeo {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  noindex?: boolean;
  canonicalOptions?: CanonicalOptions;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  type?: "website" | "article";
}

/**
 * Shared base builder for Next.js Metadata.
 */
export function buildPageMetadata(input: BaseMetadataInput): Metadata {
  const formattedTitle = formatSeoTitle(input.title);
  const formattedDescription = formatSeoDescription(input.description, COMPANY_CONFIG.commercialName);
  const canonicalUrl = buildCanonicalUrl(input.canonicalUrl || input.path, input.canonicalOptions);
  let keywords = input.keywords;
  if (Array.isArray(input.seoKeywords) && input.seoKeywords.length) keywords = input.seoKeywords;
  else if (typeof input.seoKeywords === 'string' && input.seoKeywords) {
    try { const parsed = JSON.parse(input.seoKeywords); if (Array.isArray(parsed) && parsed.length) keywords = parsed; } catch { keywords = input.seoKeywords.split(',').map((value) => value.trim()).filter(Boolean); }
  }

  const sourceImage = input.ogImage || input.image;
  const ogImage = sourceImage
    ? sourceImage.startsWith("http")
      ? sourceImage
      : `https://paratunisie.com${sourceImage.startsWith("/") ? "" : "/"}${sourceImage}`
    : DEFAULT_OG_IMAGE;

  return {
    title: { absolute: formattedTitle },
    description: formattedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords,
    robots: input.noindex
      ? {
          index: false,
          follow: input.followLinks !== false,
          nocache: true,
          googleBot: {
            index: false,
            follow: input.followLinks !== false,
          },
        }
      : {
          index: true,
          follow: input.followLinks !== false,
          googleBot: {
            index: true,
            follow: input.followLinks !== false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: input.ogTitle || formattedTitle,
      description: formatSeoDescription(input.ogDescription) || formattedDescription,
      url: canonicalUrl,
      siteName: SITE_BRAND,
      locale: "fr_TN",
      type: input.type || "website",
      images: [
        {
          url: ogImage,
          alt: input.imageAlt || input.title,
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.ogTitle || formattedTitle,
      description: formatSeoDescription(input.ogDescription) || formattedDescription,
      images: [ogImage],
    },
  };
}

export interface ProductMetadataInput extends StoredSeo {
  name: string;
  slug: string;
  brandName?: string | null;
  categoryName?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  image?: string | null;
  indexable?: boolean;
  inStock?: boolean;
}

/**
 * Builds metadata for Product PDP pages.
 */
export function buildProductMetadata(product: ProductMetadataInput): Metadata {
  const brandPart = product.brandName ? ` ${product.brandName}` : "";
  const defaultTitle = `${product.name}${brandPart} en Tunisie`;
  const title = product.seoTitle || defaultTitle;

  const defaultDesc = `Achetez ${product.name}${brandPart} au meilleur prix en Tunisie chez ParaTunisie. Livraison rapide 24–48h et paiement à la livraison.`;
  const description = product.seoDescription || product.description || defaultDesc;

  return buildPageMetadata({
    ...product,
    title,
    description,
    path: `/produits/${product.slug}`,
    image: product.image,
    noindex: product.indexable === false,
    keywords: [
      product.name.toLowerCase(),
      product.brandName?.toLowerCase() || "",
      product.categoryName?.toLowerCase() || "",
      "tunisie",
      "prix tunisie",
      "acheter en ligne",
    ].filter(Boolean),
  });
}

export interface CategoryMetadataInput extends StoredSeo {
  name: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string | null;
  indexable?: boolean;
  page?: number;
  hasFilters?: boolean;
}

/**
 * Builds metadata for Category PLP pages.
 */
export function buildCategoryMetadata(category: CategoryMetadataInput): Metadata {
  const defaultTitle = `${category.name} en Tunisie — Prix & Achat`;
  const title = category.seoTitle || defaultTitle;

  const defaultDesc = `Découvrez notre sélection de ${category.name.toLowerCase()} en Tunisie chez ParaTunisie. Produits 100% authentiques, livraison 24-48h.`;
  const description = category.seoDescription || category.description || defaultDesc;

  // Filter variants are noindex; real pagination has its own canonical.
  const shouldNoindex = category.indexable === false || category.hasFilters;

  return buildPageMetadata({
    ...category,
    title: `${title.replace(/\s*\|\s*ParaTunisie\s*$/i, "")}${category.page && category.page > 1 ? ` — Page ${category.page}` : ""}`,
    description,
    path: `/${category.slug}`,
    noindex: Boolean(shouldNoindex),
    canonicalOptions: {
      page: category.hasFilters ? undefined : category.page,
      allowPagination: !category.hasFilters,
    },
    keywords: [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} tunisie`,
      "nutrition sportive tunisie",
      "parapharmacie tunisie",
    ],
  });
}

export interface BrandMetadataInput extends StoredSeo {
  name: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string | null;
  logo?: string | null;
  indexable?: boolean;
}

/**
 * Builds metadata for Brand pages.
 */
export function buildBrandMetadata(brand: BrandMetadataInput): Metadata {
  const defaultTitle = `Produits ${brand.name} en Tunisie — Achat Officiel`;
  const title = brand.seoTitle || defaultTitle;

  const defaultDesc = `Retrouvez tous les produits de la marque officielle ${brand.name} en Tunisie chez ParaTunisie. Livraison express partout en Tunisie.`;
  const description = brand.seoDescription || brand.description || defaultDesc;

  return buildPageMetadata({
    ...brand,
    title,
    description,
    path: `/marques/${brand.slug}`,
    image: brand.logo,
    noindex: brand.indexable === false,
    keywords: [
      brand.name.toLowerCase(),
      `marque ${brand.name.toLowerCase()} tunisie`,
      "produits officiels tunisie",
    ],
  });
}

export interface ArticleMetadataInput extends StoredSeo {
  title: string;
  slug: string;
  metaDescription?: string | null;
  excerpt?: string | null;
  image?: string | null;
  indexable?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
}

/**
 * Builds metadata for Editorial / Article pages.
 */
export function buildArticleMetadata(article: ArticleMetadataInput): Metadata {
  return buildPageMetadata({
    ...article,
    title: article.title,
    description: article.metaDescription || article.excerpt,
    path: `/conseils/${article.slug}`,
    image: article.image,
    noindex: article.indexable === false,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    keywords: article.tags || ["conseils santé", "nutrition sportive", "tunisie"],
  });
}

export interface ShopMetadataInput {
  page?: number;
  hasFilters?: boolean;
}

/**
 * Builds metadata for the /shop catalogue root.
 * - Sequential pagination (/shop?page=2) is index,follow with self-referencing canonical.
 * - Faceted/filtered variants (hasFilters: true) are noindex,follow and canonicalize to clean /shop.
 */
export function buildShopMetadata(options?: ShopMetadataInput): Metadata {
  const page = options?.page || 1;
  const hasUnsafeFilters = Boolean(options?.hasFilters);
  const pageSuffix = page > 1 ? ` — Page ${page}` : "";

  return buildPageMetadata({
    title: `Boutique en Ligne — Nutrition Sportive & Compléments en Tunisie${pageSuffix}`,
    description:
      `Explorez le catalogue complet de ParaTunisie : protéines, créatines, gainers, vitamines et compléments au meilleur prix en Tunisie.${page > 1 ? ` Page ${page}.` : ""}`,
    path: "/shop",
    noindex: hasUnsafeFilters,
    canonicalOptions: {
      page: hasUnsafeFilters ? undefined : page,
      allowPagination: !hasUnsafeFilters, // Self-referencing canonical for /shop?page=N
    },
    keywords: [
      "boutique nutrition sportive tunisie",
      "achat proteines tunisie",
      "complements alimentaires tunisie",
    ],
  });
}
