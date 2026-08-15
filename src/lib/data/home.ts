export const homeConcerns = [
  { label: "Imperfections", href: "/besoins/acne-imperfections", tone: "blush", image: "/assets/concerns/concern-imperfections.webp" },
  { label: "Taches & éclat", href: "/besoins/taches-eclat", tone: "nude", image: "/assets/concerns/concern-taches-eclat.webp" },
  { label: "Peau sensible", href: "/besoins/peau-sensible", tone: "ivory", image: "/assets/concerns/concern-peau-sensible.webp" },
  { label: "Peau sèche", href: "/besoins/peau-seche", tone: "rose", image: "/assets/concerns/concern-peau-seche.webp" },
  { label: "Premiers signes de l'âge", href: "/besoins/premiers-signes-age", tone: "nude", image: "/assets/concerns/concern-premiers-signes-age.webp" },
  { label: "Chute de cheveux", href: "/besoins/chute-cheveux", tone: "ivory", image: "/assets/concerns/concern-chute-cheveux.webp" },
  { label: "Protection solaire", href: "/besoins/protection-solaire", tone: "blush", image: "/assets/concerns/concern-protection-solaire.webp" },
  { label: "Bébé & maman", href: "/besoins/bebe", tone: "rose", image: "/assets/concerns/concern-bebe.webp" },
] as const;

export const bestSellers = [
  { brand: "La Roche-Posay", name: "Anthelios Fluide Invisible SPF50+", price: "58,900 DT", href: "/produits/anthelios-fluide-invisible" },
  { brand: "CeraVe", name: "Crème Hydratante Visage", price: "42,500 DT", href: "/produits/creme-hydratante-visage" },
  { brand: "Bioderma", name: "Sensibio H2O", price: "36,900 DT", href: "/produits/sensibio-h2o" },
  { brand: "Vichy", name: "Liftactiv Sérum Vitamine C", price: "91,000 DT", href: "/produits/liftactiv-vitamine-c" },
] as const;

export const homeBrands = [
  "La Roche-Posay",
  "Bioderma",
  "Avène",
  "CeraVe",
  "Vichy",
  "Nuxe",
] as const;

export const adviceArticles = [
  { category: "Guide peau", title: "Construire une routine simple pour peau sensible", href: "/conseils/routine-peau-sensible" },
  { category: "Solaire", title: "Choisir son écran solaire selon sa peau", href: "/conseils/choisir-ecran-solaire" },
  { category: "Ingrédients", title: "Vitamine C : quand et comment l'utiliser", href: "/conseils/vitamine-c" },
] as const;
