-- Unified Tunisia-focused SEO fields for catalogue entities.
-- Existing seoTitle/seoDescription/canonical/indexable columns are retained.
ALTER TABLE "Product"
  ADD COLUMN "seoH1" TEXT,
  ADD COLUMN "seoIntro" TEXT,
  ADD COLUMN "seoContent" TEXT,
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "indexable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "followLinks" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "seoIsCustom" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "seoGeneratedAt" TIMESTAMP(3);

ALTER TABLE "Category"
  ADD COLUMN "seoH1" TEXT,
  ADD COLUMN "seoIntro" TEXT,
  ADD COLUMN "seoKeywords" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "followLinks" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "seoIsCustom" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "seoGeneratedAt" TIMESTAMP(3),
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Brand"
  ADD COLUMN "seoH1" TEXT,
  ADD COLUMN "seoIntro" TEXT,
  ADD COLUMN "seoContent" TEXT,
  ADD COLUMN "seoKeywords" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "followLinks" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "seoIsCustom" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "seoGeneratedAt" TIMESTAMP(3),
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "SeoRedirect" (
  "id" TEXT NOT NULL,
  "oldPath" TEXT NOT NULL,
  "newPath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeoRedirect_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SeoRedirect_oldPath_key" ON "SeoRedirect"("oldPath");
