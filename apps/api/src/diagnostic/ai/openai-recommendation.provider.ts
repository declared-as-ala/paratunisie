import { Injectable, Logger } from "@nestjs/common";
import { NeedProfile } from "../diagnostic.types";
import {
  AiAlternativeResult,
  AiRecommendationResult,
  AiRoutinePick,
  DiagnosticRecommendationProvider,
  ProductFact,
} from "./diagnostic-recommendation.provider";

const SYSTEM_PROMPT = `You are a cosmetic routine assistant for ParaTunisie, a Tunisian parapharmacy e-commerce site.
You rank and organize a SKINCARE or HAIRCARE routine using ONLY the candidate products supplied to you.
Rules you must follow exactly:
- You may only select productId values that appear in the supplied candidates array. Never invent a productId, name, brand, or fact.
- Never state or imply a medical diagnosis (e.g. acne disease, eczema, rosacea, dermatitis). Use cosmetic wording only ("apparence", "besoin visible", "routine cosmétique").
- Never invent ingredients, actives, SPF value, pregnancy safety, clinical proof, or dermatologist endorsement. Only reference facts present in the candidate's name/category/brand/description/benefit fields.
- Respect the user's budget and routine complexity (item count) from the profile.
- Assign each pick a routineRole (French, e.g. "Nettoyer", "Hydrater", "Protéger", "Cibler", "Shampooing", "Après-shampooing", "Masque") and a slot of "AM" or "PM".
- Prefer in-stock candidates; only use an out-of-stock candidate if nothing suitable is in stock for that role, and say so in the reason.
- reason must be a short French sentence grounded only in the user's profile and the candidate's supplied facts — no fabricated claims.
- If no candidate is a reasonable fit for a given need, do not force a pick for it — omit it and add a note to "warnings" instead.
Return strict JSON only, matching the requested schema.`;

@Injectable()
export class OpenAiRecommendationProvider implements DiagnosticRecommendationProvider {
  readonly code = "openai";
  private readonly logger = new Logger(OpenAiRecommendationProvider.name);

  async buildRoutine(
    profile: NeedProfile,
    candidates: ProductFact[],
    options: { apiKey: string; model?: string; promptVersion?: string },
  ): Promise<AiRecommendationResult> {
    const model = options.model || process.env.DIAGNOSTIC_AI_MODEL || "gpt-4o-mini";
    const promptVersion = options.promptVersion || process.env.DIAGNOSTIC_AI_PROMPT_VERSION || "v1";
    const startTime = Date.now();

    const userContent = `User cosmetic profile:\n${JSON.stringify(profile, null, 2)}\n\nCandidate real products (JSON array, each with a real database id):\n${JSON.stringify(
      candidates,
      null,
      2,
    )}\n\nBuild a routine using only these candidates. Respond with strict JSON: { "profileSummary": string, "picks": [{ "productId": string, "routineRole": string, "slot": "AM"|"PM", "reason": string }], "warnings": string[] }.`;

    const { parsed, inputTokens, outputTokens, estimatedCostUsd } = await this.call(model, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ], options.apiKey);

    const candidateIds = new Set(candidates.map((c) => c.id));
    const picks: AiRoutinePick[] = Array.isArray(parsed.picks)
      ? parsed.picks.filter(
          (p: any) =>
            p &&
            typeof p.productId === "string" &&
            candidateIds.has(p.productId) &&
            (p.slot === "AM" || p.slot === "PM") &&
            typeof p.routineRole === "string" &&
            typeof p.reason === "string",
        )
      : [];

    return {
      profileSummary: typeof parsed.profileSummary === "string" ? parsed.profileSummary : "",
      picks,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.filter((w: any) => typeof w === "string") : [],
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      durationMs: Date.now() - startTime,
      provider: this.code,
      model,
      promptVersion,
    };
  }

  async pickAlternative(
    profile: NeedProfile,
    currentProduct: ProductFact,
    candidates: ProductFact[],
    preference: string | undefined,
    options: { apiKey: string; model?: string; promptVersion?: string },
  ): Promise<AiAlternativeResult> {
    const model = options.model || process.env.DIAGNOSTIC_AI_MODEL || "gpt-4o-mini";
    const startTime = Date.now();

    const userContent = `User cosmetic profile:\n${JSON.stringify(profile, null, 2)}\n\nCurrent product to replace:\n${JSON.stringify(
      currentProduct,
      null,
      2,
    )}\n\nUser preference for the replacement (may be empty): ${preference || "aucune préférence précisée"}\n\nCandidate replacement products (JSON array, real database ids):\n${JSON.stringify(
      candidates,
      null,
      2,
    )}\n\nPick the single best replacement from the candidates (never the current product itself). Respond with strict JSON: { "pick": { "productId": string, "routineRole": string, "slot": "AM"|"PM", "reason": string } | null }.`;

    const { parsed, inputTokens, outputTokens, estimatedCostUsd } = await this.call(model, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ], options.apiKey);

    const candidateIds = new Set(candidates.map((c) => c.id));
    const rawPick = parsed.pick;
    const pick: AiRoutinePick | null =
      rawPick &&
      typeof rawPick.productId === "string" &&
      candidateIds.has(rawPick.productId) &&
      (rawPick.slot === "AM" || rawPick.slot === "PM")
        ? {
            productId: rawPick.productId,
            routineRole: String(rawPick.routineRole || currentProduct.category),
            slot: rawPick.slot,
            reason: String(rawPick.reason || ""),
          }
        : null;

    return { pick, inputTokens, outputTokens, estimatedCostUsd, durationMs: Date.now() - startTime };
  }

  private async call(
    model: string,
    messages: { role: string; content: string }[],
    apiKey: string,
    maxRetries = 2,
  ): Promise<{ parsed: any; inputTokens: number; outputTokens: number; estimatedCostUsd: number }> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, response_format: { type: "json_object" }, temperature: 0.2 }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (!contentStr) throw new Error("Réponse OpenAI vide");

        const parsed = JSON.parse(contentStr);
        const inputTokens = data.usage?.prompt_tokens || 0;
        const outputTokens = data.usage?.completion_tokens || 0;
        // gpt-4o-mini pricing ($0.15 / 1M input, $0.60 / 1M output) — same estimate basis as OpenAiSeoProvider.
        const estimatedCostUsd = (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.6;

        return { parsed, inputTokens, outputTokens, estimatedCostUsd };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Essai ${attempt}/${maxRetries + 1} OpenAI échoué: ${(err as Error).message}`);
        if (attempt <= maxRetries) await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }

    throw lastError || new Error("Échec de la recommandation OpenAI");
  }
}
