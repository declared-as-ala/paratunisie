import { ProductFact } from "../ai/diagnostic-recommendation.provider";

/**
 * In-code safety-net ranking — used ONLY when the AI provider is disabled
 * or a request fails (diagnostic spec §17: never invent a routine, and
 * never block the user just because the AI call failed). This is plain
 * code, not an admin-editable database table — there is no manual
 * mapping UI backing it, per the user's explicit "AI-driven, not
 * admin-mapped" requirement. It only ever ranks the same real candidate
 * set the AI would have seen.
 */
const NEED_KEYWORDS: Record<string, string[]> = {
  nettoyage: ["nettoyant", "nettoyage", "demaquillant", "gel moussant", "lotion nettoyante"],
  hydratation: ["hydrat", "creme"],
  imperfections: ["imperfection", "acne", "grasse", "mixte", "purifi"],
  "points-noirs": ["imperfection", "acne", "purifi", "pore"],
  rougeurs: ["sensible", "rougeur", "apais"],
  sensibilite: ["sensible", "apais"],
  "teint-terne": ["eclat", "bonne mine", "teint"],
  taches: ["tache", "depigment", "pigment", "eclaircissant"],
  age: ["anti-age", "ride", "fermete"],
  rides: ["anti-age", "ride", "fermete"],
  texture: ["masque", "gommage", "exfoli"],
  cernes: ["cerne", "contour des yeux", "yeux"],
  solaire: ["solaire", "spf", "ecran"],
  shampooing: ["shampoo", "shampooing"],
  "apres-shampooing": ["apres-shampooing", "apres shampooing"],
  masque: ["masque"],
  secheresse: ["sec", "hydrat", "nourrissant"],
  chute: ["chute", "anti-chute", "fortifiant"],
  pellicules: ["pellicule", "antipelliculaire"],
  frisottis: ["frise", "boucl", "lissant"],
  brillance: ["huile", "serum", "brillance"],
  volume: ["volume", "volumateur"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Union of the real French keywords behind a set of needs — reused both as the DB retrieval filter and the fallback ranker's vocabulary, so the two never drift apart. */
export function keywordsForNeeds(needs: string[]): string[] {
  return [...new Set(needs.flatMap((need) => NEED_KEYWORDS[need] ?? []))];
}

const ROLE_LABELS_FR: Record<string, string> = {
  nettoyage: "Nettoyer",
  hydratation: "Hydrater",
  imperfections: "Cibler les imperfections",
  "points-noirs": "Cibler les points noirs",
  rougeurs: "Apaiser",
  sensibilite: "Apaiser",
  "teint-terne": "Illuminer le teint",
  taches: "Corriger les taches",
  age: "Soin anti-âge",
  rides: "Soin anti-âge",
  texture: "Exfolier",
  cernes: "Contour des yeux",
  solaire: "Protéger",
  shampooing: "Shampooing",
  "apres-shampooing": "Après-shampooing",
  masque: "Masque",
  secheresse: "Nourrir",
  chute: "Soin anti-chute",
  pellicules: "Soin anti-pelliculaire",
  frisottis: "Discipliner",
  brillance: "Sérum brillance",
  volume: "Volumateur",
};

export function roleLabelForNeed(need: string): string {
  return ROLE_LABELS_FR[need] ?? need;
}

/**
 * Reverse of roleLabelForNeed — used by "Voir une alternative", which only
 * has the French role label the AI/fallback returned (not the internal
 * need key). Falls back to the role text itself as a single keyword so an
 * AI-invented role label (not in ROLE_LABELS_FR) still narrows the search
 * instead of silently matching nothing.
 */
export function keywordsForRole(role: string): string[] {
  const normalizedRole = normalize(role);
  const need = Object.entries(ROLE_LABELS_FR).find(([, label]) => normalize(label) === normalizedRole)?.[0];
  if (need && NEED_KEYWORDS[need]) return NEED_KEYWORDS[need];
  return [role.toLowerCase().replace(/-/g, " ")];
}

/**
 * name/category matches count far more than benefit/description — a hair
 * dye's usage instructions can incidentally mention "shampooing" ("rincer
 * au shampooing après application"), which must not outrank an actual
 * shampoo just because both technically contain the word.
 */
export function scoreKeywords(keywords: string[], candidate: ProductFact): number {
  if (keywords.length === 0) return 0;
  const primaryHaystack = normalize(`${candidate.category} ${candidate.name}`);
  const secondaryHaystack = normalize(`${candidate.benefit} ${candidate.description}`);
  return keywords.reduce((score, kw) => {
    const needle = normalize(kw);
    if (primaryHaystack.includes(needle)) return score + 3;
    if (secondaryHaystack.includes(needle)) return score + 1;
    return score;
  }, 0);
}

export function keywordScore(need: string, candidate: ProductFact): number {
  return scoreKeywords(NEED_KEYWORDS[need] ?? [], candidate);
}

/**
 * Ranks candidates for a given need, highest keyword match first, then
 * in-stock before out-of-stock. Pure — no I/O.
 */
export function rankCandidatesForNeed(need: string, candidates: ProductFact[]): ProductFact[] {
  return rankCandidatesByKeywords(NEED_KEYWORDS[need] ?? [], candidates);
}

export function rankCandidatesByKeywords(keywords: string[], candidates: ProductFact[]): ProductFact[] {
  return candidates
    .map((c) => ({ c, score: scoreKeywords(keywords, c) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : (b.c.stock > 0 ? 1 : 0) - (a.c.stock > 0 ? 1 : 0)))
    .map((entry) => entry.c);
}
