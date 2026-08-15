import { Injectable, Logger } from "@nestjs/common";
import {
  ChatMessageInput,
  DiagnosticConversationProvider,
  DiagnosticConversationProviderOptions,
  StructuredTurnResult,
} from "./diagnostic-conversation.provider";

export const CONVERSATION_SYSTEM_PROMPT = `
Vous êtes le Conseiller Beauté IA Officiel de ParaTunisie (parapharmacie n°1 en Tunisie).

VOTRE RÔLE :
Accompagner le client de manière chaleureuse, professionnelle et experte pour comprendre ses besoins cosmétiques, capillaires ou de santé et lui recommander des PRODUITS RÉELS disponibles dans notre catalogue.

DIRECTIVES DE CONVERSATION :
1. Saluez le client chaleureusement en français (ex: "Bonjour ! 😊 Je suis ravi de vous aider.").
2. Si le client nomme un produit, un ingrédient ou une marque précis (ex: "zinc", "vitamine C", "Bioderma"), ne posez PAS de questions avant d'avoir proposé des produits — montrez d'abord les produits pertinents, puis affinez ensuite si besoin.
3. Posez des questions ciblées uniquement quand la demande est réellement vague (ex: "j'ai des problèmes de peau" sans précision).
4. Si des produits candidats vous sont fournis ci-dessous dans le contexte, VOUS DEVEZ impérativement proposer 3 à 5 produits pertinents issus UNIQUEMENT de cette liste.
5. Répondez STRICTEMENT ET UNIQUEMENT sous forme d'un objet JSON valide respectant le schéma ci-dessous.

RÈGLES DE PERTINENCE DES PRODUITS (TRÈS IMPORTANT) :
- Les produits candidats ci-dessous sont déjà triés du PLUS pertinent au MOINS pertinent par le moteur de recherche. Préférez toujours les premiers de la liste.
- Un produit dont le NOM contient le terme recherché (ex: "Zinc" dans "KELA ZINC fort") est TOUJOURS plus pertinent qu'un produit qui mentionne seulement l'ingrédient en passant dans sa description (ex: une crème solaire qui contient de l'oxyde de zinc comme filtre UV n'est PAS un complément de zinc).
- Ne recommandez JAMAIS un produit hors-sujet uniquement parce qu'un mot-clé apparaît quelque part dans son texte. Le produit doit correspondre réellement à l'intention du client.

SCHÉMA JSON DE RÉPONSE EXIGÉ :
{
  "assistantMessage": "Texte explicatif à afficher au client (chaleureux, clair, structuré)",
  "profileUpdates": {
    "domain": "SKIN" | "HAIR" | "BODY" | "SUPPLEMENTS" | null,
    "skinType": "dry" | "oily" | "combination" | "normal" | "sensitive" | null,
    "concerns": ["acne", "hydration", "anti_aging", "dark_spots", "redness", "hair_loss"],
    "budgetMaxMillimes": number | null
  },
  "quickReplies": ["Question ou choix 1", "Question ou choix 2", "Option 3"],
  "recommendation": {
    "type": "SINGLE_PRODUCT" | "ROUTINE",
    "title": "Titre explicatif (ex: Routine Anti-Imperfections)",
    "summary": "Résumé pourquoi ces produits ont été choisis",
    "productIds": ["id1", "id2", "id3"]
  },
  "redFlag": false,
  "redFlagReason": null
}

RÈGLES STRICTES :
- Ne mentionnez JAMAIS de marques ou produits qui ne figurent pas dans la liste des produits fournis. N'inventez JAMAIS un identifiant de produit.
- Les "productIds" dans "recommendation" doivent correspondre EXACTEMENT aux identifiants "id" de la liste fournie.
- Si aucun produit candidat pertinent n'est fourni, dites-le honnêtement plutôt que d'inventer un produit — mais si des candidats vous sont fournis, ne dites jamais qu'"aucun produit n'existe".
- Si l'utilisateur a des symptômes médicaux graves (plaies ouvertes, dermatite sévère), passez "redFlag": true et conseillez de consulter un médecin.
`;

