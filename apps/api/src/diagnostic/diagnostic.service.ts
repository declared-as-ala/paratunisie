import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { QuestionnaireService } from "./questionnaire.service";
import { RecommendationService } from "./recommendation.service";
import { DiagnosticStorageService } from "./diagnostic-storage.service";
import { DiagnosticVisionProvider } from "./vision/diagnostic-vision.provider";
import { BUDGET_MAX_MILLIMES } from "./diagnostic-rules/build-need-profile";
import { DiagnosticDomain, NeedProfile, RawAnswers, RoutineResult } from "./diagnostic.types";
import { DIAGNOSTIC_VISION_PROVIDER } from "./diagnostic.tokens";

/** OpenRouter is the sole diagnostic vision provider (D-0032). */
function activeVisionApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class DiagnosticService {
  private readonly logger = new Logger(DiagnosticService.name);

  constructor(
    private prisma: PrismaService,
    private questionnaireService: QuestionnaireService,
    private recommendationService: RecommendationService,
    private diagnosticStorageService: DiagnosticStorageService,
    @Inject(DIAGNOSTIC_VISION_PROVIDER) private visionProvider: DiagnosticVisionProvider,
  ) {}

  async getConfig(domain: DiagnosticDomain) {
    const questions = await this.prisma.diagnosticQuestion.findMany({
      where: { domain, active: true },
      orderBy: { position: "asc" },
      include: { options: { where: { active: true }, orderBy: { position: "asc" } } },
    });

    const isVisionEnabled = process.env.DIAGNOSTIC_VISION_ENABLED === "true";
    const hasVisionKey = Boolean(activeVisionApiKey());

    return {
      domain,
      questions,
      photoAnalysisEnabled: isVisionEnabled && hasVisionKey,
    };
  }

  async createSession(domain: DiagnosticDomain, userId?: string) {
    const sessionToken = userId ? null : randomUUID();
    const routine = await this.prisma.routine.create({
      data: { domain, tier: "Essentielle", userId: userId ?? null, sessionToken, answers: "{}", profile: "{}" },
    });
    return { id: routine.id, sessionToken };
  }

  private async loadRoutineOrThrow(id: string) {
    const routine = await this.prisma.routine.findUnique({ where: { id } });
    if (!routine) throw new NotFoundException("Session de diagnostic introuvable");
    return routine;
  }

  async saveAnswers(id: string, patch: Record<string, unknown>) {
    const routine = await this.loadRoutineOrThrow(id);
    const existingAnswers = JSON.parse(routine.answers || "{}");
    const mergedAnswers: RawAnswers = { ...existingAnswers, ...patch } as RawAnswers;
    const profile = this.questionnaireService.buildProfile(routine.domain as DiagnosticDomain, mergedAnswers);

    await this.prisma.routine.update({
      where: { id },
      data: {
        answers: JSON.stringify(mergedAnswers),
        profile: JSON.stringify(profile),
        tier: profile.routineComplexity,
      },
    });

    return { answers: mergedAnswers, profile };
  }

  async uploadPhoto(sessionId: string, file: MulterFile) {
    const routine = await this.loadRoutineOrThrow(sessionId);

    const validation = this.diagnosticStorageService.validateUpload(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    const objectKey = `diagnostic-photos/${sessionId}/${randomUUID()}${validation.extension}`;
    await this.diagnosticStorageService.uploadBuffer(objectKey, file.buffer, validation.mimeType);

    // Store photo record in Postgres with storageKey set
    const photoRecord = await this.prisma.diagnosticPhoto.create({
      data: {
        routineId: routine.id,
        sessionToken: routine.sessionToken,
        userId: routine.userId,
        storageKey: objectKey,
        observations: "{}",
        confidence: "{}",
        redFlag: false,
      },
    });

    return {
      photoId: photoRecord.id,
      storageKey: objectKey,
    };
  }

  async analyzePhoto(sessionId: string) {
    const routine = await this.loadRoutineOrThrow(sessionId);

    const photo = await this.prisma.diagnosticPhoto.findFirst({
      where: { routineId: sessionId },
      orderBy: { createdAt: "desc" },
    });

    if (!photo) {
      throw new BadRequestException("Aucune photo n'a été téléversée pour cette session");
    }

    if (!photo.storageKey) {
      if (photo.observations && photo.observations !== "{}") {
        return {
          observations: JSON.parse(photo.observations),
          confidence: JSON.parse(photo.confidence),
          redFlag: photo.redFlag,
          redFlagReason: photo.redFlagReason,
        };
      }
      throw new BadRequestException("La photo de cette session a déjà été traitée et supprimée");
    }

    if (!activeVisionApiKey()) {
      throw new BadRequestException("Le service d'analyse photo n'est pas configuré sur le serveur (clé API manquante)");
    }

    const storageKey = photo.storageKey;
    const imageBuffer = await this.diagnosticStorageService.getObjectBuffer(storageKey);
    const mimeType = storageKey.endsWith(".png")
      ? "image/png"
      : storageKey.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    // No apiKey passed — the active provider resolves its own key from its own env var.
    const visionResult = await this.visionProvider.analyzeImage(imageBuffer, mimeType, {});

    // UPDATE Postgres record with observations, confidence, redFlag, and RESET storageKey to null
    await this.prisma.diagnosticPhoto.update({
      where: { id: photo.id },
      data: {
        observations: JSON.stringify(visionResult.cosmeticObservations),
        confidence: JSON.stringify(visionResult.confidence),
        redFlag: visionResult.redFlag,
        redFlagReason: visionResult.redFlagReason,
        provider: visionResult.provider,
        model: visionResult.model,
        storageKey: null, // ZERO RETENTION: Storage key cleared in DB
      },
    });

    // IMMEDIATELY DELETE raw photo binary from private MinIO bucket
    await this.diagnosticStorageService.removeObject(storageKey);

    // Merge photo observations into session profile
    const existingProfile: NeedProfile = routine.profile && routine.profile !== "{}"
      ? JSON.parse(routine.profile)
      : this.questionnaireService.buildProfile(routine.domain as DiagnosticDomain, JSON.parse(routine.answers || "{}"));

    const mergedProfile = this.questionnaireService.mergePhotoObservations(
      existingProfile,
      visionResult.cosmeticObservations,
    );

    await this.prisma.routine.update({
      where: { id: sessionId },
      data: { profile: JSON.stringify(mergedProfile) },
    });

    return {
      observations: visionResult.cosmeticObservations,
      confidence: visionResult.confidence,
      redFlag: visionResult.redFlag,
      redFlagReason: visionResult.redFlagReason,
      profile: mergedProfile,
    };
  }

  async getResult(id: string): Promise<RoutineResult> {
    const routine = await this.loadRoutineOrThrow(id);
    const profile: NeedProfile = JSON.parse(routine.profile || "{}");
    if (!profile.domain) {
      throw new BadRequestException("Répondez au questionnaire avant de consulter votre routine");
    }

    // Check if redFlag was detected in photo analysis
    const photo = await this.prisma.diagnosticPhoto.findFirst({
      where: { routineId: id },
      orderBy: { createdAt: "desc" },
    });

    if (photo && photo.redFlag) {
      return {
        domain: routine.domain as DiagnosticDomain,
        tier: routine.tier as any,
        profile,
        am: [],
        pm: [],
        unfilledRoles: [],
        totalMillimes: 0,
        itemCount: 0,
        redFlag: true,
        redFlagReason: photo.redFlagReason || "Signal cutané nécessitant un avis spécialisé.",
        referralNotice:
          "Consultation médicale recommandée — notre système d'analyse visuelle a identifié un signe nécessitant un avis dermatologique ou médical préalable avant l'établissement d'une routine cosmétique.",
      } as any;
    }

    return this.recommendationService.buildRoutine(profile);
  }

  async adjustBudget(id: string, budgetKey: string): Promise<RoutineResult> {
    const routine = await this.loadRoutineOrThrow(id);
    const profile = JSON.parse(routine.profile || "{}");
    if (!profile.domain) throw new BadRequestException("Répondez au questionnaire avant d'ajuster le budget");
    if (!(budgetKey in BUDGET_MAX_MILLIMES)) throw new BadRequestException("Budget invalide");

    profile.budgetMaxMillimes = BUDGET_MAX_MILLIMES[budgetKey];
    await this.prisma.routine.update({ where: { id }, data: { profile: JSON.stringify(profile) } });
    return this.getResult(id);
  }

  async pickAlternative(id: string, currentProductId: string, role: string, preference?: string) {
    const routine = await this.loadRoutineOrThrow(id);
    const profile = JSON.parse(routine.profile || "{}");
    if (!profile.domain) throw new BadRequestException("Répondez au questionnaire avant de demander une alternative");
    const alternative = await this.recommendationService.pickAlternative(profile, currentProductId, role, preference);
    if (!alternative) {
      throw new NotFoundException(
        "Nous n'avons pas trouvé d'alternative correspondante dans notre catalogue pour le moment.",
      );
    }
    return alternative;
  }
}
