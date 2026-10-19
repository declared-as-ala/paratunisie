import { HomepageService } from "./homepage.service";

function build(row: any, product: any) {
  const prisma = {
    homepageConfig: { findUnique: jest.fn().mockResolvedValue(row) },
    product: { findFirst: jest.fn().mockResolvedValue(product) },
  } as any;
  return { service: new HomepageService(prisma), prisma };
}

const PRODUCT = {
  id: "p1", slug: "anabolic-whey-80-2-25kg-proactive", name: "Anabolic Whey 80", benefit: "Récupération", image: "/uploads/x.webp", imageAlt: null,
  brand: { name: "ProActive", slug: "proactive" }, category: { name: "Whey", slug: "whey-proteine" }, images: [],
  variants: [{ label: "2.25kg", priceMillimes: 259000, stock: 20 }],
};

describe("HomepageService.getFeaturedProduct", () => {
  it("defaults to the Anabolic Whey 80 campaign when nothing is configured, with live price and stock", async () => {
    const { service, prisma } = build(null, PRODUCT);
    const res = await service.getFeaturedProduct();
    expect(prisma.product.findFirst.mock.calls[0][0].where).toEqual({ slug: "anabolic-whey-80-2-25kg-proactive", publishState: "PUBLISHED" });
    expect(res?.product.priceMillimes).toBe(259000);
    expect(res?.product.stock).toBe(20);
    expect(res?.product.inStock).toBe(true);
  });

  it("never exposes a price or stock coming from the configuration", async () => {
    const { service } = build({ enabled: true, title: null, description: null, settings: JSON.stringify({ productSlug: "x", priceMillimes: 1, stock: 999 }) }, PRODUCT);
    const res = await service.getFeaturedProduct();
    expect(res?.product.priceMillimes).toBe(259000);
    expect(res?.product.stock).toBe(20);
  });

  it("returns null when disabled, unpublished, or outside its schedule", async () => {
    expect(await build({ enabled: false, settings: "{}" }, PRODUCT).service.getFeaturedProduct()).toBeNull();
    expect(await build(null, null).service.getFeaturedProduct()).toBeNull();
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(await build({ enabled: true, settings: JSON.stringify({ productSlug: "x", startsAt: future }) }, PRODUCT).service.getFeaturedProduct()).toBeNull();
    expect(await build({ enabled: true, settings: JSON.stringify({ productSlug: "x", endsAt: past }) }, PRODUCT).service.getFeaturedProduct()).toBeNull();
  });

  it("reports out-of-stock honestly", async () => {
    const { service } = build(null, { ...PRODUCT, variants: [{ label: "2.25kg", priceMillimes: 259000, stock: 0 }] });
    const res = await service.getFeaturedProduct();
    expect(res?.product.inStock).toBe(false);
    expect(res?.product.stock).toBe(0);
  });

  it("keeps copy/CTA from config and caps bullets at 4", async () => {
    const { service } = build({ enabled: true, title: "Whey 80", description: "Desc", settings: JSON.stringify({ productSlug: "x", bullets: ["a", "b", "c", "d", "e"], secondaryCtaLabel: "Voir", secondaryCtaUrl: "/whey-proteine" }) }, PRODUCT);
    const res = await service.getFeaturedProduct();
    expect(res?.config.headline).toBe("Whey 80");
    expect(res?.config.bullets).toHaveLength(4);
    expect(res?.config.secondaryCtaUrl).toBe("/whey-proteine");
  });
});
