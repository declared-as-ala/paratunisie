import { Injectable, Logger } from "@nestjs/common";
import {
  CosmeticObservationLevel,
  CosmeticObservations,
  DiagnosticVisionAnalysisResult,
  DiagnosticVisionProvider,
  DiagnosticVisionProviderOptions,
  VisionConfidenceLevel,
} from "./diagnostic-vision.provider";

const FORBIDDEN_MEDICAL_TERMS = [
  "acné",
  "acne",
  "eczéma",
  "eczema",
  "rosacée",
  "rosacea",
  "dermatite",
  "dermatitis",
  "psoriasis",
  "infection",
  "pathologie",
  "maladie",
  "diagnostic médical",
  "traitement médical",
];

export const VISION_SYSTEM_PROMPT = `Tu es un assistant d'analyse visuelle cosmétique pour ParaTunisie, une parapharmacie en Tunisie.
Tu analyses l'image d'un visage UNIQUEMENT sous l'angle de l'apparence cosmétique et de la texture cutanée visible.

Règles strictes que tu dois appliquer à la lettre:
1. INTERDICTION ABSOLUE d'employer un quelconque diagnostic ou terme médical (interdit de mentionner: acné, eczéma, rosacée, dermatite, psoriasis, infection, maladie). Utilise uniquement des termes cosmétiques d'apparence ("apparence", "brillance visible", "rougeur diffuse", "grain de peau", "sécheresse apparente").
2. INTERDICTION d'inventer des ingrédients, des principes actifs, des indices SPF, des allégations de sécurité grossesse ou des preuves cliniques.
3. Si la photo présente une lésion sévère, une inflammation suspecte, une brûlure ou un signe nécessitant un avis médical spécialisé, définis "redFlag": true et explique brièvement dans "redFlagReason" (en langage neutre et cosmétique: e.g. "Présence d'une zone très enflammée nécessitant la consultation d'un dermatologue").
4. Analyse les 6 critères cosmétiques suivants:
   - shine (brillance): "low" | "medium" | "high" | "unknown"
   - visibleDryness (sécheresse visible): "low" | "medium" | "high" | "unknown"
   - visibleRedness (rougeur visible): "low" | "medium" | "high" | "unknown"
   - visibleTexture (grain/irrégularité de peau): "low" | "medium" | "high" | "unknown"
   - visiblePores (pores dilatés): "low" | "medium" | "high" | "unknown"
   - unevenTone (teint irrégulier/taches): "low" | "medium" | "high" | "unknown"
5. Fournis un niveau de confiance pour chaque critère ("low" | "medium" | "high").

Réponds EXCLUSIVEMENT sous forme de JSON strict respectant cette structure exacte:
{
  "cosmeticObservations": {
    "shine": "low"|"medium"|"high"|"unknown",
    "visibleDryness": "low"|"medium"|"high"|"unknown",
    "visibleRedness": "low"|"medium"|"high"|"unknown",
    "visibleTexture": "low"|"medium"|"high"|"unknown",
    "visiblePores": "low"|"medium"|"high"|"unknown",
    "unevenTone": "low"|"medium"|"high"|"unknown"
  },
  "confidence": {
    "shine": "low"|"medium"|"high",
    "visibleDryness": "low"|"medium"|"high",
    "visibleRedness": "low"|"medium"|"high",
    "visibleTexture": "low"|"medium"|"high",
    "visiblePores": "low"|"medium"|"high",
    "unevenTone": "low"|"medium"|"high"
  },
  "redFlag": boolean,
  "redFlagReason": string | null
}`;

const VALID_OBSERVATIONS: CosmeticObservationLevel[] = ["low", "medium", "high", "unknown"];
const VALID_CONFIDENCES: VisionConfidenceLevel[] = ["low", "medium", "high"];

