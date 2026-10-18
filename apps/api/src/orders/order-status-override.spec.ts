import { ConflictException, BadRequestException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { OrdersService } from "./orders.service";

// Regression: "Transition EXPEDIEE → EN_ATTENTE non autorisée" blocked legitimate corrections.
// Commercial status and Aramex shipment status are independent; admins need an audited override.
function build(orderStatus: OrderStatus, lockCount = 1) {
  const tx = {
    order: {
      updateMany: jest.fn().mockResolvedValue({ count: lockCount }),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "o1", status: "x" }),
    },
    orderStatusHistory: { create: jest.fn().mockResolvedValue({}) },
  };
  const prisma = {
    order: { findUnique: jest.fn().mockResolvedValue({ id: "o1", status: orderStatus, items: [{ id: "i", productVariantId: "v", quantity: 2, unitCostMillimes: null }] }) },
    shipment: { update: jest.fn(), updateMany: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(async (fn: any) => fn(tx)),
  } as any;
  const inventory = { reserveForOrder: jest.fn(), sellForOrder: jest.fn(), releaseReservationForOrder: jest.fn(), getWeightedAverageCost: jest.fn() } as any;
  const notifications = { processOrderNotifications: jest.fn().mockResolvedValue(undefined) } as any;
  const loyalty = { awardOrderPoints: jest.fn().mockResolvedValue({}), reverseOrderPoints: jest.fn().mockResolvedValue({}) } as any;
  const service = new OrdersService(prisma, inventory, notifications, {} as any, loyalty, {} as any);
  return { service, prisma, tx, inventory, notifications, loyalty };
}

describe("OrdersService.updateOrderStatus — normal workflow", () => {
  it("rejects EXPEDIEE → EN_ATTENTE with a French message pointing to the admin correction", async () => {
    const { service } = build(OrderStatus.EXPEDIEE);
    const err = await service.updateOrderStatus("o1", OrderStatus.EN_ATTENTE, "s1").catch((e) => e);
    expect(err).toBeInstanceOf(BadRequestException);
    expect(err.message).toContain("Expédiée");
    expect(err.message).toContain("En attente");
    expect(err.message).toContain("Correction administrateur");
    expect(err.message).not.toMatch(/EXPEDIEE|EN_ATTENTE/);
  });

  it("returns 409 and writes nothing when another admin changed the order first", async () => {
    const { service, tx } = build(OrderStatus.EN_ATTENTE, 0);
    await expect(service.updateOrderStatus("o1", OrderStatus.ANNULEE, "s1")).rejects.toBeInstanceOf(ConflictException);
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });
});

describe("OrdersService.updateOrderStatus — admin override", () => {
  it("requires a reason of at least 5 characters", async () => {
    const { service, tx } = build(OrderStatus.EXPEDIEE);
    await expect(service.updateOrderStatus("o1", OrderStatus.EN_ATTENTE, "s1", "  ", { override: true })).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it("allows EXPEDIEE → CONFIRMEE, audits it as an override, and never touches shipment, stock, loyalty or notifications", async () => {
    const { service, tx, prisma, inventory, loyalty, notifications } = build(OrderStatus.EXPEDIEE);
    await service.updateOrderStatus("o1", OrderStatus.CONFIRMEE, "s1", "Client rappelé, colis retourné au dépôt", { override: true });

    expect(tx.order.updateMany).toHaveBeenCalledWith({ where: { id: "o1", status: OrderStatus.EXPEDIEE }, data: { status: OrderStatus.CONFIRMEE } });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ isOverride: true, fromStatus: OrderStatus.EXPEDIEE, toStatus: OrderStatus.CONFIRMEE, note: expect.stringContaining("[CORRECTION ADMIN]") }),
    });
    expect(prisma.shipment.update).not.toHaveBeenCalled();
    expect(prisma.shipment.updateMany).not.toHaveBeenCalled();
    expect(prisma.shipment.delete).not.toHaveBeenCalled();
    expect(inventory.reserveForOrder).not.toHaveBeenCalled();
    expect(inventory.sellForOrder).not.toHaveBeenCalled();
    expect(inventory.releaseReservationForOrder).not.toHaveBeenCalled();
    expect(loyalty.awardOrderPoints).not.toHaveBeenCalled();
    expect(notifications.processOrderNotifications).not.toHaveBeenCalled();
  });

  it("refuses a no-op change to the same status", async () => {
    const { service } = build(OrderStatus.CONFIRMEE);
    await expect(service.updateOrderStatus("o1", OrderStatus.CONFIRMEE, "s1", "motif valable", { override: true })).rejects.toThrow(/déjà au statut/);
  });

  it("returns 409 on concurrent modification", async () => {
    const { service } = build(OrderStatus.LIVREE, 0);
    await expect(service.updateOrderStatus("o1", OrderStatus.CONFIRMEE, "s1", "motif valable", { override: true })).rejects.toBeInstanceOf(ConflictException);
  });
});
