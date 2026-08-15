"use client";

import { ProductRail } from "@/components/product/product-rail";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function RecentlyViewedRail({ currentSlug }: { currentSlug: string }) {
  const recentlyViewed = useRecentlyViewed(currentSlug);
  return <ProductRail title="Récemment consultés" products={recentlyViewed} />;
}
