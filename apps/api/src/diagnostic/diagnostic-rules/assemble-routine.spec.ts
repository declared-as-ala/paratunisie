import { assembleRoutine } from "./assemble-routine";
import { ProductFact } from "../ai/diagnostic-recommendation.provider";

function fact(id: string, overrides: Partial<ProductFact> = {}): ProductFact {
  return {
    id,
    slug: `slug-${id}`,
    name: `Product ${id}`,
    brand: "Brand",
    category: "Visage",
    priceMillimes: 10000,
    sizeLabel: "50 ml",
    image: "/assets/product-tube.webp",
    stock: 5,
    description: "",
    benefit: "",
    ...overrides,
  };
}

describe("assembleRoutine", () => {
  const candidates = [fact("real-1"), fact("real-2"), fact("real-3")];

  it("drops any pick whose productId is not in the real candidate set (defense-in-depth)", () => {
    const { am, pm } = assembleRoutine(
      [{ productId: "invented-id", routineRole: "Hydrater", slot: "AM", reason: "x" }],
      candidates,
      6,
    );
    expect(am).toHaveLength(0);
    expect(pm).toHaveLength(0);
  });

  it("builds every field from the real candidate, not the pick", () => {
    const { am } = assembleRoutine(
      [{ productId: "real-1", routineRole: "Nettoyer", slot: "AM", reason: "Adapté à votre besoin" }],
      candidates,
      6,
    );
    expect(am[0]).toMatchObject({
      productId: "real-1",
      slug: "slug-real-1",
      name: "Product real-1",
      brandName: "Brand",
      priceMillimes: 10000,
      role: "Nettoyer",
      reason: "Adapté à votre besoin",
    });
  });

  it("caps total items to the tier cap", () => {
    const picks = candidates.map((c, i) => ({
      productId: c.id,
      routineRole: "Cibler",
      slot: (i % 2 === 0 ? "AM" : "PM") as "AM" | "PM",
      reason: "x",
    }));
    const { am, pm } = assembleRoutine(picks, candidates, 2);
    expect(am.length + pm.length).toBe(2);
  });

  it("allows the same product in both AM and PM (e.g. a cleanser used twice daily)", () => {
    const { am, pm } = assembleRoutine(
      [
        { productId: "real-1", routineRole: "Nettoyer", slot: "AM", reason: "x" },
        { productId: "real-1", routineRole: "Nettoyer", slot: "PM", reason: "x" },
      ],
      candidates,
      6,
    );
    expect(am).toHaveLength(1);
    expect(pm).toHaveLength(1);
  });

  it("dedupes an exact repeated (productId, slot) pick", () => {
    const { am, pm } = assembleRoutine(
      [
        { productId: "real-1", routineRole: "Nettoyer", slot: "AM", reason: "x" },
        { productId: "real-1", routineRole: "Nettoyer", slot: "AM", reason: "x (duplicate)" },
      ],
      candidates,
      6,
    );
    expect(am.length + pm.length).toBe(1);
  });
});
