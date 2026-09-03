BEGIN;

-- Reversible quarantine: retain all editorial data, but remove health-related
-- articles from indexation until a named expert review has been recorded.
UPDATE "Article"
SET "indexable" = FALSE,
    "updatedAt" = NOW()
WHERE "status" = 'PUBLISHED'
  AND LENGTH(BTRIM(COALESCE("expertReviewer", ''))) = 0;

DO $$
DECLARE unsafe integer;
BEGIN
  SELECT COUNT(*) INTO unsafe
  FROM "Article"
  WHERE "status" = 'PUBLISHED'
    AND "indexable" = TRUE
    AND LENGTH(BTRIM(COALESCE("expertReviewer", ''))) = 0;
  IF unsafe <> 0 THEN
    RAISE EXCEPTION 'Article quarantine verification failed: % unreviewed articles remain indexable', unsafe;
  END IF;
END $$;

COMMIT;
