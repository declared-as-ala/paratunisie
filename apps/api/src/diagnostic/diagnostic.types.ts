export type DiagnosticDomain = "SKIN" | "HAIR";
export type RoutineComplexity = "Essentielle" | "Complète" | "Premium";
export type Slot = "AM" | "PM" | "BOTH";

export type RawAnswers = Record<string, string | string[] | number | boolean | undefined>;

/**
 * Normalized profile the recommendation engine actually operates on
 * (CLAUDE.md §24) — built once by QuestionnaireService from raw answers
 * (and, once Phase 2 ships, merged with photo observations), never
 * re-derived ad hoc downstream.
 */
export type NeedProfile = {
  domain: DiagnosticDomain;
  skinType?: string;
  hairType?: string;
  scalpTendency?: string;
  washFrequency?: string;
  needs: string[]; // internal need keys — see diagnostic-rules/keyword-fallback.ts
  sensitivity: "low" | "medium" | "high";
  routineComplexity: RoutineComplexity;
  budgetMaxMillimes: number | null;
  brandPreferenceSlugs: string[];
  spfDaily: boolean | null;
  pregnancyOrBreastfeeding: boolean;
  currentRoutine: string[];
  photoObservations?: any;
  /** Which signal produced which part of the profile — questionnaire vs photo (CLAUDE.md §23). */
  sources: Record<string, "questionnaire" | "photo">;
};

export type RecommendationCandidate = {
  productId: string;
  name: string;
  slug: string;
  brandName: string;
  categoryName: string;
  priceMillimes: number;
  stock: number;
  score: number;
  matchedNeeds: string[];
};

export type RoutineRoleItem = {
  role: string;
  slot: "AM" | "PM";
  productId: string;
  name: string;
  slug: string;
  brandName: string;
  priceMillimes: number;
  sizeLabel: string;
  image: string;
  inStock: boolean;
  reason: string;
};

export type RoutineResult = {
  domain: DiagnosticDomain;
  tier: RoutineComplexity;
  profile: NeedProfile;
  am: RoutineRoleItem[];
  pm: RoutineRoleItem[];
  unfilledRoles: string[];
  totalMillimes: number;
  itemCount: number;
};

export const TIER_ITEM_CAPS: Record<RoutineComplexity, number> = {
  Essentielle: 3,
  Complète: 6,
  Premium: 8,
};
