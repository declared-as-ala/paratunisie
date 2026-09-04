import type { Metadata } from "next";
import { buildCanonicalUrl, type CanonicalOptions } from "./canonical";
import { COMPANY_CONFIG } from "../config/company";

const DEFAULT_OG_IMAGE = "https://paratunisie.com/logo.png";
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
  const text = (rawDescription || fallback || "").replace(/\s+/g, " ").trim();
  if (text.length > 160) {
    return text.slice(0, 157) + "...";
  }
  return text;
}

export interface BaseMetadataInput {
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
  const canonicalUrl = buildCanonicalUrl(input.path, input.canonicalOptions);

  const ogImage = input.image
    ? input.image.startsWith("http")
      ? input.image
      : `https://paratunisie.com${input.image.startsWith("/") ? "" : "/"}${input.image}`
    : DEFAULT_OG_IMAGE;

  return {
    title: { absolute: formattedTitle },
    description: formattedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: input.keywords,
    robots: input.noindex
      ? {
          index: false,
          follow: true,
          nocache: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: formattedTitle,
      description: formattedDescription,
      url: canonicalUrl,
      siteName: SITE_BRAND,
      locale: "fr_TN",
      type: input.type || "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description: formattedDescription,
      images: [ogImage],
    },
  };
}

export interface ProductMetadataInput {
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

export interface CategoryMetadataInput {
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

  // If query parameters or page > 1 or thin category, mark noindex
  const shouldNoindex = category.indexable === false || category.hasFilters || (category.page && category.page > 1);

  return buildPageMetadata({
    title,
    description,
    path: `/${category.slug}`,
    noindex: Boolean(shouldNoindex),
    canonicalOptions: {
      page: category.page,
      allowPagination: false, // Category canonical points to clean root
    },
    keywords: [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} tunisie`,
      "nutrition sportive tunisie",
      "parapharmacie tunisie",
    ],
  });
}

export interface BrandMetadataInput {
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

export interface ArticleMetadataInput {
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
 */
export function buildShopMetadata(options?: ShopMetadataInput): Metadata {
  const isQueryVariant = Boolean(options?.hasFilters || (options?.page && options.page > 1));

  return buildPageMetadata({
    title: "Boutique en Ligne — Nutrition Sportive & Compléments en Tunisie",
    description:
      "Explorez le catalogue complet de ParaTunisie : protéines, créatines, gainers, vitamines et compléments au meilleur prix en Tunisie.",
    path: "/shop",
    noindex: isQueryVariant,
    canonicalOptions: {
      page: options?.page,
      allowPagination: false, // Root /shop is canonical
    },
    keywords: [
      "boutique nutrition sportive tunisie",
      "achat proteines tunisie",
      "complements alimentaires tunisie",
    ],
  });
}
