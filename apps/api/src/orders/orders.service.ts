import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryService } from "../inventory/inventory.service";
import { isValidTransition, getAllowedTransitions } from "./order-status";

// Fallback data for local dev before a Postgres connection exists — getAllOrders/
// createOrder try Prisma first and only fall back here on failure. Not used by
// updateOrderStatus, which is Prisma-only (see D-0024): a status change has real
// inventory side effects, so it must operate on a real order or fail loudly.
export const seededOrders = [
  {
    id: "53384",
    createdAt: new Date().toISOString(),
    gouvernorat: "Bizerte",
    fullAddress: "JARJOUNA BALADIYET WED ROMEN",
    totalMillimes: 58900,
    status: "CONFIRMEE",
    user: { name: "RAED Y", phone: "27578505", email: "raed@email.tn", orders: [1, 2] },
    items: [
      {
        product: { name: "Anthelios Fluide Invisible SPF50+" },
        quantity: 1,
        priceMillimes: 58900,
      },
    ],
  },
  {
    id: "53383",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    gouvernorat: "Tunis",
    fullAddress: "Avenue Habib Bourguiba, Le Kram",
    totalMillimes: 36900,
    status: "EN_ATTENTE",
    user: { name: "Amira Ben Salah", phone: "22765421", email: "amira@email.tn", orders: [1] },
    items: [
      {
        product: { name: "Sensibio H2O 500ml" },
        quantity: 1,
        priceMillimes: 36900,
      },
    ],
  },
  {
    id: "53381",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    gouvernorat: "Sfax",
    fullAddress: "Route de Teniour Km 3",
    totalMillimes: 42500,
    status: "TENTATIVE_CONTACT",
    user: { name: "Mohamed Karoui", phone: "29522746", email: "mohamed@email.tn", orders: [1] },
    items: [
      {
        product: { name: "Crème Hydratante Visage CeraVe" },
        quantity: 1,
        priceMillimes: 42500,
      },
    ],
  },
  {
    id: "53380",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    gouvernorat: "Sousse",
    fullAddress: "Kantaoui Center",
    totalMillimes: 91000,
    status: "ANNULEE",
    user: { name: "Fatma Slimani", phone: "28694036", email: "fatma@email.tn", orders: [1] },
    items: [
      {
        product: { name: "Liftactiv Sérum Vitamine C Vichy" },
        quantity: 1,
        priceMillimes: 91000,
      },
    ],
  },
];

