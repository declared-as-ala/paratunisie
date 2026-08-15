/**
 * Site information architecture — real category/concern/brand taxonomy from
 * REQUIREMENTS.md, not commerce data. PLP/brand/concern pages ship in
 * Sprint 3/7 (SPRINTS.md); URLs below already match the locked structure in
 * SEO.md so nothing needs relinking once those pages exist.
 */

export type NavCategory = {
  label: string;
  href: string;
  description: string;
  featured?: { label: string; href: string }[];
};

export const primaryCategories: NavCategory[] = [
  {
    label: "Visage",
    href: "/visage",
    description: "Nettoyants, sérums, crèmes et soins ciblés.",
    featured: [
      { label: "Anti-imperfections", href: "/besoins/acne-imperfections" },
      { label: "Taches & éclat", href: "/besoins/taches-eclat" },
      { label: "Premiers signes de l'âge", href: "/besoins/premiers-signes-age" },
    ],
  },
  {
    label: "Corps",
    href: "/corps",
    description: "Hydratation, fermeté et soins quotidiens du corps.",
  },
  {
    label: "Cheveux",
    href: "/cheveux",
    description: "Shampoings, soins et traitements ciblés.",
    featured: [{ label: "Chute de cheveux", href: "/besoins/chute-cheveux" }],
  },
  {
    label: "Solaire",
    href: "/solaire",
    description: "Protection visage et corps, toutes peaux.",
    featured: [{ label: "Protection solaire", href: "/besoins/protection-solaire" }],
  },
  {
    label: "Bébé & Maman",
    href: "/bebe-maman",
    description: "Soins doux pour bébé et pendant la grossesse.",
  },
  {
    label: "Hygiène",
    href: "/hygiene",
    description: "Essentiels d'hygiène quotidienne.",
  },
  {
    label: "Compléments",
    href: "/complements",
    description: "Compléments alimentaires et bien-être.",
  },
  {
    label: "Homme",
    href: "/homme",
    description: "Rasage, soin visage et corps au masculin.",
  },
];

export const concerns: { label: string; href: string }[] = [
  { label: "Acné & imperfections", href: "/besoins/acne-imperfections" },
  { label: "Taches & éclat", href: "/besoins/taches-eclat" },
  { label: "Peau sèche", href: "/besoins/peau-seche" },
  { label: "Peau sensible", href: "/besoins/peau-sensible" },
  { label: "Premiers signes de l'âge", href: "/besoins/premiers-signes-age" },
  { label: "Chute de cheveux", href: "/besoins/chute-cheveux" },
  { label: "Protection solaire", href: "/besoins/protection-solaire" },
  { label: "Bébé", href: "/besoins/bebe" },
];

export const featuredBrands: { label: string; href: string }[] = [
  { label: "La Roche-Posay", href: "/marques/la-roche-posay" },
  { label: "Bioderma", href: "/marques/bioderma" },
  { label: "Avène", href: "/marques/avene" },
  { label: "CeraVe", href: "/marques/cerave" },
  { label: "Vichy", href: "/marques/vichy" },
  { label: "Nuxe", href: "/marques/nuxe" },
];

export const secondaryNav: { label: string; href: string }[] = [
  { label: "Marques", href: "/marques" },
  { label: "Conseils", href: "/conseils" },
];

export const popularSearches: string[] = [
  "Écran solaire peau grasse",
  "Anti-chute",
  "CeraVe",
  "Vitamine C",
  "Peau sensible",
];
