import { Module } from "@nestjs/common";
import { CatalogueModule } from "../catalogue/catalogue.module";
import { DiagnosticController } from "./diagnostic.controller";
import { DiagnosticService } from "./diagnostic.service";
import { QuestionnaireService } from "./questionnaire.service";
import { RecommendationService } from "./recommendation.service";
import { OpenAiRecommendationProvider } from "./ai/openai-recommendation.provider";
import { DiagnosticStorageService } from "./diagnostic-storage.service";
import { OpenRouterVisionProvider } from "./vision/openrouter-vision.provider";

import { DiagnosticConversationService } from "./diagnostic-conversation.service";
import { OpenRouterConversationProvider } from "./ai/openrouter-conversation.provider";
import { DIAGNOSTIC_CONVERSATION_PROVIDER, DIAGNOSTIC_VISION_PROVIDER } from "./diagnostic.tokens";

@Module({
  imports: [CatalogueModule],
  controllers: [DiagnosticController],
  providers: [
    DiagnosticService,
    QuestionnaireService,
    RecommendationService,
    OpenAiRecommendationProvider,
    DiagnosticStorageService,
    OpenRouterVisionProvider,
    DiagnosticConversationService,
    OpenRouterConversationProvider,
    { provide: DIAGNOSTIC_VISION_PROVIDER, useExisting: OpenRouterVisionProvider },
    { provide: DIAGNOSTIC_CONVERSATION_PROVIDER, useExisting: OpenRouterConversationProvider },
  ],
  exports: [
    DiagnosticService,
    DiagnosticStorageService,
    DiagnosticConversationService,
    DIAGNOSTIC_VISION_PROVIDER,
    DIAGNOSTIC_CONVERSATION_PROVIDER,
  ],
})
export class DiagnosticModule {}
