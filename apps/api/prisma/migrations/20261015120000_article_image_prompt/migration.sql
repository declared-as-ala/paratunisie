-- Stores the English photographic brief behind an article's featuredImage,
-- so a future regeneration/swap has the original intent on record.
ALTER TABLE "Article" ADD COLUMN "imagePrompt" TEXT;
