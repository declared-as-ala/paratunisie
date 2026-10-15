-- Stores the English photographic brief behind an article's featuredImage,
-- so a future regeneration/swap has the original intent on record, and the
-- French accessible alt text for that same image (Article had neither —
-- Product/Brand/Category already have imageAlt, Article didn't).
ALTER TABLE "Article" ADD COLUMN "imagePrompt" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageAlt" TEXT;
