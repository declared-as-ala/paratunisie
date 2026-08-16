import type { MetadataRoute } from "next";

import { getAllCategorySlugs } from "@/lib/data/categories";
import { getAllConcernSlugs } from "@/lib/data/concerns";

const SITE_URL = "https://paratunisie.com";

function apiBase() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
}

type SitemapData = {
  products: { slug: string; updatedAt: string }[];
  brands: { slug: string }[];
  categories: { slug: string }[];
};

async function fetchSitemapData(): Promise<SitemapData | null> {
  try {
    const res = await fetch(`${apiBase()}/catalogue/sitemap-data`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchPublishedArticles(): Promise<{ slug: string; date?: string }[]> {
  try {
    const res = await fetch(`${apiBase()}/content/articles?status=PUBLISHED`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Real, database-driven sitemap (was entirely missing — /sitemap.xml 404'd
 * in production, the single biggest indexability gap for a ~9,700-product
 * catalogue). Only canonical, publicly indexable URLs — no cart/checkout/
 * account/search/filter query strings (SEO.md "Indexation Rules").
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [data, articles] = await Promise.all([fetchSitemapData(), fetchPublishedArticles()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/marques`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/conseils`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/besoins`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/diagnostic`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/livraison`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/aide`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/authenticite`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/le-cercle`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/fidelite`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = getAllCategorySlugs().map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const concernUrls: MetadataRoute.Sitemap = getAllConcernSlugs().map((slug) => ({
    url: `${SITE_URL}/besoins/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const brandUrls: MetadataRoute.Sitemap = (data?.brands ?? []).map((b) => ({
    url: `${SITE_URL}/marques/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productUrls: MetadataRoute.Sitemap = (data?.products ?? []).map((p) => ({
    url: `${SITE_URL}/produits/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/conseils/${a.slug}`,
    lastModified: a.date ? new Date(a.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticPages, ...categoryUrls, ...concernUrls, ...brandUrls, ...productUrls, ...articleUrls];
}
