"use client";

import { useEffect, useState } from "react";
import { HomeHero } from "@/components/home/home-hero";
import { HomeCategoryRow } from "@/components/home/home-category-row";
import { HomeFeaturedBrands } from "@/components/home/home-featured-brands";
import { HomeTrustReassurance } from "@/components/home/home-trust-reassurance";
import { HomeCommunity } from "@/components/home/home-community";
import { fetchHomepageCategoryRows, type HomepageCategoryRow } from "@/lib/api/client";

const BACKGROUND_CLASSES = [
  "bg-white",
  "bg-[#FAF5F2]/50",
  "bg-white",
  "bg-[#FDFBF7]",
  "bg-white",
  "bg-[#FAF5F2]/50",
  "bg-white",
];

export function HomePage() {
  const [categoryRows, setCategoryRows] = useState<HomepageCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealData() {
      try {
        const rows = await fetchHomepageCategoryRows();
        setCategoryRows(rows);
      } catch (err) {
        console.warn("Could not load homepage category rows", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealData();
  }, []);

  return (
    <div className="overflow-hidden bg-[#FAF7F5] min-h-screen">
      {/* 1. Hero Section */}
      <HomeHero />

      {/* 2. Real Category Product Rows (5 products per desktop row) */}
      {loading ? (
        <div className="py-12 px-4 mx-auto max-w-[1440px] space-y-12">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse space-y-4">
              <div className="h-6 bg-soft-nude rounded w-1/4" />
              <div className="h-4 bg-soft-nude rounded w-1/2" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                {Array.from({ length: 5 }).map((_, cIdx) => (
                  <div key={cIdx} className="h-64 bg-soft-nude rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        categoryRows.map((row, index) => (
          <HomeCategoryRow
            key={row.key}
            row={row}
            bgClass={BACKGROUND_CLASSES[index % BACKGROUND_CLASSES.length]}
          />
        ))
      )}

      {/* 3. Featured Real Brands */}
      <HomeFeaturedBrands />

      {/* 4. Trust & Reassurance */}
      <HomeTrustReassurance />

      {/* 5. Community & Le Cercle */}
      <HomeCommunity />
    </div>
  );
}
