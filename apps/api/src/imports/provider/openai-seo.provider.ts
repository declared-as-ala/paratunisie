import { Injectable, Logger } from "@nestjs/common";
import { GeneratedSeoResult, SeoFactsInput } from "./seo-provider.interface";

@Injectable()
export class OpenAiSeoProvider {
  readonly code = "openai";
  readonly name = "OpenAI GPT Structured SEO Engine";
  private readonly logger = new Logger(OpenAiSeoProvider.name);

  private readonly systemPrompt = `You are generating product content for ParaTunisie, a Tunisian parapharmacy e-commerce website.
Use ONLY the supplied verified product facts.
Never infer missing medical, cosmetic, ingredient, usage, pregnancy, certification, testing or performance information.
If information is missing, omit it.
Never use competitor pricing.
Only use sellingPrice when explicitly supplied.
Write natural professional French.
Avoid keyword stuffing.
Avoid generic filler.
Avoid repeating the brand when already contained in the product name.
Avoid repetitive boilerplate.
Do not claim that ParaTunisie tested, selected, recommends or guarantees a product unless supplied facts explicitly say so.
Return only valid JSON matching the requested JSON schema.`;

  async generate(
    facts: SeoFactsInput,
    options: {
      apiKey: string;
      model?: string;
      promptVersion?: string;
      maxRetries?: number;
    }
  ): Promise<GeneratedSeoResult> {
    const startTime = Date.now();
    const model = options.model || process.env.SEO_AI_MODEL || "gpt-4o-mini";
    const promptVersion = options.promptVersion || process.env.SEO_PROMPT_VERSION || "v1";
    const maxRetries = options.maxRetries ?? 2;

    const payload = {
      model,
      messages: [
        { role: "system", content: this.systemPrompt },
        {
          role: "user",
          content: `Generate structured French SEO content for this product factual data:\n${JSON.stringify(
            {
              name: facts.name,
              brand: facts.brand || null,
              category: facts.category || null,
              volumeSize: facts.volumeSize || null,
              ingredients: facts.ingredients || null,
              usage: facts.usage || null,
              verifiedBenefits: facts.verifiedBenefits || [],
              sellingPriceMillimes: facts.sellingPriceMillimes || null,
              country: "Tunisie",
              language: "fr",
            },
            null,
            2
          )}\n\nRespond with strict JSON with keys: normalizedTitle, slug, metaTitle, metaDescription, shortDescription, longDescription, benefits, usage, faq (array of {question, answer}), keywords (array of strings), imageAlt, seoScore (0-100).`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    };

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${options.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (!contentStr) {
          throw new Error("Réponse OpenAI vide");
        }

        const parsed = JSON.parse(contentStr);
        const durationMs = Date.now() - startTime;

        const inputTokens = data.usage?.prompt_tokens || 0;
        const outputTokens = data.usage?.completion_tokens || 0;
        const totalTokens = data.usage?.total_tokens || 0;

        // Estimated cost for gpt-4o-mini ($0.15 / 1M input, $0.60 / 1M output)
        const estimatedCostUsd =
          (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.6;

        return {
          normalizedTitle: parsed.normalizedTitle || facts.name,
          slug: parsed.slug || facts.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          metaTitle: parsed.metaTitle || `${facts.name} | ParaTunisie`,
          metaDescription: parsed.metaDescription || "",
          shortDescription: parsed.shortDescription || "",
          longDescription: parsed.longDescription || "",
          benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
          usage: parsed.usage || facts.usage,
          faq: Array.isArray(parsed.faq) ? parsed.faq : [],
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          imageAlt: parsed.imageAlt || facts.name,
          seoScore: typeof parsed.seoScore === "number" ? parsed.seoScore : 85,
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCostUsd,
          durationMs,
          provider: "openai",
          model,
          promptVersion,
        };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(
          `Essai ${attempt}/${maxRetries + 1} OpenAI échoué: ${(err as Error).message}`
        );
        if (attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error("Échec de la génération OpenAI");
  }
}
