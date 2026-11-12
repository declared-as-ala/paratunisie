import { BadRequestException, ConflictException } from "@nestjs/common";
import { LandingOrdersService } from "./landing-orders.service";

const VARIANT = { id: "v1", productId: "p1", label: "2.25kg", priceMillimes: 259000, stock: 5, product: { id: "p1", name: "Anabolic Whey 80" } };
const BASE = {
  checkoutSessionId: "chk_lp_1",
  landingId: "anabolic-whey-80",
  productId: "p1",
  productVariantId: "v1",
  quantity: 1,
  customerName: "Ahmed Ben Ali",
  phone: "+216 98 123 456",
  gouvernorat: "Tunis",
  fullAddress: "10 rue de Carthage, Tunis",
};
const CTX = { rateKey: "1.2.3.4" };

function build(opts: { variant?: any; claim?: string; draft?: any; createOrder?: jest.Mock } = {}) {
  const variant = "variant" in opts ? opts.variant : VARIANT;
  const prisma = {
    productVariant: {
      findUnique: jest.fn().mockResolvedValue(variant),
      findFirst: jest.fn().mockResolvedValue(variant),
    },
    order: {
      findUnique: jest.fn().mockResolvedValue({
        id: "ord_old_abcdef",
        totalMillimes: 259000,
        loyaltyDiscountMillimes: 0,
        items: [{ priceMillimes: 259000, quantity: 1 }],
      }),
    },
  } as any;
  const orders = {
    createOrder: opts.createOrder ?? jest.fn().mockResolvedValue({ id: "ord_new_123456", totalMillimes: 518000 }),
  } as any;
  const drafts = {
    findBySession: jest.fn().mockResolvedValue(opts.draft ?? null),
    upsertDraft: jest.fn().mockResolvedValue({ status: "created" }),
    claimForOrder: jest.fn().mockResolvedValue(opts.claim ?? "claimed"),
    releaseClaim: jest.fn().mockResolvedValue(undefined),
    markConverted: jest.fn().mockResolvedValue(undefined),
  } as any;
  return { service: new LandingOrdersService(prisma, orders, drafts), prisma, orders, drafts };
}

describe("LandingOrdersService.create", () => {
  it("prices the order from the catalogue and normalises the phone", async () => {
    const { service, orders, drafts } = build();
    const res = await service.create({ ...BASE, quantity: 2 } as any, CTX);
    const arg = orders.createOrder.mock.calls[0][0];
    expect(arg.items).toEqual([{ productId: "p1", productVariantId: "v1", quantity: 2, priceMillimes: 259000 }]);
    expect(arg.phone).toBe("98123456");
    expect(res).toMatchObject({ id: "ord_new_123456", reference: "PT-123456", subtotalMillimes: 518000, deliveryFeeMillimes: 7000, replayed: false });
    expect(drafts.markConverted).toHaveBeenCalledWith("chk_lp_1", "ord_new_123456");
  });

  it("reuses one event id for Pixel and CAPI so Purchase is de-duplicated", async () => {
    const { service, orders } = build();
    const res = await service.create({ ...BASE, purchaseEventId: "purchase_chk_lp_1" } as any, CTX);
    expect(orders.createOrder.mock.calls[0][0].eventId).toBe("purchase_chk_lp_1");
    expect(res.eventId).toBe("purchase_chk_lp_1");
  });

  it("rejects invalid phone, governorate and address without creating an order", async () => {
    const { service, orders } = build();
    await expect(service.create({ ...BASE, phone: "12345" } as any, CTX)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.create({ ...BASE, gouvernorat: "Paris" } as any, CTX)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.create({ ...BASE, fullAddress: "ab" } as any, CTX)).rejects.toBeInstanceOf(BadRequestException);
    expect(orders.createOrder).not.toHaveBeenCalled();
  });

  it("refuses out-of-stock and over-quantity orders", async () => {
    await expect(build({ variant: { ...VARIANT, stock: 0 } }).service.create(BASE as any, CTX)).rejects.toBeInstanceOf(ConflictException);
    const { service, orders } = build();
    await expect(service.create({ ...BASE, quantity: 6 } as any, CTX)).rejects.toBeInstanceOf(ConflictException);
    expect(orders.createOrder).not.toHaveBeenCalled();
  });

  it("rejects a quantity above the per-order maximum instead of silently reducing it", async () => {
    const { service, orders } = build({ variant: { ...VARIANT, stock: 50 } });
    await expect(service.create({ ...BASE, quantity: 30 } as any, CTX)).rejects.toBeInstanceOf(BadRequestException);
    expect(orders.createOrder).not.toHaveBeenCalled();
  });

  it("is idempotent: a retry after a converted draft returns the existing order and creates nothing", async () => {
    const { service, orders } = build({ draft: { convertedOrderId: "ord_old_abcdef", purchaseEventId: "purchase_chk_lp_1" } });
    const res = await service.create(BASE as any, CTX);
    expect(res).toMatchObject({ id: "ord_old_abcdef", reference: "PT-ABCDEF", replayed: true, eventId: "purchase_chk_lp_1" });
    expect(orders.createOrder).not.toHaveBeenCalled();
  });

  it("only one concurrent submit wins the claim", async () => {
    const { service, orders } = build({ claim: "busy" });
    await expect(service.create(BASE as any, CTX)).rejects.toBeInstanceOf(ConflictException);
    expect(orders.createOrder).not.toHaveBeenCalled();
  });

  it("releases the claim when order creation fails so the customer can retry", async () => {
    const createOrder = jest.fn().mockRejectedValue(new Error("db down"));
    const { service, drafts } = build({ createOrder });
    await expect(service.create(BASE as any, CTX)).rejects.toThrow("db down");
    expect(drafts.releaseClaim).toHaveBeenCalledWith("chk_lp_1");
  });

  it("rate limits repeated attempts from one client", async () => {
    const { service } = build();
    const ctx = { rateKey: "9.9.9.9" };
    for (let i = 0; i < 8; i++) await service.create({ ...BASE, checkoutSessionId: `s${i}` } as any, ctx);
    await expect(service.create({ ...BASE, checkoutSessionId: "s9" } as any, ctx)).rejects.toBeInstanceOf(ConflictException);
  });
});
