import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getAccount(userId: string) {
    return this.prisma.loyaltyAccount.findUnique({ where: { userId } });
  }

  async addPoints(userId: string, points: number, type: string, description?: string) {
    const account = await this.prisma.loyaltyAccount.upsert({
      where: { userId },
      create: { userId, points, tier: this.calculateTier(points) },
      update: { points: { increment: points } },
    });

    await this.prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        points,
        type,
        description,
      },
    });

    return account;
  }

  private calculateTier(points: number): string {
    if (points >= 1500) return "Or";
    if (points >= 500) return "Argent";
    return "Bronze";
  }
}
