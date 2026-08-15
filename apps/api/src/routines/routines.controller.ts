import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { RoutinesService } from "./routines.service";

@Controller("routines")
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  async saveRoutine(
    @Body() body: { userId: string; tier: string; answers: unknown; items: { productId: string; slot: string; reason?: string; position: number }[] },
  ) {
    return this.routinesService.saveRoutine(body.userId, body);
  }

  @Get("user/:userId")
  async getUserRoutines(@Param("userId") userId: string) {
    return this.routinesService.getRoutinesByUser(userId);
  }
}
