import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogueService } from "../catalogue/catalogue.service";
import { DiagnosticStorageService } from "./diagnostic-storage.service";
import { DiagnosticVisionProvider } from "./vision/diagnostic-vision.provider";
import { ChatMessageInput, DiagnosticConversationProvider } from "./ai/diagnostic-conversation.provider";
import { NeedProfile } from "./diagnostic.types";
import { DIAGNOSTIC_CONVERSATION_PROVIDER, DIAGNOSTIC_VISION_PROVIDER } from "./diagnostic.tokens";

const INITIAL_SKIN_MESSAGE = `Bonjour 👋

Je suis votre conseiller beauté ParaTunisie.

Je peux vous aider à trouver les soins adaptés à vos besoins, construire une routine, comparer des produits ou analyser visuellement votre peau.

Comment puis-je vous aider aujourd'hui ?`;

const INITIAL_SKIN_QUICK_REPLIES = [
  "✨ Construire ma routine",
  "📷 Analyser ma peau",
  "🔎 Trouver un produit",
  "⚖️ Comparer des produits",
  "💰 Adapter une routine à mon budget",
  "💆 Conseils cheveux",
];

@Injectable()
export class DiagnosticConversationService {
  private readonly logger = new Logger(DiagnosticConversationService.name);

  constructor(
    private prisma: PrismaService,
    private catalogueService: CatalogueService,
    private storageService: DiagnosticStorageService,
    @Inject(DIAGNOSTIC_VISION_PROVIDER) private visionProvider: DiagnosticVisionProvider,
    @Inject(DIAGNOSTIC_CONVERSATION_PROVIDER) private conversationProvider: DiagnosticConversationProvider,
  ) {}

