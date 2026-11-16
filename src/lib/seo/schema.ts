import { COMPANY_CONFIG } from "../config/company";
import { buildCanonicalUrl } from "./canonical";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Builds standard Organization schema with verified company facts.
 * Strictly adheres to Schema.org Organization specifications without unsupported LocalBusiness properties.
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${COMPANY_CONFIG.siteUrl}/#organization`,
    name: COMPANY_CONFIG.name,
    legalName: COMPANY_CONFIG.legalName,
    alternateName: [...COMPANY_CONFIG.alternateNames],
    url: COMPANY_CONFIG.siteUrl,
    logo: {
      "@type": "ImageObject",
      "@id": `${COMPANY_CONFIG.siteUrl}/#logo`,
      url: COMPANY_CONFIG.logoUrl,
      contentUrl: COMPANY_CONFIG.logoUrl,
      caption: COMPANY_CONFIG.name,
    },
    description:
      "Plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires, le bien-être et une sélection de produits de parapharmacie.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY_CONFIG.phoneRaw,
      contactType: "customer service",
      areaServed: COMPANY_CONFIG.countryCode,
      availableLanguage: ["fr", "ar"],
    },
    sameAs: [
      COMPANY_CONFIG.socials.facebook,
      COMPANY_CONFIG.socials.instagram,
    ],
  };
}

/**
 * Builds OnlineStore schema, nested under the Organization via parentOrganization.
 */
export function buildOnlineStoreSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${COMPANY_CONFIG.siteUrl}/#store`,
    name: COMPANY_CONFIG.name,
    url: COMPANY_CONFIG.siteUrl,
    description:
      "Plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires et le bien-être.",
    parentOrganization: {
      "@id": `${COMPANY_CONFIG.siteUrl}/#organization`,
    },
  };
}

/**
 * Builds WebSite schema with search action.
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${COMPANY_CONFIG.siteUrl}/#website`,
    name: COMPANY_CONFIG.name,
    url: COMPANY_CONFIG.siteUrl,
    description:
      "Plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires et le bien-être.",
    publisher: {
      "@id": `${COMPANY_CONFIG.siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${COMPANY_CONFIG.siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Builds BreadcrumbList schema with canonical URLs.
 */
export function buildBreadcrumbsSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : buildCanonicalUrl(item.url),
    })),
  };
}

export interface ProductSchemaReview {
  author?: string;
  user?: { name: string | null };
  rating: number;
  body?: string | null;
  title?: string | null;
  createdAt?: string;
}

/** Markdown and HTML to plain text for structured data (Google expects readable text, not markup). Max 5,000 characters. */
export function plainDescription(value: string): string {
  const text = String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/(^|\s)#{1,6}(?=\s|$)/g, "$1") // headings that ended up inline after whitespace collapsing
    .replace(/(\*\*|__|\*|_|`)/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 5000) return text;
  const cut = text.slice(0, 5000);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" ")) + 1).trim()}`;
}

/** Emits gtin8/12/13/14 only for a structurally valid, human-entered GTIN. Never invents one. */
export function gtinProperty(value?: string | null): Record<string, string> {
  if (!value || !/^\d+$/.test(value) || ![8, 12, 13, 14].includes(value.length)) return {};
  const digits = value.split("").map(Number);
  const check = digits.pop() as number;
  const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  if ((10 - (sum % 10)) % 10 !== check) return {};
  return { [`gtin${value.length}`]: value };
}

export interface ProductSchemaInput {
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  brandName?: string | null;
  sku?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  priceTnd: number;
  rating?: { average: number; count: number };
  reviews?: ProductSchemaReview[];
  inStock: boolean;
  categoryName?: string | null;
}

/**
 * Builds Product schema using verified pricing, availability, and customer reviews.
 * Adheres strictly to Google Search Central Product Rich Snippet guidelines.
 */
export function buildProductSchema(product: ProductSchemaInput) {
  const productUrl = buildCanonicalUrl(`/produits/${product.slug}`);
  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${COMPANY_CONFIG.siteUrl}${product.image.startsWith("/") ? "" : "/"}${product.image}`
    : COMPANY_CONFIG.logoUrl;

  const validRating =
    product.rating &&
    product.rating.count > 0 &&
    product.rating.average >= 1 &&
    product.rating.average <= 5;

  // Only genuine, attributable reviews are marked up: a real author name, a real date and real text.
  // Nothing is ever invented to fill a missing field (no default author, date or sentence).
  const validReviews = (product.reviews ?? [])
    .map((r) => {
      const authorName = (r.author || r.user?.name || "").trim();
      const text = (r.body || r.title || "").trim();
      const created = r.createdAt ? new Date(r.createdAt) : null;
      if (!authorName || !text || !created || Number.isNaN(created.getTime())) return null;
      if (!Number.isFinite(r.rating) || r.rating < 1 || r.rating > 5) return null;
      return {
        "@type": "Review",
        author: { "@type": "Person", name: authorName },
        datePublished: created.toISOString().split("T")[0],
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        reviewBody: text,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .slice(0, 5);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.image && !product.image.includes("product-unavailable") ? { image: [imageUrl] } : {}),
    ...(validRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating!.average.toFixed(1)),
            reviewCount: product.rating!.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(validReviews.length > 0 ? { review: validReviews } : {}),
    description: plainDescription(product.description || product.name),
    ...(product.sku ? { sku: product.sku } : {}),
    ...gtinProperty(product.gtin),
    ...(product.mpn ? { mpn: product.mpn } : {}),
    url: productUrl,
    ...(product.brandName && !/non renseign|unknown/i.test(product.brandName)
      ? {
          brand: {
            "@type": "Brand",
            name: product.brandName,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: COMPANY_CONFIG.currency,
      price: product.priceTnd.toFixed(3),
      priceValidUntil: undefined, // Omitted to avoid false expiration dates
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        "@id": `${COMPANY_CONFIG.siteUrl}/#organization`,
        name: COMPANY_CONFIG.name,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        // Mirrors /retours: 7 days from reception. The page does not say who pays return shipping or how
        // the parcel travels, so returnFees and returnMethod are deliberately omitted (SEO-005).
        merchantReturnDays: 7,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: COMPANY_CONFIG.shippingFeeTnd.toFixed(3),
          currency: COMPANY_CONFIG.currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: COMPANY_CONFIG.countryCode,
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
        },
      },
    },
  };
}