/**
 * Sole diagnostic conversation provider — Groq and direct OpenAI have been
 * removed (see DECISIONS.md). No silent cross-provider fallback: if
 * OpenRouter is unavailable, the caller sees a real error instead of a
 * response that silently came from a different model.
 */
@Injectable()
export class OpenRouterConversationProvider implements DiagnosticConversationProvider {
  readonly code = "openrouter";
  private readonly logger = new Logger(OpenRouterConversationProvider.name);

  async generateTurn(
    messages: ChatMessageInput[],
    currentProfile: any,
    catalogCandidates: any[] = [],
    options: DiagnosticConversationProviderOptions = {},
  ): Promise<StructuredTurnResult> {
    const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
    const model = options.model || process.env.OPENROUTER_MODEL || process.env.AI_CHAT_MODEL || "dots-studio/dots-3-note-preview:free";

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const startTime = Date.now();
    // Real candidates are already ranked by Meilisearch relevance before
    // reaching this provider (see CatalogueService.searchForRecommendation)
    // — 30 keeps token usage sane while giving the model enough real
    // options to choose 3-5 from instead of starving it down to 12.
    const topCandidates = catalogCandidates.slice(0, 30);

    let contextPrompt = `PROFIL ACTUEL STRUCTURÉ:\n${JSON.stringify(currentProfile, null, 2)}\n`;

    if (topCandidates.length > 0) {
      contextPrompt += `\nPRODUITS RÉELS DISPONIBLES EN BASE DE DONNÉES PARATUNISIE, TRIÉS DU PLUS AU MOINS PERTINENT (À UTILISER IMPÉRATIVEMENT POUR VOS RECOMMANDATIONS) :\n${JSON.stringify(
        topCandidates.map((c, i) => ({
          rank: i + 1,
          id: c.id,
          name: c.name,
          brand: c.brand?.name || c.brand,
          category: c.category?.name || c.category,
          priceDT: `${((c.variants?.[0]?.priceMillimes || c.priceMillimes || 0) / 1000).toFixed(3)} DT`,
          priceMillimes: c.variants?.[0]?.priceMillimes || c.priceMillimes || 0,
          inStock: (c.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) ?? c.stock ?? 0) > 0,
          description: (c.description || "").slice(0, 180),
        })),
        null,
        2,
      )}\n`;
      contextPrompt += `\nATTENTION DIRECTIVE OBLIGATOIRE : L'utilisateur demande des conseils ou des produits. Vous DISPOSEZ DE ${topCandidates.length} PRODUITS RÉELS CI-DESSUS, TRIÉS PAR PERTINENCE (rank 1 = le plus pertinent). VOUS DEVEZ IMPÉRATIVEMENT INCLURE L'OBJET "recommendation" DANS VOTRE JSON AVEC 3 À 5 "productIds" SÉLECTIONNÉS PARMI CEUX-CI, EN PRIORISANT LES RANGS LES PLUS BAS (LES PLUS PERTINENTS). NE LAISSEZ PAS "recommendation" À NULL ET NE DITES PAS QUE LES PRODUITS N'EXISTENT PAS !\n`;
    }

    const payloadMessages = [
      { role: "system", content: `${CONVERSATION_SYSTEM_PROMPT}\n\n${contextPrompt}` },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://paratunisie.com",
        "X-Title": "ParaTunisie Diagnostic",
      },
      body: JSON.stringify({
        model,
        messages: payloadMessages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`OpenRouter API error (${response.status}): ${errText}`);
      throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content;
    const usage = data.usage || {};

    let parsed: any;
    if (!rawContent) {
      this.logger.warn(`OpenRouter returned no content (finish_reason: ${choice?.finish_reason ?? "unknown"})`);
      parsed = {};
    } else {
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        this.logger.warn(`Failed to parse JSON from OpenRouter response: ${rawContent}`);
        parsed = { assistantMessage: rawContent };
      }
    }

    return {
      assistantMessage: parsed.assistantMessage || "Je suis à votre écoute pour vous conseiller les meilleurs soins.",
      profileUpdates: parsed.profileUpdates,
      quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies : undefined,
      recommendation: parsed.recommendation,
      redFlag: Boolean(parsed.redFlag),
      redFlagReason: parsed.redFlagReason,
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      durationMs,
    };
  }
}
