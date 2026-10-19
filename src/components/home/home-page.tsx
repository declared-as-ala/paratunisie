import { HomeHero } from "@/components/home/home-hero";
import { FeaturedSidePanel } from "@/components/home/featured-side-panel";
import { FeaturedBubble } from "@/components/home/featured-bubble";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import { HomeCategoryTiles } from "@/components/home/home-category-tiles";
import { HomeBestSellers } from "@/components/home/home-best-sellers";
import { HomeCategoryRow } from "@/components/home/home-category-row";
import { HomeSplitFeature } from "@/components/home/home-split-feature";
import { HomeGammesGrid } from "@/components/home/home-gammes-grid";
import { HomeFeaturedBrands } from "@/components/home/home-featured-brands";
import { HomeTrustReassurance } from "@/components/home/home-trust-reassurance";
import { HomeCommunity } from "@/components/home/home-community";
import { HomeSeoSection } from "@/components/home/home-seo-section";
import type { FeaturedProduct, HomepageCategoryRow } from "@/lib/api/client";
import type { ProductSummary } from "@/lib/data/products";

const SOFT = "bg-[#FAF5F2]/60";

/**
 * Commercial hierarchy: cinematic hero with the featured product beside it (floating bubble on mobile) → reassurance → categories → best sellers →
 * focused showcases (creatine, whey) → editorial → remaining ranges → brands → SEO content.
 * Section layouts alternate (spotlight / rail / grid) to avoid a wall of identical carousels.
 */
export function HomePage({
  categoryRows,
  featured,
  bestSellers,
}: {
  categoryRows: HomepageCategoryRow[];
  featured: FeaturedProduct | null;
  bestSellers: ProductSummary[];
}) {
  const row = (key: string) => categoryRows.find((r) => r.key === key);
  const creatine = row("creatine");
  const whey = row("whey-proteine");
  const preWorkout = row("pre-workout");
  const vitamines = row("vitamines");
  const shown = new Set(["creatine", "whey-proteine", "pre-workout", "vitamines"]);
  const others = categoryRows.filter((r) => !shown.has(r.key));

  return (
    <div className="overflow-hidden bg-[#FAF7F5]">
      <HomeHero aside={featured ? <FeaturedSidePanel featured={featured} bestSellers={bestSellers} /> : undefined} />
      <HomeTrustStrip />
      {featured && <FeaturedBubble featured={featured} />}

      <div id="homepage-content">
        <HomeCategoryTiles rows={categoryRows} />
        <HomeBestSellers items={bestSellers} />

        {creatine && <HomeCategoryRow row={creatine} variant="spotlight" eyebrow="Force & puissance" bgClass={SOFT} />}
        {whey && <HomeCategoryRow row={whey} variant="spotlight" flip eyebrow="Récupération & masse" bgClass="bg-white" />}

        <HomeSplitFeature />

        {preWorkout && <HomeCategoryRow row={preWorkout} variant="rail" bgClass="bg-white" />}
        {vitamines && <HomeCategoryRow row={vitamines} variant="grid" bgClass={SOFT} />}
        {others.map((r, i) => (
          <HomeCategoryRow key={r.key} row={r} variant={i % 2 === 0 ? "rail" : "grid"} bgClass={i % 2 === 0 ? "bg-white" : SOFT} />
        ))}

        <HomeGammesGrid />
        <HomeFeaturedBrands />
        <HomeTrustReassurance />
        <HomeSeoSection />
        <HomeCommunity />
      </div>
    </div>
  );
}
