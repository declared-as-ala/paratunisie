import { HomeHero } from "@/components/home/home-hero";
import { HomeCategoryRow } from "@/components/home/home-category-row";
import { HomeFeaturedBrands } from "@/components/home/home-featured-brands";
import { HomeTrustReassurance } from "@/components/home/home-trust-reassurance";
import { HomeCommunity } from "@/components/home/home-community";
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
  return (
    <div className="overflow-hidden bg-[#FAF7F5] min-h-screen">
      {/* 1. Hero Section */}
      <HomeHero />

      {/* 2. Real Category Product Rows (5 products per desktop row) — fetched
          server-side (CLAUDE.md §16/architecture: Server Components by
          default) so this never depends on the browser's own network scheme
          the way a client-side fetch would (e.g. an HTTP API URL blocked as
          mixed content on an HTTPS page). */}
      {categoryRows.map((row, index) => (
        <HomeCategoryRow
          key={row.key}
          row={row}
          bgClass={BACKGROUND_CLASSES[index % BACKGROUND_CLASSES.length]}
        />
      ))}

      {/* 3. Featured Real Brands */}
      <HomeFeaturedBrands />

      {/* 4. Trust & Reassurance */}
      <HomeTrustReassurance />

      {/* 5. Community & Le Cercle */}
      <HomeCommunity />
    </div>
  );
}
