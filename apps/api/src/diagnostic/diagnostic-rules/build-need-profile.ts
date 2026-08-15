import { DiagnosticDomain, NeedProfile, RawAnswers, RoutineComplexity } from "../diagnostic.types";

export const BUDGET_MAX_MILLIMES: Record<string, number | null> = {
  "under-80": 80000,
  "80-150": 150000,
  "150-250": 250000,
  "250-plus": null,
  "no-preference": null,
};

const COMPLEXITY: Record<string, RoutineComplexity> = {
  essentielle: "Essentielle",
  complete: "Complète",
  premium: "Premium",
};

function asStringArray(value: RawAnswers[string]): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value) return [value];
  return [];
}

/**
 * Pure function: raw questionnaire answers → normalized NeedProfile
 * (diagnostic.types.ts). No product/catalogue access here — this only
 * shapes what the user said. Photo observations (Phase 2) are merged in
 * afterwards by recommendation.service, source-tagged separately.
 */
export function buildNeedProfile(domain: DiagnosticDomain, answers: RawAnswers): NeedProfile {
  const sources: NeedProfile["sources"] = {};
  const needs: string[] = [];

  if (domain === "SKIN") {
    needs.push("nettoyage"); // base need, always present in a skin routine
    const concerns = asStringArray(answers.concerns);
    for (const c of concerns) needs.push(c);
    sources.needs = "questionnaire";

    const spfAnswer = typeof answers.spf === "string" ? answers.spf : null;
    if (spfAnswer && spfAnswer !== "oui") needs.push("solaire");
  } else {
    needs.push("shampooing"); // base need, always present in a hair routine
    const hairConcerns = asStringArray(answers.hairConcerns);
    for (const c of hairConcerns) needs.push(c);
    sources.needs = "questionnaire";
  }

  const sensitivityAnswer = typeof answers.sensitivity === "string" ? answers.sensitivity : "parfois";
  const sensitivity: NeedProfile["sensitivity"] =
    sensitivityAnswer === "souvent" ? "high" : sensitivityAnswer === "rarement" ? "low" : "medium";

  const tierAnswer = typeof answers.routineComplexity === "string" ? answers.routineComplexity : "essentielle";
  const routineComplexity = COMPLEXITY[tierAnswer] ?? "Essentielle";

  const budgetAnswer = typeof answers.budget === "string" ? answers.budget : "no-preference";
  const budgetMaxMillimes = budgetAnswer in BUDGET_MAX_MILLIMES ? BUDGET_MAX_MILLIMES[budgetAnswer] : null;

  const spf = typeof answers.spf === "string" ? answers.spf : null;

  return {
    domain,
    skinType: typeof answers.skinType === "string" ? answers.skinType : undefined,
    hairType: typeof answers.hairType === "string" ? answers.hairType : undefined,
    scalpTendency: typeof answers.scalpTendency === "string" ? answers.scalpTendency : undefined,
    washFrequency: typeof answers.washFrequency === "string" ? answers.washFrequency : undefined,
    needs: [...new Set(needs)],
    sensitivity,
    routineComplexity,
    budgetMaxMillimes,
    brandPreferenceSlugs: asStringArray(answers.brandPreference).filter((b) => b !== "no-preference"),
    spfDaily: spf === "oui" ? true : spf === "non" ? false : spf === "parfois" ? false : null,
    pregnancyOrBreastfeeding: answers.pregnancy === "oui" || answers.pregnancy === true,
    currentRoutine: asStringArray(answers.currentRoutine),
    sources,
  };
}
