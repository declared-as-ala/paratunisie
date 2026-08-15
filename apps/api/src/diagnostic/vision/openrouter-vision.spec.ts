import { validateVisionOutput } from "./openrouter-vision.provider";

describe("validateVisionOutput", () => {
  it("sanitizes unknown observation/confidence values instead of throwing", () => {
    const result = validateVisionOutput({
      cosmeticObservations: { shine: "bogus", visibleDryness: "high" },
      confidence: { shine: "bogus" },
      redFlag: false,
    });

    expect(result.cosmeticObservations.shine).toBe("unknown");
    expect(result.cosmeticObservations.visibleDryness).toBe("high");
    expect(result.confidence.shine).toBe("medium");
  });

  it("redacts forbidden medical terms from redFlagReason", () => {
    const result = validateVisionOutput({
      cosmeticObservations: {},
      confidence: {},
      redFlag: true,
      redFlagReason: "Signes évoquant une dermatite sévère",
    });

    expect(result.redFlagReason).not.toMatch(/dermatite/i);
    expect(result.redFlagReason).toContain("condition cutanée particulière");
  });

  it("clears redFlagReason when redFlag is false", () => {
    const result = validateVisionOutput({
      cosmeticObservations: {},
      confidence: {},
      redFlag: false,
      redFlagReason: "some reason",
    });

    expect(result.redFlagReason).toBeNull();
  });

  it("throws on a non-object payload", () => {
    expect(() => validateVisionOutput(null)).toThrow();
  });
});
