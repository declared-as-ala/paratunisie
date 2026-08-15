import { buildNeedProfile } from "./build-need-profile";

describe("buildNeedProfile", () => {
  it("always includes the base skin need and maps concerns/budget/tier", () => {
    const profile = buildNeedProfile("SKIN", {
      skinType: "seche",
      sensitivity: "souvent",
      concerns: ["hydratation", "rougeurs"],
      routineComplexity: "essentielle",
      budget: "under-80",
      spf: "non",
    });

    expect(profile.needs).toEqual(expect.arrayContaining(["nettoyage", "hydratation", "rougeurs", "solaire"]));
    expect(profile.sensitivity).toBe("high");
    expect(profile.routineComplexity).toBe("Essentielle");
    expect(profile.budgetMaxMillimes).toBe(80000);
    expect(profile.spfDaily).toBe(false);
  });

  it("never fabricates a budget cap when the user picked 'no preference'", () => {
    const profile = buildNeedProfile("SKIN", { budget: "no-preference" });
    expect(profile.budgetMaxMillimes).toBeNull();
  });

  it("flags pregnancy only when explicitly answered, never inferred", () => {
    const noAnswer = buildNeedProfile("SKIN", {});
    expect(noAnswer.pregnancyOrBreastfeeding).toBe(false);
    const answered = buildNeedProfile("SKIN", { pregnancy: "oui" });
    expect(answered.pregnancyOrBreastfeeding).toBe(true);
  });

  it("uses the hair base need and hairConcerns for the HAIR domain, not skin concerns", () => {
    const profile = buildNeedProfile("HAIR", { hairConcerns: ["chute", "pellicules"] });
    expect(profile.needs).toEqual(expect.arrayContaining(["shampooing", "chute", "pellicules"]));
    expect(profile.needs).not.toContain("nettoyage");
  });
});
