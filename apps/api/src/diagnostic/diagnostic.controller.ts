import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { DiagnosticService, MulterFile } from "./diagnostic.service";
import { AdjustBudgetDto, AlternativeDto, CreateSessionDto, SaveAnswersDto } from "./dto/diagnostic.dto";

import { DiagnosticConversationService } from "./diagnostic-conversation.service";

@Controller("diagnostic")
export class DiagnosticController {
  constructor(
    private diagnosticService: DiagnosticService,
    private conversationService: DiagnosticConversationService,
  ) {}

  @Get("config")
  async getConfig(@Query("domain") domain: "SKIN" | "HAIR" = "SKIN") {
    return this.diagnosticService.getConfig(domain === "HAIR" ? "HAIR" : "SKIN");
  }

  // ─── Conversational AI Beauty Advisor Endpoints ────────────────────

  @Post("chat/session")
  async createChatSession(@Body() body?: { domain?: "SKIN" | "HAIR" }) {
    return this.conversationService.createSession(body?.domain || "SKIN");
  }

  @Get("chat/:token")
  async getChatSession(@Param("token") token: string) {
    return this.conversationService.getSession(token);
  }

  @Post("chat/:token/message")
  async sendChatMessage(@Param("token") token: string, @Body() body: { text: string }) {
    return this.conversationService.handleUserMessage(token, body.text || "");
  }

  @Post("chat/:token/photo")
  @UseInterceptors(FileInterceptor("file"))
  async uploadChatPhoto(@Param("token") token: string, @UploadedFile() file: MulterFile) {
    return this.conversationService.uploadPhotoInChat(token, file);
  }

  @Post("chat/:token/reset")
  async resetChatSession(@Param("token") token: string) {
    return this.conversationService.resetConversation(token);
  }

  // ─── Legacy/Compatibility Endpoints ─────────────────────────────────

  @Post("session")
  async createSession(@Body() dto: CreateSessionDto) {
    return this.diagnosticService.createSession(dto.domain);
  }

  @Patch("session/:id/answers")
  async saveAnswers(@Param("id") id: string, @Body() dto: SaveAnswersDto) {
    return this.diagnosticService.saveAnswers(id, dto.answers);
  }

  @Post("session/:id/photo")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPhoto(@Param("id") id: string, @UploadedFile() file: MulterFile) {
    return this.diagnosticService.uploadPhoto(id, file);
  }

  @Post("session/:id/analyze")
  async analyzePhoto(@Param("id") id: string) {
    return this.diagnosticService.analyzePhoto(id);
  }

  @Get("session/:id/result")
  async getResult(@Param("id") id: string) {
    return this.diagnosticService.getResult(id);
  }

  @Post("session/:id/adjust-budget")
  async adjustBudget(@Param("id") id: string, @Body() dto: AdjustBudgetDto) {
    return this.diagnosticService.adjustBudget(id, dto.budget);
  }

  @Post("session/:id/alternatives")
  async pickAlternative(@Param("id") id: string, @Body() dto: AlternativeDto) {
    return this.diagnosticService.pickAlternative(id, dto.currentProductId, dto.role, dto.preference);
  }
}