  async createSession(domain: "SKIN" | "HAIR" = "SKIN", userId?: string) {
    const defaultProfile: NeedProfile = {
      domain,
      routineComplexity: "Essentielle",
      needs: [],
      sensitivity: "medium",
      budgetMaxMillimes: null,
      brandPreferenceSlugs: [],
      spfDaily: null,
      pregnancyOrBreastfeeding: false,
      currentRoutine: [],
      sources: {},
    };

    const conversation = await this.prisma.diagnosticConversation.create({
      data: {
        domain,
        userId,
        profile: JSON.stringify(defaultProfile),
      },
    });

    const initialMsg = await this.prisma.diagnosticMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: INITIAL_SKIN_MESSAGE,
        quickReplies: JSON.stringify(INITIAL_SKIN_QUICK_REPLIES),
      },
    });

    return {
      sessionToken: conversation.sessionToken,
      conversationId: conversation.id,
      domain: conversation.domain,
      profile: defaultProfile,
      messages: [
        {
          id: initialMsg.id,
          role: initialMsg.role,
          content: initialMsg.content,
          quickReplies: INITIAL_SKIN_QUICK_REPLIES,
          createdAt: initialMsg.createdAt,
        },
      ],
    };
  }

  async getSession(sessionToken: string) {
    const conversation = await this.prisma.diagnosticConversation.findFirst({
      where: { sessionToken },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation session not found");
    }

    let profile: NeedProfile;
    try {
      profile = JSON.parse(conversation.profile);
    } catch {
      profile = {
        domain: conversation.domain as any,
        routineComplexity: "Essentielle",
        needs: [],
        sensitivity: "medium",
        budgetMaxMillimes: null,
        brandPreferenceSlugs: [],
        spfDaily: null,
        pregnancyOrBreastfeeding: false,
        currentRoutine: [],
        sources: {},
      };
    }

    // Process messages and fetch product details for any recommendations
    const formattedMessages = await Promise.all(
      conversation.messages.map(async (msg) => {
        let quickReplies: string[] | undefined;
        let recommendation: any | undefined;

        if (msg.quickReplies) {
          try {
            quickReplies = JSON.parse(msg.quickReplies);
          } catch {}
        }

        if (msg.recommendation) {
          try {
            const rawRec = JSON.parse(msg.recommendation);
            recommendation = await this.hydrateRecommendationProducts(rawRec);
          } catch {}
        }

        return {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          quickReplies,
          recommendation,
          createdAt: msg.createdAt,
        };
      }),
    );

    return {
      sessionToken: conversation.sessionToken,
      conversationId: conversation.id,
      domain: conversation.domain,
      profile,
      messages: formattedMessages,
    };
  }

  async handleUserMessage(sessionToken: string, userText: string) {
    const conversation = await this.prisma.diagnosticConversation.findFirst({
      where: { sessionToken },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation session not found");
    }

    let profile: NeedProfile;
    try {
      profile = JSON.parse(conversation.profile);
    } catch {
      profile = {
        domain: conversation.domain as any,
        routineComplexity: "Essentielle",
        needs: [],
        sensitivity: "medium",
        budgetMaxMillimes: null,
        brandPreferenceSlugs: [],
        spfDaily: null,
        pregnancyOrBreastfeeding: false,
        currentRoutine: [],
        sources: {},
      };
    }

    // Save user message to DB
    await this.prisma.diagnosticMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: userText,
      },
    });

    // Retrieve full context history
    const allMessages: ChatMessageInput[] = [
      ...conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      { role: "user", content: userText },
    ];

    // Real, relevance-ranked candidate retrieval — routes through the same
    // Meilisearch index the storefront search box already uses (name ranks
    // above incidental description mentions), instead of the old unranked
    // Prisma `contains` scan that let e.g. sunscreens mentioning "oxyde de
    // zinc" outrank actual Zinc supplements for a "zinc" query.
    const searchQuery = this.buildSearchQuery(userText);
    let rawCandidates: any[] = [];

    if (searchQuery) {
      rawCandidates = await this.catalogueService.searchForRecommendation(searchQuery, 40);
      if (profile.budgetMaxMillimes) {
        rawCandidates = rawCandidates.filter((c: any) =>
          (c.variants || []).some((v: any) => v.priceMillimes <= profile.budgetMaxMillimes!),
        );
      }
    }

    // Top up with a domain-scoped browse only when the real search came up
    // short — never as the primary filter, since gating on categoryRootSlugs
    // first (e.g. "visage") silently excluded food-supplement products like
    // Zinc/Vitamin C that live in other category trees entirely.
    if (rawCandidates.length < 5) {
      const domainCandidates = await this.catalogueService.findForRecommendation({
        categoryRootSlugs: profile.domain === "HAIR" ? ["capillaire"] : ["visage", "solaires", "selection-solaire"],
        maxPriceMillimes: profile.budgetMaxMillimes || undefined,
        limit: 40,
      });
      const existingIds = new Set(rawCandidates.map((c) => c.id));
      for (const c of domainCandidates) {
        if (!existingIds.has(c.id)) {
          rawCandidates.push(c);
        }
      }
    }

    // Execute AI turn generation via Groq
    const turnResult = await this.conversationProvider.generateTurn(allMessages, profile, rawCandidates);

    // Update profile if AI identified updates
    if (turnResult.profileUpdates) {
      if (turnResult.profileUpdates.domain) profile.domain = turnResult.profileUpdates.domain;
      if (turnResult.profileUpdates.skinType) profile.skinType = turnResult.profileUpdates.skinType;
      if (turnResult.profileUpdates.concerns?.length) {
        profile.needs = Array.from(new Set([...profile.needs, ...turnResult.profileUpdates.concerns]));
      }
      if (turnResult.profileUpdates.budgetMaxMillimes) {
        profile.budgetMaxMillimes = turnResult.profileUpdates.budgetMaxMillimes;
      }
      if (turnResult.profileUpdates.preferredBrands?.length) {
        profile.brandPreferenceSlugs = turnResult.profileUpdates.preferredBrands.map((b) => b.toLowerCase().replace(/\s+/g, "-"));
      }

      await this.prisma.diagnosticConversation.update({
        where: { id: conversation.id },
        data: {
          domain: profile.domain,
          profile: JSON.stringify(profile),
        },
      });
    }

    // Hard DB re-verification of all recommended product IDs
    let validatedRecommendation: any | undefined;
    if (turnResult.recommendation && turnResult.recommendation.productIds?.length) {
      const dbProducts = await this.catalogueService.findPublishedByIds(turnResult.recommendation.productIds);
      const validProductMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Filter product IDs to ONLY those that strictly exist in PostgreSQL
      const validIds = turnResult.recommendation.productIds.filter((id) => validProductMap.has(id));

      if (validIds.length > 0) {
        validatedRecommendation = {
          ...turnResult.recommendation,
          productIds: validIds,
        };
      }
    }

    // Save assistant message to DB
    const assistantMsg = await this.prisma.diagnosticMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: turnResult.assistantMessage,
        quickReplies: turnResult.quickReplies ? JSON.stringify(turnResult.quickReplies) : null,
        recommendation: validatedRecommendation ? JSON.stringify(validatedRecommendation) : null,
        metadata: JSON.stringify({
          inputTokens: turnResult.inputTokens,
          outputTokens: turnResult.outputTokens,
          durationMs: turnResult.durationMs,
        }),
      },
    });

    // Hydrate full product facts for response
    const hydratedRec = validatedRecommendation ? await this.hydrateRecommendationProducts(validatedRecommendation) : undefined;

    return {
      message: {
        id: assistantMsg.id,
        role: "assistant",
        content: assistantMsg.content,
        quickReplies: turnResult.quickReplies,
        recommendation: hydratedRec,
        createdAt: assistantMsg.createdAt,
      },
      profile,
      redFlag: turnResult.redFlag,
      redFlagReason: turnResult.redFlagReason,
    };
  }

  async uploadPhotoInChat(sessionToken: string, file: { buffer: Buffer; mimetype: string; originalname?: string }) {
    const conversation = await this.prisma.diagnosticConversation.findFirst({
      where: { sessionToken },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation session not found");
    }

    const { extension } = this.storageService.validateUpload(file.buffer, file.mimetype, file.originalname);
    const storageKey = `chat-diagnostic/${conversation.id}/${Date.now()}${extension}`;

    // Private upload to MinIO
    await this.storageService.uploadBuffer(storageKey, file.buffer, file.mimetype);

    let visionObservations: any = {};

    try {
      // No apiKey passed — the active provider (selected via
      // DIAGNOSTIC_VISION_PROVIDER) resolves its own key from its own env
      // var, so this call site doesn't need to know which provider is active.
      const analysis = await this.visionProvider.analyzeImage(file.buffer, file.mimetype, {});

      visionObservations = analysis.cosmeticObservations;

      // Zero-retention cleanup: delete raw image binary from MinIO storage immediately
      await this.storageService.removeObject(storageKey);
    } catch (err) {
      this.logger.error(`Photo analysis failed: ${(err as Error).message}`);
    }

    let profile: NeedProfile;
    try {
      profile = JSON.parse(conversation.profile);
    } catch {
      profile = {
        domain: conversation.domain as any,
        routineComplexity: "Essentielle",
        needs: [],
        sensitivity: "medium",
        budgetMaxMillimes: null,
        brandPreferenceSlugs: [],
        spfDaily: null,
        pregnancyOrBreastfeeding: false,
        currentRoutine: [],
        sources: {},
      };
    }

    profile.photoObservations = visionObservations;

    await this.prisma.diagnosticConversation.update({
      where: { id: conversation.id },
      data: { profile: JSON.stringify(profile) },
    });

    // Inject user photo notice message
    const photoNotice = `📷 [Photo transmise pour analyse visuelle cosmétique]`;
    return this.handleUserMessage(sessionToken, photoNotice);
  }

  async resetConversation(sessionToken: string) {
    const conversation = await this.prisma.diagnosticConversation.findFirst({
      where: { sessionToken },
    });

    if (conversation) {
      await this.prisma.diagnosticMessage.deleteMany({
        where: { conversationId: conversation.id },
      });
      const defaultProfile: NeedProfile = {
        domain: conversation.domain as any,
        routineComplexity: "Essentielle",
        needs: [],
        sensitivity: "medium",
        budgetMaxMillimes: null,
        brandPreferenceSlugs: [],
        spfDaily: null,
        pregnancyOrBreastfeeding: false,
        currentRoutine: [],
        sources: {},
      };
      await this.prisma.diagnosticConversation.update({
        where: { id: conversation.id },
        data: { profile: JSON.stringify(defaultProfile), summary: null },
      });
    }

    return this.createSession(conversation?.domain as any || "SKIN");
  }

  /**
   * Lowercase, accent-stripped, hyphen-normalized text — used both to build
   * the search query and (implicitly, via Meilisearch's own tokenizer) to
   * match it. Postgres `contains` doesn't deburr on its own, so this is what
   * makes the fallback path treat "Vitamine-C" / "vitamine c" / "VITAMINE C"
   * as the same term.
   */
  private normalizeSearchText(text: string): string {
    // Strips combining diacritical marks (U+0300-U+036F) left behind by
    // NFD normalization — built from char codes rather than a literal
    // range to avoid an invisible/ambiguous Unicode range in source.
    const COMBINING_DIACRITICS = new RegExp(
      `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
      "g",
    );
    return text
      .normalize("NFD")
      .replace(COMBINING_DIACRITICS, "")
      .toLowerCase()
      .replace(/[-_]+/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private static readonly CONVERSATIONAL_FILLER = new Set([
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
    "veux", "voudrais", "voudrait", "cherche", "cherchez", "donne", "donnez", "moi",
    "du", "de", "des", "la", "le", "les", "un", "une", "et", "ou",
    "avoir", "pour", "dans", "avec", "sans", "plus", "moins", "cette", "cet", "ce",
    "avez", "votre", "vos", "que", "qui", "est", "suis", "svp", "stp", "merci",
    "bonjour", "salut", "peux", "pouvez", "aimerais", "besoin", "un", "peu",
  ]);

  /** Multi-word terms that must survive filler-stripping intact. */
  private static readonly CANONICAL_TERMS: Record<string, string> = {
    "vitamine c": "vitamine c",
    "vitamin c": "vitamine c",
    "vit c": "vitamine c",
    magnesium: "magnesium",
    zinc: "zinc",
    "spf 50": "spf50",
    spf50: "spf50",
    collagene: "collagene",
  };

  /**
   * Turns free-form chat text into a single search query — a literal
   * product/ingredient/brand term is passed through as-is (not reinterpreted
   * into a broader "need"), per the rule that "je veux du zinc" must search
   * for zinc, not get expanded into unrelated skin concerns.
   */
  private buildSearchQuery(userText: string): string {
    const normalized = this.normalizeSearchText(userText);

    for (const [phrase, canonical] of Object.entries(DiagnosticConversationService.CANONICAL_TERMS)) {
      if (normalized.includes(phrase)) return canonical;
    }

    const words = normalized
      .split(" ")
      .filter((w) => w.length >= 3 && !DiagnosticConversationService.CONVERSATIONAL_FILLER.has(w));

    return words.join(" ").trim();
  }

  private async hydrateRecommendationProducts(recommendation: any) {
    if (!recommendation.productIds?.length) return recommendation;

    const dbProducts = await this.catalogueService.findPublishedByIds(recommendation.productIds);
    // Static uploads (main.ts useStaticAssets) are served from the API's
    // origin root, not under the /api/v1 prefix — NEXT_PUBLIC_API_URL
    // includes that prefix (it's built for JSON fetch calls), so it has to
    // be stripped here or every chat image 404s against a /api/v1/uploads
    // path that doesn't exist.
    const apiBaseUrl = (process.env.PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api\/v\d+\/?$/, "");

    const productMap = new Map(
      dbProducts.map((p: any) => {
        let rawImage = p.image || p.images?.[0]?.url || "";
        if (rawImage && !rawImage.startsWith("http://") && !rawImage.startsWith("https://")) {
          rawImage = `${apiBaseUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
        }

        return [
          p.id,
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            brandName: p.brand?.name || "",
            categoryName: p.category?.name || "",
            priceMillimes: p.variants?.[0]?.priceMillimes || 0,
            priceDT: `${((p.variants?.[0]?.priceMillimes || 0) / 1000).toFixed(3)} DT`,
            image: rawImage || "/assets/placeholder-product.webp",
            inStock: (p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) ?? 0) > 0,
            description: (p.description || "").slice(0, 200),
          },
        ];
      }),
    );

    const items = recommendation.productIds.map((id: string) => productMap.get(id)).filter(Boolean);

    return {
      ...recommendation,
      products: items,
    };
  }
}
