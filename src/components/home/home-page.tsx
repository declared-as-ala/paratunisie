import { HomeHero } from "@/components/home/home-hero";
import { FeaturedSidePanel } from "@/components/home/featured-side-panel";
import { HomeGoals, type PopularSubcategory } from "@/components/home/home-goals";
import { HomeProductCarousel } from "@/components/home/home-product-carousel";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import { HomeFeaturedBrands } from "@/components/home/home-featured-brands";
import { HomeBlogPreview } from "@/components/home/home-blog-preview";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { HomeSeoSection } from "@/components/home/home-seo-section";
import { Pill, Flame, Sparkles, Magnet, Droplet, Bone } from "lucide-react";
import type { BrandListItem, CategoryDepartment, FeaturedProduct, ShopDepartment } from "@/lib/api/client";
import type { ProductSummary } from "@/lib/data/products";
import type { Article } from "@/lib/data/articles";

/** Icons for the handful of subcategories surfaced in the popular rail — purely decorative, never a data source. */
const POPULAR_SLUGS: Record<string, PopularSubcategory["icon"]> = {
  "whey-proteine": Pill,
  creatine: Flame,
  vitamines: Sparkles,
  magnesium: Magnet,
  "omega-3": Droplet,
  articulations: Bone,
};

function buildPopularSubcategories(departments: CategoryDepartment[]): PopularSubcategory[] {
  const all = departments.flatMap((d) => d.children);
  return Object.entries(POPULAR_SLUGS)
    .map(([slug, icon]) => {
      const match = all.find((c) => c.slug === slug);
      return match ? { name: match.name, slug: match.slug, count: match.count, icon } : null;
    })
    .filter((x): x is PopularSubcategory => x !== null);
}

export type HomeCollection = {
  id: string;
  title: string;
  accent: string;
  subtitle: string;
  href: string;
  products: ProductSummary[];
};

/**
 * ParaTunisie Homepage — editorial wellness meets sports commerce:
 * 1. Hero
 * 2. Shoppez selon votre objectif (goal cards + popular subcategories)
 * 5. Five category carousels: Créatine, Whey, Mass Gainers, Vitamines, Pre-Workout
 * 7. Trust & service strip
 * 8. Brands carousel
 * 9. Blog & advice carousel
 * 10. Newsletter
 * 11. Technical SEO content
 */
export function HomePage({
  collections,
  featured,
  bestSellers,
  articles = [],
  departments = [],
  shopDepartments = [],
  brands = [],
}: {
  collections: HomeCollection[];
  featured: FeaturedProduct | null;
  bestSellers: ProductSummary[];
  articles?: Article[];
  departments?: CategoryDepartment[];
  shopDepartments?: ShopDepartment[];
  brands?: BrandListItem[];
}) {
  const popularSubcategories = buildPopularSubcategories(departments);

  return (
    <div className="overflow-hidden bg-background">
      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <HomeHero
        rightAside={
          featured ? (
            <FeaturedSidePanel featured={featured} />
          ) : undefined
        }
      />

      {/* ── 3. Shoppez selon votre objectif ──────────────────────────────── */}
      <HomeGoals departments={shopDepartments} popular={popularSubcategories} />

      {/* ── 5. Category carousels, in merchandising order ────────────────── */}
      {collections.map((collection, i) => (
        <HomeProductCarousel key={collection.id} {...collection} tinted={i % 2 === 0} />
      ))}

      {/* ── 7. Trust and Reassurance Strip ───────────────────────────────── */}
      <HomeTrustStrip />

      {/* ── 8. Brands Carousel ("Nos marques") ───────────────────────────── */}
      <HomeFeaturedBrands brands={brands} />

      {/* ── 9. Blog & Advice Carousel ─────────────────────────────────────── */}
      <HomeBlogPreview articles={articles} />

      {/* ── 10. Newsletter ───────────────────────────────────────────────── */}
      <HomeNewsletter />

      {/* ── 11. Technical SEO Content ────────────────────────────────────── */}
      <HomeSeoSection />
    </div>
  );
}
