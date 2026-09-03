/**
 * Disabled intentionally.
 *
 * This file previously generated synthetic customer identities and reviews,
 * marked every generated row as APPROVED and verified, and deleted all
 * existing reviews before reseeding. That behavior is incompatible with
 * ParaTunisie's review-integrity and structured-data policy.
 *
 * Genuine reviews must be created through the review API and are considered
 * purchase-verified only when the backend can link the same customer and
 * product to an eligible real order.
 */

console.error(
  "Synthetic review seeding is disabled. Use genuine customer reviews linked to eligible orders.",
);
process.exitCode = 1;