export interface BrandSchemaInput {
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
}

/**
 * Builds Brand schema for a brand hub page.
 */
export function buildBrandSchema(brand: BrandSchemaInput) {
  const logoUrl = brand.logo
    ? brand.logo.startsWith("http")
      ? brand.logo
      : `${COMPANY_CONFIG.siteUrl}${brand.logo.startsWith("/") ? "" : "/"}${brand.logo}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: buildCanonicalUrl(`/marques/${brand.slug}`),
    ...(logoUrl ? { logo: logoUrl } : {}),
    description: brand.description || brand.name,
  };
}

export interface BrandCollectionSchemaInput {
  name: string;
  slug: string;
  description?: string | null;
  products: { slug: string; name: string }[];
}

/**
 * CollectionPage + ItemList for a brand listing page. Only real catalogue products are listed (name and URL); no Offer,
 * rating or review markup is generated here, so the structured data can never contradict the visible page.
 */
export function buildBrandCollectionSchema(input: BrandCollectionSchemaInput, limit = 24) {
  const items = input.products.slice(0, limit);
  const url = buildCanonicalUrl(`/marques/${input.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Produits ${input.name}`,
    url,
    ...(input.description ? { description: input.description } : {}),
    isPartOf: { "@type": "WebSite", name: "ParaTunisie", url: COMPANY_CONFIG.siteUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: buildCanonicalUrl(`/produits/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Builds FAQPage schema.
 */
export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface ArticleSchemaInput {
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string | null;
}

/**
 * Builds Article schema.
 */
export function buildArticleSchema(article: ArticleSchemaInput) {
  const articleUrl = buildCanonicalUrl(`/conseils/${article.slug}`);
  const imageUrl = article.image
    ? article.image.startsWith("http")
      ? article.image
      : `${COMPANY_CONFIG.siteUrl}${article.image.startsWith("/") ? "" : "/"}${article.image}`
    : COMPANY_CONFIG.logoUrl;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description || article.title,
    image: [imageUrl],
    url: articleUrl,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.updatedAt || article.publishedAt || new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${COMPANY_CONFIG.siteUrl}/#organization`,
      name: COMPANY_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        "@id": `${COMPANY_CONFIG.siteUrl}/#logo`,
        url: COMPANY_CONFIG.logoUrl,
      },
    },
    author: {
      "@type": "Organization",
      name: article.authorName || COMPANY_CONFIG.name,
      url: COMPANY_CONFIG.siteUrl,
    },
  };
}

export interface ItemListEntry {
  name: string;
  url: string;
  position?: number;
}

/**
 * Builds ItemList schema for category hubs or product collections.
 */
export function buildItemListSchema(items: ItemListEntry[], listName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName || "Produits Sélectionnés",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : buildCanonicalUrl(item.url),
    })),
  };
}
