import { HomeHero } from "@/components/home/home-hero";
import { HomeCategoryRow } from "@/components/home/home-category-row";
import { HomeSplitFeature } from "@/components/home/home-split-feature";
import { HomeGammesGrid } from "@/components/home/home-gammes-grid";
import { HomeFeaturedBrands } from "@/components/home/home-featured-brands";
import { HomeTrustReassurance } from "@/components/home/home-trust-reassurance";
import { HomeCommunity } from "@/components/home/home-community";
import { HomeSeoSection } from "@/components/home/home-seo-section";
import { type HomepageCategoryRow } from "@/lib/api/client";

const BACKGROUND_CLASSES = [
  "bg-white",
  "bg-[#FAF5F2]/50",
  "bg-white",
  "bg-[#FDFBF7]",
  "bg-white",
  "bg-[#FAF5F2]/50",
  "bg-white",
];

export function HomePage({ categoryRows }: { categoryRows: HomepageCategoryRow[] }) {
  // Split category rows into top 2 rows, then insert SplitFeature & GammesGrid
  const topRows = categoryRows.slice(0, 2);
  const remainingRows = categoryRows.slice(2);

  return (
    <div className="overflow-hidden bg-[#FAF7F5] min-h-screen">
      {/* 1. Cinematic Dark Video Hero Section */}
      <HomeHero />

      {/* 2. Content Anchor */}
      <div id="homepage-content">
        {/* Top Product Rows */}
        {topRows.map((row, index) => (
          <HomeCategoryRow
            key={row.key}
            row={row}
            bgClass={BACKGROUND_CLASSES[index % BACKGROUND_CLASSES.length]}
          />
        ))}

        {/* 3. In.Lab / Expertise Nutrition Split Feature */}
        <HomeSplitFeature />

        {/* 4. Remaining Category Product Rows */}
        {remainingRows.map((row, index) => (
          <HomeCategoryRow
            key={row.key}
            row={row}
            bgClass={BACKGROUND_CLASSES[(index + 2) % BACKGROUND_CLASSES.length]}
          />
        ))}

        {/* 5. 7 Gammes Expertes Grid */}
        <HomeGammesGrid />

        {/* 6. Featured Real Brands */}
        <HomeFeaturedBrands />

        {/* 7. Trust & Reassurance */}
        <HomeTrustReassurance />

        {/* 8. SEO Authority Pillar & FAQ Section */}
        <HomeSeoSection />

        {/* 9. Community & Le Cercle */}
        <HomeCommunity />
      </div>
    </div>
  );
}
