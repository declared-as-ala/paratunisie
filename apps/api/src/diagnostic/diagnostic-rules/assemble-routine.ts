import { ProductFact } from "../ai/diagnostic-recommendation.provider";
import { RoutineRoleItem } from "../diagnostic.types";

export type Pick = { productId: string; routineRole: string; slot: "AM" | "PM"; reason: string };

/**
 * Turns validated AI (or fallback) picks into the final routine shape,
 * deduping repeated products and capping to the tier's item count. Pure —
 * every field comes from `candidates` (real Postgres rows), nothing
 * invented (diagnostic spec §10).
 */
export function assembleRoutine(
  picks: Pick[],
  candidates: ProductFact[],
  tierCap: number,
): { am: RoutineRoleItem[]; pm: RoutineRoleItem[] } {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  // Dedup on (productId, slot) — not productId alone: the same product
  // legitimately appears in both AM and PM (e.g. a cleanser used twice
  // daily), so that's two real routine steps, not a duplicate.
  const seen = new Set<string>();
  const am: RoutineRoleItem[] = [];
  const pm: RoutineRoleItem[] = [];

  for (const pick of picks) {
    if (am.length + pm.length >= tierCap) break;
    const dedupeKey = `${pick.productId}:${pick.slot}`;
    if (seen.has(dedupeKey)) continue;
    const product = byId.get(pick.productId);
    if (!product) continue; // defense-in-depth — provider already filters to candidateIds

    seen.add(dedupeKey);
    const item: RoutineRoleItem = {
      role: pick.routineRole,
      slot: pick.slot,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand,
      priceMillimes: product.priceMillimes,
      sizeLabel: product.sizeLabel,
      image: product.image,
      inStock: product.stock > 0,
      reason: pick.reason,
    };
    (pick.slot === "AM" ? am : pm).push(item);
  }

  return { am, pm };
}
