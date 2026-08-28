import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { POINT_VALUE_TND, POINTS_PER_TND, calculatePointsEarned, calculatePointsDiscountMillimes } from "./loyalty.constants";

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getAccount(userId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!account) {
      account = await this.prisma.loyaltyAccount.create({
        data: {
          userId,
          points: 0,
          tier: "Bronze",
        },
        include: {
          transactions: true,
        },
      });
    }

    const availableValueTnd = Number((account.points * POINT_VALUE_TND).toFixed(3));
    const availableValueMillimes = calculatePointsDiscountMillimes(account.points);

    return {
      id: account.id,
      userId: account.userId,
      points: account.points,
      tier: account.tier,
      availableValueTnd,
      availableValueMillimes,
      transactions: account.transactions,
    };
  }

  async getAccountTransactions(userId: string) {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });

    if (!account) return [];

    return this.prisma.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Idempotent point accrual upon order completion (e.g. LIVREE / CONFIRMEE).
   */
  async awardOrderPoints(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) return null;

    let targetUserId = order.userId;
    if (order.user) {
      const userPhone = order.user.phone;
      const userEmail = order.user.email;
      const matchedCustomer = await this.prisma.user.findFirst({
        where: {
          role: "CUSTOMER",
          OR: [
            ...(userPhone ? [{ phone: userPhone }] : []),
            ...(userEmail && !userEmail.startsWith("customer-") && !userEmail.startsWith("client-") ? [{ email: userEmail }] : []),
          ],
        },
      });
      if (matchedCustomer) {
        targetUserId = matchedCustomer.id;
      }
    }

    if (!targetUserId) return null;

    // Check if points were already awarded for this order
    const existingEarnTx = await this.prisma.loyaltyTransaction.findFirst({
      where: {
        orderId,
        type: "EARN",
      },
    });

    if (existingEarnTx) {
      // Already awarded — idempotent no-op
      return existingEarnTx;
    }

    // Calculate product subtotal (excluding shipping)
    const productSubtotalMillimes = order.items.reduce(
      (sum, item) => sum + item.priceMillimes * item.quantity,
      0,
    );

    // Eligible paid amount for products after loyalty discount
    const netPaidProductMillimes = Math.max(0, productSubtotalMillimes - order.loyaltyDiscountMillimes);
    const pointsToEarn = order.loyaltyPointsEarned > 0
      ? order.loyaltyPointsEarned
      : calculatePointsEarned(netPaidProductMillimes);

    if (pointsToEarn <= 0) return null;

    return this.prisma.$transaction(async (tx) => {
      let account = await tx.loyaltyAccount.findUnique({
        where: { userId: targetUserId },
      });

      if (!account) {
        account = await tx.loyaltyAccount.create({
          data: {
            userId: targetUserId,
            points: 0,
            tier: "Bronze",
          },
        });
      }

      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: { increment: pointsToEarn },
          tier: this.calculateTier(account.points + pointsToEarn),
        },
      });

      const monetaryValueMillimes = calculatePointsDiscountMillimes(pointsToEarn);

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          userId: targetUserId,
          orderId: order.id,
          points: pointsToEarn,
          type: "EARN",
          monetaryValueMillimes,
          description: `Points cumulés sur la commande #${order.id.slice(-6).toUpperCase()}`,
        },
      });

      // Also ensure order record stores the loyaltyPointsEarned and ties to targetUserId
      await tx.order.update({
        where: { id: order.id },
        data: { loyaltyPointsEarned: pointsToEarn, userId: targetUserId },
      });

      return transaction;
    });
  }

  /**
   * Reverses awarded points if order is cancelled or refunded.
   */
  async reverseOrderPoints(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.userId) return null;

    const earnTx = await this.prisma.loyaltyTransaction.findFirst({
      where: { orderId, type: "EARN" },
    });

    if (!earnTx) return null; // No points were awarded to reverse

    const existingRefundTx = await this.prisma.loyaltyTransaction.findFirst({
      where: { orderId, type: "REFUND" },
    });

    if (existingRefundTx) return existingRefundTx; // Already reversed

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.loyaltyAccount.findUnique({
        where: { userId: order.userId },
      });

      if (!account) return null;

      const pointsToDeduct = earnTx.points;
      const newPoints = Math.max(0, account.points - pointsToDeduct);

      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: newPoints,
          tier: this.calculateTier(newPoints),
        },
      });

      return tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          userId: order.userId,
          orderId: order.id,
          points: -pointsToDeduct,
          type: "REFUND",
          monetaryValueMillimes: -calculatePointsDiscountMillimes(pointsToDeduct),
          description: `Annulation des points suite au retour/annulation de la commande #${order.id.slice(-6).toUpperCase()}`,
        },
      });
    });
  }

  /**
   * Redeems loyalty points for a checkout discount.
   */
  async redeemPoints(userId: string, pointsToRedeem: number, orderId?: string) {
    if (pointsToRedeem <= 0) {
      throw new BadRequestException("Le nombre de points à utiliser doit être supérieur à 0.");
    }

    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });

    if (!account || account.points < pointsToRedeem) {
      throw new BadRequestException(
        `Solde insuffisant (${account?.points ?? 0} points disponibles).`,
      );
    }

    const discountMillimes = calculatePointsDiscountMillimes(pointsToRedeem);

    return this.prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: { decrement: pointsToRedeem },
          tier: this.calculateTier(account.points - pointsToRedeem),
        },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          userId,
          orderId,
          points: -pointsToRedeem,
          type: "REDEEM",
          monetaryValueMillimes: -discountMillimes,
          description: orderId
            ? `Utilisation de ${pointsToRedeem} points sur la commande #${orderId.slice(-6).toUpperCase()}`
            : `Utilisation de ${pointsToRedeem} points de fidélité`,
        },
      });

      return {
        pointsRedeemed: pointsToRedeem,
        discountMillimes,
        newBalance: updatedAccount.points,
        transaction,
      };
    });
  }

  /**
   * Admin Analytics & Statistics for the Loyalty Dashboard
   */
  async getAdminStats() {
    const [accounts, transactions] = await Promise.all([
      this.prisma.loyaltyAccount.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { points: "desc" },
      }),
      this.prisma.loyaltyTransaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;

    for (const tx of transactions) {
      if (tx.type === "EARN" && tx.points > 0) totalPointsIssued += tx.points;
      if (tx.type === "REDEEM" && tx.points < 0) totalPointsRedeemed += Math.abs(tx.points);
    }

    const totalOutstandingPoints = accounts.reduce((sum, a) => sum + a.points, 0);
    const totalLiabilityTnd = Number((totalOutstandingPoints * POINT_VALUE_TND).toFixed(3));

    const topCustomers = accounts.slice(0, 10).map((acc) => ({
      userId: acc.userId,
      userName: acc.user?.name || "Client",
      userEmail: acc.user?.email,
      points: acc.points,
      tier: acc.tier,
      valueTnd: (acc.points * POINT_VALUE_TND).toFixed(3),
    }));

    return {
      pointsPerTnd: POINTS_PER_TND,
      pointValueTnd: POINT_VALUE_TND,
      totalAccounts: accounts.length,
      totalOutstandingPoints,
      totalLiabilityTnd,
      totalPointsIssued,
      totalPointsRedeemed,
      topCustomers,
      recentTransactions: transactions,
    };
  }

  private calculateTier(points: number): string {
    if (points >= 1500) return "Or";
    if (points >= 500) return "Argent";
    return "Bronze";
  }
}
