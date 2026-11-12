import { HomeHero } from "@/components/home/home-hero";
import { FeaturedSidePanel } from "@/components/home/featured-side-panel";
import { HomeCategoryTiles } from "@/components/home/home-category-tiles";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import { HomePromoBanners } from "@/components/home/home-promo-banners";
import { HomeBestSellers } from "@/components/home/home-best-sellers";
import { HomeFeaturedBrands } from "@/components/home/home-featured-brands";
import { HomeFitnessSplit } from "@/components/home/home-fitness-split";
import { HomeBlogPreview } from "@/components/home/home-blog-preview";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { HomeSeoSection } from "@/components/home/home-seo-section";
import type { FeaturedProduct, HomepageCategoryRow } from "@/lib/api/client";
import type { ProductSummary } from "@/lib/data/products";
import type { Article } from "@/lib/data/articles";

/**
 * Redesigned ParaTunisie Homepage:
 * 1. Hero with Pack Anti-Stress Banner + "À LA UNE SPORT" (Right)
 * 2. 12-item Category Shortcuts Strip (including highlighted Anti-Stress tile)
 * 3. 4-card Trust & Service Strip
 * 4. 3 Category Promotional Banners (Whey, Créatine, Vitamines & Minéraux)
 * 5. Best-Selling Products ("Meilleures ventes")
 * 6. Brands Carousel ("Nos marques")
 * 7. Fitness Promotional Section
 * 8. Blog & Advice Previews
 * 9. Community Newsletter
 * 10. Technical SEO Content
 */
export function HomePage({
  categoryRows,
  featured,
  bestSellers,
  articles = [],
}: {
  categoryRows: HomepageCategoryRow[];
  featured: FeaturedProduct | null;
  bestSellers: ProductSummary[];
  articles?: Article[];
}) {
  return (
    <div className="overflow-hidden bg-[#FAF7F5]">
      {/* ── 1. Hero with Pack Anti-Stress + "À LA UNE SPORT" on Right ──────── */}
      <HomeHero
        rightAside={
          featured ? (
            <FeaturedSidePanel featured={featured} bestSellers={bestSellers} />
          ) : undefined
        }
      />

      {/* ── 2. Category Shortcuts Horizontal Strip (12 Categories) ───────── */}
      <HomeCategoryTiles rows={categoryRows} />

      {/* ── 3. Trust and Reassurance Strip (4 Cards) ────────────────────── */}
      <HomeTrustStrip />

      {/* ── 4. Category Promotional Banners (Whey, Créatine, Vitamines) ──── */}
      <HomePromoBanners />

      {/* ── 5. Best-Selling Products Carousel ("Meilleures ventes") ──────── */}
      <HomeBestSellers items={bestSellers} />

      {/* ── 6. Brands Carousel ("Nos marques") ───────────────────────────── */}
      <HomeFeaturedBrands />

      {/* ── 7. Fitness Promotional Section ──────────────────────────────── */}
      <HomeFitnessSplit />

      {/* ── 8. Blog & Advice Previews ────────────────────────────────────── */}
      <HomeBlogPreview articles={articles} />

      {/* ── 9. Community Newsletter ──────────────────────────────────────── */}
      <HomeNewsletter />

      {/* ── 10. Technical SEO Content ────────────────────────────────────── */}
      <HomeSeoSection />
    </div>
  );
}
