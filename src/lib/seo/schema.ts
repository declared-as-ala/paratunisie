import { COMPANY_CONFIG } from "../config/company";
import { buildCanonicalUrl } from "./canonical";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Builds standard Organization schema with verified company facts.
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: COMPANY_CONFIG.name,
    legalName: COMPANY_CONFIG.legalName,
    url: COMPANY_CONFIG.siteUrl,
    logo: COMPANY_CONFIG.logoUrl,
    telephone: COMPANY_CONFIG.phone,
    email: COMPANY_CONFIG.email,
    paymentAccepted: COMPANY_CONFIG.paymentMethods.join(", "),
    currenciesAccepted: COMPANY_CONFIG.currency,
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: COMPANY_CONFIG.country,
    },
    sameAs: [
      COMPANY_CONFIG.socials.facebook,
      COMPANY_CONFIG.socials.instagram,
    ],
  };
}

/**
 * Builds WebSite schema with search action.
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY_CONFIG.name,
    url: COMPANY_CONFIG.siteUrl,
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

export interface ProductSchemaInput {
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  brandName?: string | null;
  sku?: string | null;
  priceTnd: number;
  inStock: boolean;
  categoryName?: string | null;
}

/**
 * Builds Product schema using verified pricing and availability.
 * Note: Review and AggregateRating are strictly omitted unless genuine verified reviews exist.
 */
export function buildProductSchema(product: ProductSchemaInput) {
  const productUrl = buildCanonicalUrl(`/produits/${product.slug}`);
  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${COMPANY_CONFIG.siteUrl}${product.image.startsWith("/") ? "" : "/"}${product.image}`
    : COMPANY_CONFIG.logoUrl;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: product.description || product.name,
    sku: product.sku || product.slug,
    url: productUrl,
    ...(product.brandName
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
        name: COMPANY_CONFIG.name,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 3,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.priceTnd >= COMPANY_CONFIG.freeShippingThresholdTnd ? "0.000" : COMPANY_CONFIG.shippingFeeTnd.toFixed(3),
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
      name: COMPANY_CONFIG.name,
      logo: {
        "@type": "ImageObject",
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
