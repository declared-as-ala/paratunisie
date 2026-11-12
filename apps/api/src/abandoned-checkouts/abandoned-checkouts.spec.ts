import "reflect-metadata";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { AbandonedCheckoutsService } from "./abandoned-checkouts.service";
import { UpsertCheckoutDraftDto } from "./dto/upsert-draft.dto";

const VARIANT = { id: "v1", productId: "p1", label: "2.25kg", priceMillimes: 259000, stock: 9, product: { name: "Anabolic Whey 80", image: "/x.webp", images: [] } };

function build(existing: any = null) {
  const prisma = {
    productVariant: { findUnique: jest.fn().mockResolvedValue(VARIANT), findFirst: jest.fn().mockResolvedValue(VARIANT) },
    abandonedCheckout: {
      findUnique: jest.fn().mockResolvedValue(existing),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(async ({ data }: any) => ({ id: "d1", ...data })),
      update: jest.fn().mockImplementation(async ({ data }: any) => ({ id: "d1", ...existing, ...data })),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    abandonedCheckoutEvent: { create: jest.fn().mockResolvedValue({}) },
  } as any;
  const email = { sendEmail: jest.fn().mockResolvedValue({ success: true }) } as any;
  return { service: new AbandonedCheckoutsService(prisma, email), prisma, email };
}

const LANDING = {
  checkoutSessionId: "chk_lp_1",
  source: "LANDING_PAGE",
  customerName: "Ahmed Ben Ali",
  phone: "98 123 456",
  productId: "p1",
  quantity: 2,
  utmSource: "facebook",
  contactConsent: false,
  privacyNoticeShown: true,
} as any;

describe("landing draft capture", () => {
  it("saves only when a real name AND a valid Tunisian phone are present", async () => {
    const { service, prisma } = build();
    expect(await service.upsertDraft({ ...LANDING, phone: "123" }, "k1")).toMatchObject({ status: "ignored" });
    expect(await service.upsertDraft({ ...LANDING, customerName: "A" }, "k2")).toMatchObject({ status: "ignored" });
    expect(prisma.abandonedCheckout.create).not.toHaveBeenCalled();
    expect(await service.upsertDraft(LANDING, "k3")).toMatchObject({ status: "created" });
  });

  it("stores the normalised phone, recomputes price and shipping from the catalogue, and never consents by default", async () => {
    const { service, prisma } = build();
    await service.upsertDraft({ ...LANDING, subtotalMillimes: 1, totalMillimes: 1, items: [{ name: "x", quantity: 1, priceMillimes: 1 }] }, "k4");
    const data = prisma.abandonedCheckout.create.mock.calls[0][0].data;
    expect(data.phone).toBe("98123456");
    expect(data.subtotalMillimes).toBe(518000);
    expect(data.shippingFeeMillimes).toBe(7000);
    expect(data.totalMillimes).toBe(525000);
    expect(data.status).toBe("DRAFT");
    expect(data.contactConsent).toBe(false);
    expect(data.privacyNoticeShown).toBe(true);
    expect(JSON.parse(data.items)[0]).toMatchObject({ productId: "p1", quantity: 2, priceMillimes: 259000 });
  });

  it("updates the same record instead of creating a duplicate, and reopens a returning visitor", async () => {
    const { service, prisma } = build({ id: "d1", status: "ABANDONED", items: "[]", subtotalMillimes: 0, totalMillimes: 0, contactConsentAt: null });
    const res = await service.upsertDraft({ ...LANDING, fullAddress: "10 rue de Carthage" }, "k5");
    expect(res).toMatchObject({ status: "updated" });
    expect(prisma.abandonedCheckout.create).not.toHaveBeenCalled();
    expect(prisma.abandonedCheckout.update.mock.calls[0][0].data.status).toBe("DRAFT");
  });

  it("never reverts a recovered checkout", async () => {
    const { service, prisma } = build({ id: "d1", status: "CONVERTED" });
    expect(await service.upsertDraft(LANDING, "k6")).toMatchObject({ status: "already_converted" });
    expect(prisma.abandonedCheckout.update).not.toHaveBeenCalled();
  });

  it("rate limits a flooding client", async () => {
    const { service } = build();
    let last: any;
    for (let i = 0; i < 95; i++) last = await service.upsertDraft(LANDING, "flood");
    expect(last).toEqual({ status: "rate_limited" });
  });
});

describe("public DTO hardening", () => {
  it("rejects server-owned statuses from the public endpoint", async () => {
    for (const status of ["CONVERTED", "ARCHIVED", "EXPIRED"]) {
      const dto = plainToInstance(UpsertCheckoutDraftDto, { checkoutSessionId: "s", status });
      expect((await validate(dto)).length).toBeGreaterThan(0);
    }
    const ok = plainToInstance(UpsertCheckoutDraftDto, { checkoutSessionId: "s", status: "DRAFT", source: "LANDING_PAGE" });
    expect(await validate(ok)).toHaveLength(0);
  });
});

describe("lifecycle sweep", () => {
  it("moves inactive drafts to ABANDONED, logs it and e-mails the owner once", async () => {
    const { service, prisma, email } = build();
    prisma.abandonedCheckout.findMany.mockResolvedValue([
      { id: "d1", status: "DRAFT", phone: "98123456", customerName: "A B", items: "[]", totalMillimes: 259000, source: "LANDING_PAGE", adminNotifiedAt: null },
    ]);
    prisma.abandonedCheckout.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValue({ count: 0 });
    process.env.ADMIN_EMAIL = "owner@example.com";
    const res = await service.sweep(new Date());
    expect(res.abandoned).toBe(1);
    expect(prisma.abandonedCheckoutEvent.create).toHaveBeenCalled();
    expect(email.sendEmail).toHaveBeenCalledTimes(1);
    const cutoff = prisma.abandonedCheckout.findMany.mock.calls[0][0].where.lastActivityAt.lt as Date;
    expect(Date.now() - cutoff.getTime()).toBeGreaterThanOrEqual(15 * 60_000 - 1000);
  });

  it("anonymises personal data after the retention period", async () => {
    const { service, prisma } = build();
    prisma.abandonedCheckout.updateMany.mockResolvedValue({ count: 3 });
    const res = await service.sweep(new Date());
    const erase = prisma.abandonedCheckout.updateMany.mock.calls.find((c: any) => c[0].data.anonymizedAt)[0];
    expect(erase.data).toMatchObject({ customerName: null, phone: null, fullAddress: null, contactConsent: false });
    expect(erase.where.status).toEqual({ not: "DRAFT" });
    expect(res.anonymized).toBe(3);
  });
});
