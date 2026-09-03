BEGIN;

-- Exact reviewed list only. These are single-carbohydrate products, rice powder,
-- or D-ribose products; none is a protein/calorie mass-gainer formulation.
WITH reviewed(slug) AS (
  VALUES
    ('carbo-big-1-5kg-big-ramy-labs'),
    ('carbo-one-1-kg'),
    ('carbo-1000g-ostrovit'),
    ('carbox-1kg-biotechusa'),
    ('cream-of-rice-1kg-yava-labs'),
    ('now-foods-sports-carbo-gain-3-63-kg'),
    ('california-gold-nutrition-d-ribose-powder-sans-arome-300-g'),
    ('doctor-s-best-pure-d-ribose-powder-250-g'),
    ('life-extension-d-ribose-powder-150-g'),
    ('life-extension-d-ribose-tablets-100-vegetarian-tablets'),
    ('now-foods-sports-d-ribose-powder-227-g'),
    ('now-foods-sports-d-ribose-120-gelules-vegetales')
), target AS (
  SELECT id FROM "Category" WHERE slug = 'nutrition-sportive'
), source AS (
  SELECT id FROM "Category" WHERE slug = 'gainers-proteines'
)
UPDATE "Product" p
SET "categoryId" = target.id,
    "updatedAt" = NOW()
FROM reviewed, target, source
WHERE p.slug = reviewed.slug
  AND p."categoryId" = source.id;

DO $$
DECLARE remaining integer;
BEGIN
  SELECT COUNT(*) INTO remaining
  FROM "Product" p
  JOIN "Category" c ON c.id = p."categoryId"
  WHERE c.slug = 'gainers-proteines'
    AND p.slug IN (
      'carbo-big-1-5kg-big-ramy-labs',
      'carbo-one-1-kg',
      'carbo-1000g-ostrovit',
      'carbox-1kg-biotechusa',
      'cream-of-rice-1kg-yava-labs',
      'now-foods-sports-carbo-gain-3-63-kg',
      'california-gold-nutrition-d-ribose-powder-sans-arome-300-g',
      'doctor-s-best-pure-d-ribose-powder-250-g',
      'life-extension-d-ribose-powder-150-g',
      'life-extension-d-ribose-tablets-100-vegetarian-tablets',
      'now-foods-sports-d-ribose-powder-227-g',
      'now-foods-sports-d-ribose-120-gelules-vegetales'
    );
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'Taxonomy verification failed: % reviewed rows remain in Gainers', remaining;
  END IF;
END $$;

COMMIT;
