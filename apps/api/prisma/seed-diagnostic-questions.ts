/**
 * Standalone, additive-only seed for DiagnosticQuestion/DiagnosticOption.
 * Deliberately NOT part of `prisma db seed` (prisma/seed.ts) — that script
 * wipes orders/inventory/suppliers to reset the dev mock dataset, which
 * would be destructive against this DB's real ~9,700 imported products and
 * any real orders. Run directly instead:
 *   npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed-diagnostic-questions.ts
 * Idempotent (upsert on the @@unique([domain, key]) / @@unique([questionId, value]) keys) — safe to re-run.
 *
 * "brandPreference" questions are seeded with zero options on purpose — the
 * storefront populates that step from the real, live `/catalogue/brands`
 * endpoint instead of a snapshot stored here (brands change over time; this
 * avoids ever showing a stale/hardcoded brand list).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedOption = { value: string; label: string };
type SeedQuestion = {
  domain: "SKIN" | "HAIR";
  key: string;
  label: string;
  type: "single" | "multi";
  required: boolean;
  position: number;
  options: SeedOption[];
};

const ROUTINE_COMPLEXITY_OPTIONS: SeedOption[] = [
  { value: "essentielle", label: "Essentielle — 2 à 3 produits" },
  { value: "complete", label: "Complète — routine équilibrée matin + soir" },
  { value: "premium", label: "Premium — routine plus complète avec soins ciblés" },
];

const BUDGET_OPTIONS: SeedOption[] = [
  { value: "under-80", label: "Moins de 80 DT" },
  { value: "80-150", label: "80–150 DT" },
  { value: "150-250", label: "150–250 DT" },
  { value: "250-plus", label: "250 DT et plus" },
  { value: "no-preference", label: "Pas de préférence" },
];

const QUESTIONS: SeedQuestion[] = [
  // ── SKIN ──────────────────────────────────────────────────────────
  {
    domain: "SKIN", key: "skinType", type: "single", required: true, position: 1,
    label: "Comment votre peau se comporte-t-elle généralement ?",
    options: [
      { value: "tres-seche", label: "Très sèche / tiraillements" },
      { value: "seche", label: "Sèche" },
      { value: "normale", label: "Normale" },
      { value: "mixte", label: "Mixte" },
      { value: "grasse", label: "Grasse" },
      { value: "je-ne-sais-pas", label: "Je ne sais pas" },
    ],
  },
  {
    domain: "SKIN", key: "sensitivity", type: "single", required: true, position: 2,
    label: "Votre peau réagit-elle facilement ?",
    options: [
      { value: "rarement", label: "Rarement" },
      { value: "parfois", label: "Parfois" },
      { value: "souvent", label: "Souvent" },
    ],
  },
  {
    domain: "SKIN", key: "concerns", type: "multi", required: true, position: 3,
    label: "Quels sont vos besoins prioritaires ?",
    options: [
      { value: "hydratation", label: "Hydratation" },
      { value: "imperfections", label: "Brillance / imperfections" },
      { value: "points-noirs", label: "Points noirs" },
      { value: "rougeurs", label: "Rougeurs" },
      { value: "teint-terne", label: "Teint terne" },
      { value: "taches", label: "Taches / irrégularités du teint" },
      { value: "age", label: "Premiers signes de l'âge" },
      { value: "texture", label: "Texture irrégulière" },
      { value: "cernes", label: "Cernes / contour des yeux" },
    ],
  },
  {
    domain: "SKIN", key: "currentRoutine", type: "multi", required: false, position: 4,
    label: "Quels produits utilisez-vous actuellement ?",
    options: [
      { value: "nettoyant", label: "Nettoyant" },
      { value: "serum", label: "Sérum" },
      { value: "hydratant", label: "Hydratant" },
      { value: "contour-yeux", label: "Contour des yeux" },
      { value: "solaire", label: "Protection solaire" },
      { value: "exfoliant", label: "Exfoliant" },
      { value: "masque", label: "Masque" },
      { value: "aucun", label: "Aucun / je débute" },
    ],
  },
  {
    domain: "SKIN", key: "routineComplexity", type: "single", required: true, position: 5,
    label: "Quel type de routine recherchez-vous ?",
    options: ROUTINE_COMPLEXITY_OPTIONS,
  },
  {
    domain: "SKIN", key: "budget", type: "single", required: true, position: 6,
    label: "Quel budget souhaitez-vous consacrer à votre routine ?",
    options: BUDGET_OPTIONS,
  },
  {
    domain: "SKIN", key: "brandPreference", type: "multi", required: false, position: 7,
    label: "Avez-vous des marques préférées ?",
    options: [],
  },
  {
    domain: "SKIN", key: "spf", type: "single", required: true, position: 8,
    label: "Utilisez-vous une protection solaire quotidiennement ?",
    options: [
      { value: "oui", label: "Oui" },
      { value: "parfois", label: "Parfois" },
      { value: "non", label: "Non" },
    ],
  },
  {
    domain: "SKIN", key: "ageRange", type: "single", required: false, position: 9,
    label: "Quelle est votre tranche d'âge ?",
    options: [
      { value: "under-18", label: "Moins de 18 ans" },
      { value: "18-24", label: "18–24 ans" },
      { value: "25-34", label: "25–34 ans" },
      { value: "35-44", label: "35–44 ans" },
      { value: "45-54", label: "45–54 ans" },
      { value: "55-plus", label: "55 ans et plus" },
      { value: "prefer-not-to-say", label: "Je préfère ne pas répondre" },
    ],
  },
  {
    domain: "SKIN", key: "pregnancy", type: "single", required: false, position: 10,
    label: "Êtes-vous enceinte ou allaitante ?",
    options: [
      { value: "oui", label: "Oui" },
      { value: "non", label: "Non" },
      { value: "prefer-not-to-say", label: "Je préfère ne pas répondre" },
    ],
  },

  // ── HAIR ──────────────────────────────────────────────────────────
  {
    domain: "HAIR", key: "hairType", type: "single", required: true, position: 1,
    label: "Comment décririez-vous vos cheveux ?",
    options: [
      { value: "normaux", label: "Normaux" },
      { value: "secs", label: "Secs" },
      { value: "gras", label: "Gras" },
      { value: "mixtes", label: "Mixtes — racines grasses, pointes sèches" },
      { value: "je-ne-sais-pas", label: "Je ne sais pas" },
    ],
  },
  {
    domain: "HAIR", key: "scalpTendency", type: "single", required: true, position: 2,
    label: "Comment se comporte votre cuir chevelu ?",
    options: [
      { value: "normal", label: "Normal" },
      { value: "gras", label: "Gras" },
      { value: "sec", label: "Sec" },
      { value: "sensible", label: "Sensible" },
    ],
  },
  {
    domain: "HAIR", key: "washFrequency", type: "single", required: false, position: 3,
    label: "À quelle fréquence lavez-vous vos cheveux ?",
    options: [
      { value: "quotidien", label: "Tous les jours" },
      { value: "tous-les-2-jours", label: "Tous les 2 jours" },
      { value: "2-fois-semaine", label: "2 fois par semaine" },
      { value: "1-fois-semaine", label: "1 fois par semaine" },
      { value: "moins-souvent", label: "Moins souvent" },
    ],
  },
  {
    domain: "HAIR", key: "hairConcerns", type: "multi", required: true, position: 4,
    label: "Quels sont vos besoins prioritaires ?",
    options: [
      { value: "secheresse", label: "Sécheresse" },
      { value: "chute", label: "Chute de cheveux" },
      { value: "pellicules", label: "Pellicules visibles" },
      { value: "frisottis", label: "Frisottis" },
      { value: "brillance", label: "Manque de brillance" },
      { value: "volume", label: "Manque de volume" },
    ],
  },
  {
    domain: "HAIR", key: "routineComplexity", type: "single", required: true, position: 5,
    label: "Quel type de routine recherchez-vous ?",
    options: ROUTINE_COMPLEXITY_OPTIONS,
  },
  {
    domain: "HAIR", key: "budget", type: "single", required: true, position: 6,
    label: "Quel budget souhaitez-vous consacrer à votre routine ?",
    options: BUDGET_OPTIONS,
  },
  {
    domain: "HAIR", key: "brandPreference", type: "multi", required: false, position: 7,
    label: "Avez-vous des marques préférées ?",
    options: [],
  },
];

async function main() {
  for (const q of QUESTIONS) {
    const question = await prisma.diagnosticQuestion.upsert({
      where: { domain_key: { domain: q.domain, key: q.key } },
      update: { label: q.label, type: q.type, required: q.required, position: q.position, active: true },
      create: {
        domain: q.domain,
        key: q.key,
        label: q.label,
        type: q.type,
        required: q.required,
        position: q.position,
        active: true,
      },
    });

    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      await prisma.diagnosticOption.upsert({
        where: { questionId_value: { questionId: question.id, value: opt.value } },
        update: { label: opt.label, position: i, active: true },
        create: { questionId: question.id, value: opt.value, label: opt.label, position: i, active: true },
      });
    }
  }

  const skinCount = await prisma.diagnosticQuestion.count({ where: { domain: "SKIN" } });
  const hairCount = await prisma.diagnosticQuestion.count({ where: { domain: "HAIR" } });
  console.log(`Diagnostic questions seeded: SKIN=${skinCount}, HAIR=${hairCount}`);
}

main()
  .catch((e) => {
    console.error("Diagnostic question seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
