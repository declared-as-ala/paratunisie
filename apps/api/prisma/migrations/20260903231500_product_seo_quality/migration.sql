-- Add an explainable, reversible SEO quality assessment to Product.
-- `indexable` remains the effective public robots/sitemap switch.
ALTER TABLE "Product"
  ADD COLUMN "seoQualityScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "seoQualityIssues" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "seoReviewedAt" TIMESTAMP(3);

CREATE INDEX "Product_indexable_publishState_idx"
  ON "Product"("indexable", "publishState");
