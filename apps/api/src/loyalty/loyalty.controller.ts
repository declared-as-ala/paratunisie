import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { LoyaltyService } from "./loyalty.service";

@Controller("loyalty")
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get("account/:userId")
  async getAccount(@Param("userId") userId: string) {
    return this.loyaltyService.getAccount(userId);
  }

  @Post("add-points")
  async addPoints(@Body() body: { userId: string; points: number; type: string; description?: string }) {
    return this.loyaltyService.addPoints(body.userId, body.points, body.type, body.description);
  }
}