export function validateVisionOutput(parsed: any): {
  cosmeticObservations: CosmeticObservations;
  confidence: Record<keyof CosmeticObservations, VisionConfidenceLevel>;
  redFlag: boolean;
  redFlagReason: string | null;
} {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("L'output de l'analyse visuelle n'est pas un objet JSON valide");
  }

  const rawObs = parsed.cosmeticObservations || {};
  const rawConf = parsed.confidence || {};

  const sanitizeObs = (val: any): CosmeticObservationLevel =>
    VALID_OBSERVATIONS.includes(val) ? val : "unknown";

  const sanitizeConf = (val: any): VisionConfidenceLevel =>
    VALID_CONFIDENCES.includes(val) ? val : "medium";

  const cosmeticObservations: CosmeticObservations = {
    shine: sanitizeObs(rawObs.shine),
    visibleDryness: sanitizeObs(rawObs.visibleDryness),
    visibleRedness: sanitizeObs(rawObs.visibleRedness),
    visibleTexture: sanitizeObs(rawObs.visibleTexture),
    visiblePores: sanitizeObs(rawObs.visiblePores),
    unevenTone: sanitizeObs(rawObs.unevenTone),
  };

  const confidence: Record<keyof CosmeticObservations, VisionConfidenceLevel> = {
    shine: sanitizeConf(rawConf.shine),
    visibleDryness: sanitizeConf(rawConf.visibleDryness),
    visibleRedness: sanitizeConf(rawConf.visibleRedness),
    visibleTexture: sanitizeConf(rawConf.visibleTexture),
    visiblePores: sanitizeConf(rawConf.visiblePores),
    unevenTone: sanitizeConf(rawConf.unevenTone),
  };

  const redFlag = parsed.redFlag === true || parsed.redFlag === "true";
  let redFlagReason = typeof parsed.redFlagReason === "string" ? parsed.redFlagReason.trim() : null;

  if (!redFlag) {
    redFlagReason = null;
  }

  if (redFlagReason) {
    let sanitizedReason = redFlagReason;
    for (const term of FORBIDDEN_MEDICAL_TERMS) {
      const regex = new RegExp(`(?<=^|[^a-zA-Zà-ÿ0-9])${term}(?=[^a-zA-Zà-ÿ0-9]|$)`, "gi");
      sanitizedReason = sanitizedReason.replace(regex, "condition cutanée particulière");
    }
    redFlagReason = sanitizedReason;
  }

  return { cosmeticObservations, confidence, redFlag, redFlagReason };
}

/**
 * Sole diagnostic vision provider (D-0032) — Groq and direct OpenAI have
 * been removed; OpenRouter is the only path, no silent cross-provider
 * fallback. Verified live 2026-08-15 against dots-studio/dots-3-note-preview:free:
 * genuinely multimodal, respects response_format:json_object, but is a
 * REASONING model — it spends completion tokens on chain-of-thought before
 * the actual JSON, so a small max_tokens (e.g. 20) truncates mid-thought and
 * returns content: null. 2000 is generous enough to always clear that overhead.
 */
@Injectable()
export class OpenRouterVisionProvider implements DiagnosticVisionProvider {
  readonly code = "openrouter";
  private readonly logger = new Logger(OpenRouterVisionProvider.name);

  async analyzeImage(
    imageBuffer: Buffer,
    mimeType: string,
    options: DiagnosticVisionProviderOptions,
  ): Promise<DiagnosticVisionAnalysisResult> {
    const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
    const model = options.model || process.env.AI_VISION_MODEL || process.env.OPENROUTER_VISION_MODEL || process.env.OPENROUTER_MODEL || "dots-studio/dots-3-note-preview:free";
    const startTime = Date.now();

    const base64Image = imageBuffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    const messages = [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyse cette photo de visage pour un bilan d'apparence cosmétique. Réponds au format JSON strict.",
          },
          { type: "image_url", image_url: { url: dataUri } },
        ],
      },
    ];

    const { parsed, inputTokens, outputTokens } = await this.callOpenRouter(model, messages, apiKey);
    const validated = validateVisionOutput(parsed);

    return {
      cosmeticObservations: validated.cosmeticObservations,
      confidence: validated.confidence,
      redFlag: validated.redFlag,
      redFlagReason: validated.redFlagReason,
      inputTokens,
      outputTokens,
      durationMs: Date.now() - startTime,
      provider: this.code,
      model,
    };
  }

  private async callOpenRouter(
    model: string,
    messages: any[],
    apiKey: string,
    maxRetries = 2,
  ): Promise<{ parsed: any; inputTokens: number; outputTokens: number }> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://paratunisie.com",
            "X-Title": "ParaTunisie Diagnostic",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 2000,
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        const contentStr = choice?.message?.content;
        if (!contentStr) {
          // Reasoning model cut off before emitting content — not a network
          // failure, so retrying with the same token budget won't help;
          // surface a clear error instead of silently returning nothing.
          throw new Error(
            `Réponse OpenRouter vide (finish_reason: ${choice?.finish_reason ?? "unknown"}) — le modèle a probablement été coupé pendant son raisonnement.`,
          );
        }

        const parsed = JSON.parse(contentStr);
        const inputTokens = data.usage?.prompt_tokens || 0;
        const outputTokens = data.usage?.completion_tokens || 0;

        return { parsed, inputTokens, outputTokens };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Essai ${attempt}/${maxRetries + 1} OpenRouter Vision échoué: ${(err as Error).message}`);
        if (attempt <= maxRetries) await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }

    throw lastError || new Error("Échec de l'analyse visuelle OpenRouter");
  }
}
