import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../admin-auth/guards/admin-auth.guard";
import { LoyaltyService } from "./loyalty.service";

@Controller("loyalty")
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @UseGuards(AdminAuthGuard)
  @Get("admin/stats")
  async getAdminStats() {
    return this.loyaltyService.getAdminStats();
  }

  @Get("account/:userId")
  async getAccount(@Param("userId") userId: string) {
    return this.loyaltyService.getAccount(userId);
  }

  @Get("account/:userId/transactions")
  async getTransactions(@Param("userId") userId: string) {
    return this.loyaltyService.getAccountTransactions(userId);
  }

  @Post("redeem")
  async redeemPoints(@Body() body: { userId: string; points: number; orderId?: string }) {
    return this.loyaltyService.redeemPoints(body.userId, body.points, body.orderId);
  }

  @UseGuards(AdminAuthGuard)
  @Post("order/:orderId/award")
  async awardOrderPoints(@Param("orderId") orderId: string) {
    return this.loyaltyService.awardOrderPoints(orderId);
  }

  @UseGuards(AdminAuthGuard)
  @Post("order/:orderId/reverse")
  async reverseOrderPoints(@Param("orderId") orderId: string) {
    return this.loyaltyService.reverseOrderPoints(orderId);
  }
}