import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "@prisma/client";
import { MetaCapiService } from "../meta-capi/meta-capi.service";
import { LoyaltyService } from "../loyalty/loyalty.service";
import { calculatePointsEarned, calculatePointsDiscountMillimes } from "../loyalty/loyalty.constants";
import { AbandonedCheckoutsService } from "../abandoned-checkouts/abandoned-checkouts.service";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private notificationsService: NotificationsService,
    private metaCapiService: MetaCapiService,
    private loyaltyService: LoyaltyService,
    private abandonedCheckoutsService: AbandonedCheckoutsService,
  ) {}

  async getAllOrders() {
    try {
      const orders = await this.prisma.order.findMany({
        include: {
          user: true,
          items: {
            include: {
              product: true,
              productVariant: true,
            },
          },
          shipment: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      });
      // Empty is a real database state. Falling back here made deleted orders
      // reappear after refresh when the final real row was removed.
      return orders;
    } catch {}
    return seededOrders;
  }

  async createOrder(data: {
    userId?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    gouvernorat: string;
    fullAddress: string;
    deliveryNote?: string;
    eventId?: string;
    fbp?: string;
    fbc?: string;
    clientIp?: string;
    clientUserAgent?: string;
    eventSourceUrl?: string;
    checkoutSessionId?: string;
    loyaltyPointsToRedeem?: number;
    items: { productId?: string; productVariantId?: string; quantity: number; priceMillimes: number }[];
  }) {
    const rawSubtotalMillimes = (data.items || []).reduce(
      (sum, item) => sum + item.priceMillimes * item.quantity,
      0,
    );

    // 1. Resolve User
    let targetUser: any = null;
    if (data.userId && data.userId !== "guest") {
      targetUser = await this.prisma.user.findUnique({ where: { id: data.userId } }).catch(() => null);
    }

    const typedName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const phone = data.phone ? data.phone.trim() : null;
    const email = data.email
      ? data.email.trim()
      : phone
        ? `client-${phone.replace(/\D/g, "")}@paratunisie.tn`
        : `customer-${Date.now()}@paratunisie.tn`;

    if (!targetUser && (phone || typedName || data.email)) {
      targetUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(phone ? [{ phone }] : []),
            ...(data.email ? [{ email: data.email.trim() }] : []),
          ],
        },
      }).catch(() => null);

      if (!targetUser) {
        targetUser = await this.prisma.user.create({
          data: {
            email,
            name: typedName || "Client Storefront",
            phone,
            password: "checkout_guest",
          },
        }).catch(() => null);
      } else if (typedName || phone) {
        targetUser = await this.prisma.user.update({
          where: { id: targetUser.id },
          data: {
            name: typedName || targetUser.name,
            phone: phone || targetUser.phone,
          },
        }).catch(() => targetUser);
      }
    }

    // Fallback user if DB operations fail (create guest instead of hijacking existing accounts)
    if (!targetUser) {
      targetUser = await this.prisma.user.create({
        data: {
          email: `guest-${Date.now()}@paratunisie.tn`,
          name: typedName || "Client Storefront",
          phone: phone || "27578505",
          password: "checkout_guest",
        },
      }).catch(() => null);
    }

    // Handle Loyalty Points Redemption on checkout
    let loyaltyPointsUsed = 0;
    let loyaltyDiscountMillimes = 0;

    if (data.loyaltyPointsToRedeem && data.loyaltyPointsToRedeem > 0 && targetUser) {
      const userAccount = await this.prisma.loyaltyAccount.findUnique({
        where: { userId: targetUser.id },
      });

      if (userAccount && userAccount.points > 0) {
        // Cannot redeem more points than account balance
        const pointsAvailable = Math.min(data.loyaltyPointsToRedeem, userAccount.points);
        const maxDiscountPossible = calculatePointsDiscountMillimes(pointsAvailable);

        // Cannot exceed product subtotal
        loyaltyDiscountMillimes = Math.min(rawSubtotalMillimes, maxDiscountPossible);
        loyaltyPointsUsed = Math.floor(loyaltyDiscountMillimes / 1000 / 0.05);

        if (loyaltyPointsUsed > 0) {
          await this.loyaltyService.redeemPoints(targetUser.id, loyaltyPointsUsed);
        }
      }
    }

    const netProductSubtotal = Math.max(0, rawSubtotalMillimes - loyaltyDiscountMillimes);
    const deliveryFeeMillimes = netProductSubtotal >= 99_000 ? 0 : 7_000;
    const finalTotalMillimes = netProductSubtotal + deliveryFeeMillimes;

    // Points earned only on net amount paid for products (shipping excluded)
    const loyaltyPointsEarned = calculatePointsEarned(netProductSubtotal);

    // 2. Resolve items to real Product & ProductVariant records.
    const createItemInputs: { productId: string; productVariantId: string; quantity: number; priceMillimes: number }[] = [];

    for (const item of data.items || []) {
      let pId = item.productId;
      let vId = item.productVariantId;

      if (vId) {
        const variant = await this.prisma.productVariant.findUnique({ where: { id: vId } });
        if (!variant) {
          throw new BadRequestException(`Variante de produit introuvable (${vId}). Veuillez actualiser votre panier.`);
        }
        pId = variant.productId;
      } else if (pId) {
        const prod = await this.prisma.product.findUnique({ where: { id: pId }, include: { variants: true } });
        if (!prod) {
          throw new BadRequestException(`Produit introuvable (${pId}). Veuillez actualiser votre panier.`);
        }
        if (prod.variants.length === 0) {
          throw new BadRequestException(`Le produit "${prod.name}" n'a plus de variante disponible.`);
        }
        vId = prod.variants[0].id;
      } else {
        throw new BadRequestException("Chaque article de la commande doit référencer un produit réel.");
      }

      createItemInputs.push({
        productId: pId,
        productVariantId: vId,
        quantity: item.quantity,
        priceMillimes: item.priceMillimes,
      });
    }

    try {
      const createdOrder = await this.prisma.order.create({
        data: {
          userId: targetUser.id,
          totalMillimes: finalTotalMillimes,
          loyaltyPointsUsed,
          loyaltyDiscountMillimes,
          loyaltyPointsEarned,
          gouvernorat: data.gouvernorat,
          fullAddress: data.fullAddress,
          deliveryNote: data.deliveryNote,
          items: {
            create: createItemInputs,
          },
          payment: { create: { method: "cod", amount: finalTotalMillimes, status: "pending" } },
          shipment: { create: { carrier: "Standard", status: "pending" } },
        },
        include: { items: { include: { product: true } }, payment: true, shipment: true, user: true },
      });

      // 3. Trigger Post-transaction ORDER_CREATED Notification (SMS & Email)
      this.notificationsService
        .processOrderNotifications(createdOrder.id, NotificationType.ORDER_CREATED)
        .catch((err) => console.error(`[OrdersService] Notification error for ${createdOrder.id}:`, err));

      // 4. Trigger Meta Conversions API (CAPI) Server-side Purchase event
      this.metaCapiService
        .trackPurchase(createdOrder, {
          eventId: data.eventId || `purchase_${createdOrder.id}`,
          clientIp: data.clientIp,
          clientUserAgent: data.clientUserAgent,
          fbp: data.fbp,
          fbc: data.fbc,
          eventSourceUrl: data.eventSourceUrl,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          city: data.gouvernorat,
        })
        .catch((err) => console.error(`[OrdersService] Meta CAPI Purchase error for ${createdOrder.id}:`, err));

      if (data.checkoutSessionId) {
        this.abandonedCheckoutsService.markConverted(data.checkoutSessionId, createdOrder.id);
      }

      return createdOrder;
    } catch (err: any) {
      // Never mask a real write failure with a fabricated success object —
      // that previously let the customer see "Commande confirmée" for an
      // order that was never persisted, while the merchant's real order
      // list (Prisma-backed) never saw it at all. A failed order creation
      // is a real error the client must see as one.
      console.error("[OrdersService] Failed to create order in DB:", err);
      throw new InternalServerErrorException(
        "La commande n'a pas pu être enregistrée. Veuillez réessayer dans un instant.",
      );
    }
  }

  // Canonical order-counts source (fixes sidebar badge vs Commandes header
  // drift — both now read this same query instead of independently deriving
  // totals).
  async getOrderCounts() {
    const [grouped, abandoned] = await Promise.all([
      this.prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      this.abandonedCheckoutsService.countAbandoned(),
    ]);

    const byStatus = Object.fromEntries(
      Object.values(OrderStatus).map((status) => [status, 0]),
    ) as Record<OrderStatus, number>;
    for (const row of grouped) {
      byStatus[row.status] = row._count;
    }

    const normal = grouped.reduce((sum, row) => sum + row._count, 0);

    return {
      total: normal + abandoned,
      normal,
      abandoned,
      deleted: 0,
      byStatus,
    };
  }

  async getOrdersByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, email: true },
    });

    return this.prisma.order.findMany({
      where: {
        OR: [
          { userId },
          ...(user?.phone ? [{ user: { phone: user.phone } }] : []),
          ...(user?.email ? [{ user: { email: user.email } }] : []),
        ],
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        shipment: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        shipment: true,
        payment: true,
      },
    });
    if (order) return order;
    return seededOrders.find((o) => o.id === orderId) || seededOrders[0];
  }

  async deleteOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!order) throw new NotFoundException("Commande introuvable");
    await this.prisma.$transaction([
      this.prisma.payment.deleteMany({ where: { orderId } }),
      this.prisma.shipment.deleteMany({ where: { orderId } }),
      this.prisma.order.delete({ where: { id: orderId } }),
    ]);
    return { id: orderId, deleted: true };
  }

  async bulkDeleteOrders(ids: string[]) {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length === 0) throw new BadRequestException("Aucune commande sélectionnée");

    const existing = await this.prisma.order.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (existing.length !== uniqueIds.length) {
      throw new NotFoundException("Une ou plusieurs commandes sélectionnées sont introuvables");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { orderId: { in: uniqueIds } } });
      await tx.shipment.deleteMany({ where: { orderId: { in: uniqueIds } } });
      return tx.order.deleteMany({ where: { id: { in: uniqueIds } } });
    });
    return { count: result.count, deleted: true };
  }

  // Guarded transition (D-0024) — validates against REQUIREMENTS.md §A.2's allowed
  // transitions, writes an OrderStatusHistory row, and triggers the matching
  // inventory hook (reserve on CONFIRMEE, sell on LIVREE, release on terminal
  // cancellation-like states). Operates on real Prisma data only — a status
  // change has real inventory consequences, so a missing order is a real 404,
  // not a silent fallback to mock data.
  async updateOrderStatus(orderId: string, toStatus: OrderStatus, staffId: string, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Commande introuvable");

    if (!isValidTransition(order.status, toStatus)) {
      const allowed = getAllowedTransitions(order.status);
      throw new BadRequestException(
        `Transition ${order.status} → ${toStatus} non autorisée. Transitions possibles : ${
          allowed.length > 0 ? allowed.join(", ") : "aucune (statut terminal)"
        }.`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: toStatus } }),
      this.prisma.orderStatusHistory.create({
        data: { orderId, fromStatus: order.status, toStatus, staffId, note },
      }),
    ]);

    const items = order.items.map((item) => ({
      variantId: item.productVariantId,
      quantity: item.quantity,
    }));

    if (toStatus === OrderStatus.CONFIRMEE) {
      await this.inventoryService.reserveForOrder(orderId, items, staffId);
      await this.snapshotItemCosts(order.items);
      this.notificationsService.processOrderNotifications(orderId, NotificationType.ORDER_CONFIRMED).catch(() => {});
      // Award loyalty points immediately when confirmed by admin
      await this.loyaltyService.awardOrderPoints(orderId).catch((err) => console.error("[OrdersService] Loyalty award error:", err));
    } else if (toStatus === OrderStatus.EXPEDIEE) {
      this.notificationsService.processOrderNotifications(orderId, NotificationType.ORDER_SHIPPED).catch(() => {});
    } else if (toStatus === OrderStatus.LIVREE) {
      await this.inventoryService.sellForOrder(orderId, items, staffId);
      // Award loyalty points idempotently upon delivery if not already awarded
      await this.loyaltyService.awardOrderPoints(orderId).catch((err) => console.error("[OrdersService] Loyalty award error:", err));
    } else if (
      toStatus === OrderStatus.ANNULEE ||
      toStatus === OrderStatus.REFUSEE ||
      toStatus === OrderStatus.RETOURNEE
    ) {
      await this.inventoryService.releaseReservationForOrder(orderId, items, staffId);
      // Reverse loyalty points if order is cancelled or refunded
      await this.loyaltyService.reverseOrderPoints(orderId).catch((err) => console.error("[OrdersService] Loyalty reverse error:", err));
      if (toStatus === OrderStatus.ANNULEE) {
        this.notificationsService.processOrderNotifications(orderId, NotificationType.ORDER_CANCELLED).catch(() => {});
      }
    }

    return updated;
  }

  // Cost snapshot at confirmation (REQUIREMENTS.md §4 profitability decision):
  // freezes each item's weighted-average acquisition cost the moment an order
  // becomes CONFIRMEE, so later PurchasePriceHistory changes never retroactively
  // move an already-confirmed order's profitability. Skips items that already
  // have a snapshot (defensive — CONFIRMEE is only reachable once per the state
  // machine, but never silently overwrite a real snapshot if this ever re-runs).
  private async snapshotItemCosts(items: { id: string; productVariantId: string; unitCostMillimes: number | null }[]) {
    for (const item of items) {
      if (item.unitCostMillimes !== null) continue;
      const cost = await this.inventoryService.getWeightedAverageCost(item.productVariantId);
      if (cost === null) continue;
      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: { unitCostMillimes: cost, costIsEstimated: false },
      });
    }
  }
}
