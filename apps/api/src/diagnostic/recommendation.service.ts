import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import { CatalogueService } from "../catalogue/catalogue.service";
import { PrismaService } from "../prisma/prisma.service";
import { OpenAiRecommendationProvider } from "./ai/openai-recommendation.provider";
import { ProductFact } from "./ai/diagnostic-recommendation.provider";
import { assembleRoutine, Pick } from "./diagnostic-rules/assemble-routine";
import { keywordsForNeeds, keywordsForRole, rankCandidatesForNeed, roleLabelForNeed, scoreKeywords } from "./diagnostic-rules/keyword-fallback";
import { NeedProfile, RoutineResult, TIER_ITEM_CAPS } from "./diagnostic.types";

const DOMAIN_CATEGORY_ROOTS: Record<"SKIN" | "HAIR", string[]> = {
  SKIN: ["visage", "solaires", "selection-solaire"],
  HAIR: ["capillaire"],
};

// Fallback-only: which slot a need lands in when there's no AI to decide.
// "both" duplicates the pick into AM and PM (e.g. a cleanser used twice daily).
const SLOT_FOR_NEED: Record<string, "AM" | "PM" | "both"> = {
  nettoyage: "both",
  hydratation: "both",
  solaire: "AM",
  cernes: "AM",
  shampooing: "both",
};

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function toProductFact(product: any): ProductFact {
  const variant = product.variants?.[0];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? "",
    category: product.category?.name ?? "",
    priceMillimes: variant?.priceMillimes ?? 0,
    sizeLabel: variant?.label ?? "",
    image: product.image || "",
    stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0) ?? 0,
    description: (product.description ?? "").slice(0, 220),
    benefit: (product.benefit ?? "").slice(0, 160),
  };
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private catalogueService: CatalogueService,
    private prisma: PrismaService,
    private aiProvider: OpenAiRecommendationProvider,
  ) {}

  private aiConfigured(): boolean {
    return process.env.DIAGNOSTIC_AI_ENABLED !== "false" && Boolean(process.env.OPENAI_API_KEY);
  }

  /**
   * Full pipeline: real DB candidate retrieval → AI ranking over that real
   * set (or the keyword fallback if the AI is unavailable) → hard re-
   * validation against Postgres → assembled routine. Every product in the
   * result was fetched from `Product` at least twice (candidate retrieval,
   * then validated by id) before ever reaching the response.
   */
  async buildRoutine(profile: NeedProfile): Promise<RoutineResult> {
    const domain = profile.domain;
    const roots = DOMAIN_CATEGORY_ROOTS[domain];
    const keywords = keywordsForNeeds(profile.needs);
    const tierCap = TIER_ITEM_CAPS[profile.routineComplexity];

    // The user's budget answer is a ROUTINE total, not a per-item price —
    // dividing it across the tier's expected item count keeps each
    // candidate individually affordable enough that the assembled total
    // has a real chance of landing under budget (still hard-capped below).
    const perItemBudget = profile.budgetMaxMillimes ? Math.max(1, Math.floor(profile.budgetMaxMillimes / tierCap)) : undefined;

    let candidates = await this.catalogueService.findForRecommendation({
      categoryRootSlugs: roots,
      keywords,
      brandSlugs: profile.brandPreferenceSlugs.length ? profile.brandPreferenceSlugs : undefined,
      maxPriceMillimes: perItemBudget,
      limit: 150,
    });

    // Real catalogue coverage for some needs is thin — broaden to the
    // category alone (drop the keyword filter) rather than return an
    // artificially small candidate set.
    if (candidates.length < 15) {
      candidates = await this.catalogueService.findForRecommendation({
        categoryRootSlugs: roots,
        brandSlugs: profile.brandPreferenceSlugs.length ? profile.brandPreferenceSlugs : undefined,
        maxPriceMillimes: perItemBudget,
        limit: 150,
      });
    }

    if (candidates.length === 0) {
      return {
        domain,
        tier: profile.routineComplexity,
        profile,
        am: [],
        pm: [],
        unfilledRoles: profile.needs,
        totalMillimes: 0,
        itemCount: 0,
      };
    }

    let facts = candidates.map(toProductFact);

    // Cap what we send the AI — pre-rank by summed keyword relevance across
    // all needs, not an arbitrary slice, so the AI still sees the most
    // relevant 80 rather than a random 80 of 150.
    const AI_CANDIDATE_CAP = 80;
    if (facts.length > AI_CANDIDATE_CAP) {
      facts = [...facts]
        .sort((a, b) => {
          const scoreA = profile.needs.reduce((s, n) => s + this.scoreOne(n, a), 0);
          const scoreB = profile.needs.reduce((s, n) => s + this.scoreOne(n, b), 0);
          return scoreB - scoreA;
        })
        .slice(0, AI_CANDIDATE_CAP);
    }

    let picks: Pick[] = [];
    let warnings: string[] = [];
    let logStatus: string;
    let logError: string | undefined;
    let logProvider = "none";
    let logModel = "n/a";
    let inputTokens = 0;
    let outputTokens = 0;
    let estimatedCostUsd = 0;
    let durationMs = 0;

    const profileHash = hash(profile);
    const candidateHash = hash(facts.map((f) => f.id).sort());
    const promptVersion = process.env.DIAGNOSTIC_AI_PROMPT_VERSION || "v1";
    const model = process.env.DIAGNOSTIC_AI_MODEL || "gpt-4o-mini";

    const cached = this.aiConfigured()
      ? await this.prisma.diagnosticAiRequest.findFirst({
          where: { profileHash, candidateHash, provider: "openai", model, promptVersion, status: "SUCCESS" },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (cached?.resultJson) {
      const parsed = JSON.parse(cached.resultJson);
      picks = parsed.picks;
      warnings = parsed.warnings ?? [];
      logStatus = "CACHED";
      logProvider = "openai";
      logModel = model;
    } else if (this.aiConfigured()) {
      try {
        const result = await this.aiProvider.buildRoutine(profile, facts, { apiKey: process.env.OPENAI_API_KEY!, model, promptVersion });
        picks = result.picks;
        warnings = result.warnings;
        logStatus = "SUCCESS";
        logProvider = result.provider;
        logModel = result.model;
        inputTokens = result.inputTokens;
        outputTokens = result.outputTokens;
        estimatedCostUsd = result.estimatedCostUsd;
        durationMs = result.durationMs;

        await this.prisma.diagnosticAiRequest.create({
          data: {
            profileHash,
            candidateHash,
            provider: logProvider,
            model: logModel,
            promptVersion,
            inputTokens,
            outputTokens,
            estimatedCostUsd,
            durationMs,
            status: logStatus,
            resultJson: JSON.stringify({ picks, warnings }),
          },
        });
      } catch (err) {
        this.logger.warn(`AI recommendation failed, using keyword fallback: ${(err as Error).message}`);
        logError = (err as Error).message;
        logStatus = "FAILED";
        await this.prisma.diagnosticAiRequest.create({
          data: { profileHash, candidateHash, provider: "openai", model, promptVersion, status: logStatus, error: logError },
        });
        picks = this.buildFallbackPicks(profile, facts);
        logProvider = "none";
        logModel = "keyword-fallback";
      }
    } else {
      picks = this.buildFallbackPicks(profile, facts);
      logStatus = "FALLBACK_RULES";
      await this.prisma.diagnosticAiRequest.create({
        data: { profileHash, candidateHash, provider: "none", model: "keyword-fallback", promptVersion, status: logStatus },
      });
    }

    // Hard backend validation (spec §9): re-fetch every picked id fresh from
    // Postgres — never trust the AI/fallback's snapshot of availability.
    const pickedIds = [...new Set(picks.map((p) => p.productId))];
    const revalidated = await this.catalogueService.findPublishedByIds(pickedIds);
    const revalidatedFacts = revalidated.map(toProductFact);
    const validIds = new Set(revalidatedFacts.map((f) => f.id));
    const finalPicks = picks.filter((p) => validIds.has(p.productId));

    let { am, pm } = assembleRoutine(finalPicks, revalidatedFacts, tierCap);

    // Final hard safety net — perItemBudget above is a heuristic (division
    // by expected item count), not a guarantee (the same product can land
    // in both AM and PM). Never return a routine over the user's stated
    // total budget: drop lowest-priority items (the end of each list) until
    // it fits, rather than silently ignoring what the user asked for.
    if (profile.budgetMaxMillimes) {
      while (am.length + pm.length > 0 && [...am, ...pm].reduce((sum, i) => sum + i.priceMillimes, 0) > profile.budgetMaxMillimes) {
        if (pm.length >= am.length && pm.length > 0) pm = pm.slice(0, -1);
        else if (am.length > 0) am = am.slice(0, -1);
        else break;
      }
    }

    return {
      domain,
      tier: profile.routineComplexity,
      profile,
      am,
      pm,
      unfilledRoles: warnings,
      totalMillimes: [...am, ...pm].reduce((sum, item) => sum + item.priceMillimes, 0),
      itemCount: am.length + pm.length,
    };
  }

  /**
   * "Voir une alternative" — AI-picked (or keyword-fallback-picked) real
   * replacement for one routine item, never a manual category swap.
   */
  async pickAlternative(
    profile: NeedProfile,
    currentProductId: string,
    role: string,
    preference?: string,
  ): Promise<{
    productId: string;
    slug: string;
    name: string;
    brandName: string;
    priceMillimes: number;
    sizeLabel: string;
    image: string;
    inStock: boolean;
    reason: string;
  } | null> {
    const roots = DOMAIN_CATEGORY_ROOTS[profile.domain];
    const current = (await this.catalogueService.findPublishedByIds([currentProductId]))[0];
    if (!current) return null;
    const currentFact = toProductFact(current);

    // Keyword-narrow to the same role regardless of preference — "autre
    // marque"/"autre texture" should still replace like-for-like (a
    // conditioner with a different conditioner), only the price ceiling
    // (moins-cher) or brand (autre-marque) constraint changes.
    const roleKeywords = keywordsForRole(role);

    let candidates = await this.catalogueService.findForRecommendation({
      categoryRootSlugs: roots,
      keywords: roleKeywords,
      excludeProductIds: [currentProductId],
      maxPriceMillimes: preference === "moins-cher" ? currentFact.priceMillimes : profile.budgetMaxMillimes ?? undefined,
      limit: 60,
    });
    if (preference === "autre-marque") candidates = candidates.filter((c: any) => c.brand?.name !== currentFact.brand);

    // Same-role coverage can be thin for a niche need — broaden to the
    // category alone rather than return zero alternatives.
    if (candidates.length === 0) {
      candidates = await this.catalogueService.findForRecommendation({
        categoryRootSlugs: roots,
        excludeProductIds: [currentProductId],
        maxPriceMillimes: preference === "moins-cher" ? currentFact.priceMillimes : profile.budgetMaxMillimes ?? undefined,
        limit: 60,
      });
      if (preference === "autre-marque") candidates = candidates.filter((c: any) => c.brand?.name !== currentFact.brand);
    }

    const facts = candidates.map(toProductFact);
    if (facts.length === 0) return null;

    let pick: Pick | null = null;

    if (this.aiConfigured()) {
      try {
        const result = await this.aiProvider.pickAlternative(profile, currentFact, facts, preference, {
          apiKey: process.env.OPENAI_API_KEY!,
          model: process.env.DIAGNOSTIC_AI_MODEL,
        });
        if (result.pick) pick = result.pick;
      } catch (err) {
        this.logger.warn(`AI alternative failed, using keyword fallback: ${(err as Error).message}`);
      }
    }

    if (!pick) {
      // No AI available for this call — relevance first (never just
      // "closest price"): keep only the top-scoring keyword-relevance tier,
      // then break ties by in-stock, then price proximity to the item
      // being replaced.
      const scored = facts.map((f) => ({ f, score: scoreKeywords(roleKeywords, f) }));
      const maxScore = Math.max(...scored.map((e) => e.score));
      const topTier = maxScore > 0 ? scored.filter((e) => e.score === maxScore).map((e) => e.f) : facts;
      const best = [...topTier].sort((a, b) => {
        if (a.stock > 0 !== b.stock > 0) return a.stock > 0 ? -1 : 1;
        return Math.abs(a.priceMillimes - currentFact.priceMillimes) - Math.abs(b.priceMillimes - currentFact.priceMillimes);
      })[0];
      pick = { productId: best.id, routineRole: role, slot: "AM", reason: "Alternative sélectionnée dans notre catalogue réel." };
    }

    const revalidated = await this.catalogueService.findPublishedByIds([pick.productId]);
    if (revalidated.length === 0) return null;
    const finalFact = toProductFact(revalidated[0]);

    return {
      productId: finalFact.id,
      slug: finalFact.slug,
      name: finalFact.name,
      brandName: finalFact.brand,
      priceMillimes: finalFact.priceMillimes,
      sizeLabel: finalFact.sizeLabel,
      image: finalFact.image,
      inStock: finalFact.stock > 0,
      reason: pick.reason,
    };
  }

  private scoreOne(need: string, fact: ProductFact): number {
    return rankCandidatesForNeed(need, [fact]).length; // 1 if it matched, 0 otherwise
  }

  /** Deterministic, code-only ranking — never an admin-managed table (see keyword-fallback.ts). */
  private buildFallbackPicks(profile: NeedProfile, facts: ProductFact[]): Pick[] {
    const picks: Pick[] = [];
    const usedProductIds = new Set<string>();

    for (const need of profile.needs) {
      const ranked = rankCandidatesForNeed(need, facts).filter((f) => !usedProductIds.has(f.id));
      const best = ranked[0];
      if (!best) continue;

      const role = roleLabelForNeed(need);
      const slotRule = SLOT_FOR_NEED[need] ?? "PM";
      const reason = `Sélectionné pour votre besoin « ${role.toLowerCase()} » d'après vos réponses au questionnaire.`;

      if (slotRule === "both") {
        picks.push({ productId: best.id, routineRole: role, slot: "AM", reason });
        picks.push({ productId: best.id, routineRole: role, slot: "PM", reason });
      } else {
        picks.push({ productId: best.id, routineRole: role, slot: slotRule, reason });
      }
      usedProductIds.add(best.id);
    }

    return picks;
  }
}
