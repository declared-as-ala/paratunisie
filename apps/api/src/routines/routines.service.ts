import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  async saveRoutine(userId: string, data: { tier: string; answers: unknown; items: { productId: string; slot: string; reason?: string; position: number }[] }) {
    return this.prisma.routine.create({
      data: {
        userId,
        tier: data.tier,
        answers: JSON.stringify(data.answers),
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            slot: item.slot,
            reason: item.reason,
            position: item.position,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  async getRoutinesByUser(userId: string) {
    return this.prisma.routine.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
