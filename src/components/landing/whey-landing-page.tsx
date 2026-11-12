import { Cairo } from "next/font/google";

import { WheyLanding } from "@/components/landing/whey-landing";
import { WheyLandingDetails } from "@/components/landing/whey-landing-details";
import type { LandingProduct, ProductRating, PublicReview } from "@/lib/api/client";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["500", "700", "800"], display: "swap", variable: "--font-cairo" });

/** Storefront rose palette, scoped to this page only (scoped CSS variables; the rest of the storefront theme is untouched). */
const theme = {
  "--lp-brand": "#7B2F52", // deep rose plum (storefront primary)
  "--lp-brand-deep": "#5E203C",
  "--lp-soft": "#C98FA8", // dusty rose
  "--lp-accent": "#C8A46B", // champagne gold
  "--lp-cream": "#FCF8F6", // warm ivory
  "--lp-ink": "#2B2326",
  "--lp-line": "#EBDAD8",
  "--lp-line-strong": "#D9C3C2",
  "--lp-danger": "#B42318",
} as React.CSSProperties;

export function WheyLandingPageView({
  product,
  reviews,
  rating,
  seoSection,
}: {
  product: LandingProduct;
  reviews: PublicReview[];
  rating: ProductRating;
  seoSection?: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="ar-TN" className={`${cairo.variable} font-[family-name:var(--font-cairo)]`} style={theme}>
      <WheyLanding product={product}>
        <WheyLandingDetails product={product} reviews={reviews} rating={rating} seoSection={seoSection} />
      </WheyLanding>
    </div>
  );
}
