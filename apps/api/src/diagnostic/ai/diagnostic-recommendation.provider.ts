import { NeedProfile } from "../diagnostic.types";

export type ProductFact = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceMillimes: number;
  sizeLabel: string;
  image: string;
  stock: number;
  description: string;
  benefit: string;
};

export type AiRoutinePick = {
  productId: string;
  routineRole: string;
  slot: "AM" | "PM";
  reason: string;
};

export type AiRecommendationResult = {
  profileSummary: string;
  picks: AiRoutinePick[];
  warnings: string[];
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
  provider: string;
  model: string;
  promptVersion: string;
};

export type AiAlternativeResult = {
  pick: AiRoutinePick | null;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
};

/**
 * The AI never sees the full catalogue and never invents a product — it
 * ranks/labels a candidate set already retrieved from Postgres
 * (recommendation.service.ts) and can only return productIds present in
 * that set. Swappable provider (OpenAI today; Gemini/others implement the
 * same interface) so provider-specific code stays out of the business
 * logic (CLAUDE.md diagnostic spec §11).
 */
export interface DiagnosticRecommendationProvider {
  readonly code: string;

  buildRoutine(
    profile: NeedProfile,
    candidates: ProductFact[],
    options: { apiKey: string; model?: string; promptVersion?: string },
  ): Promise<AiRecommendationResult>;

  pickAlternative(
    profile: NeedProfile,
    currentProduct: ProductFact,
    candidates: ProductFact[],
    preference: string | undefined,
    options: { apiKey: string; model?: string; promptVersion?: string },
  ): Promise<AiAlternativeResult>;
}
