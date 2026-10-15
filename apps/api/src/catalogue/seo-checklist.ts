export type ChecklistType = "product" | "category";
export type PageEvidence = {
  checkedAt: string; http: boolean; indexable: boolean; sitemap: boolean;
  schema: boolean; offer: boolean; breadcrumb: boolean; internalLinks: boolean;
  image: boolean; h1: boolean; metadata: boolean; error?: string;
};
export const plainText = (value: unknown): string => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/[#*_]/g, "").replace(/\s+/g, " ").trim();
export const normalize = (value: unknown) => plainText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function keywords(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(plainText).filter(Boolean);
  try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed.map(plainText).filter(Boolean) : []; } catch { return String(value || "").split(",").map(plainText).filter(Boolean); }
}
export function usefulText(value: unknown, minWords: number): boolean {
  const words = normalize(value).match(/[a-z0-9]+/g) || [];
  if (words.length < minWords) return false;
  const counts = new Map<string, number>();
  for (const word of words) if (word.length > 3) counts.set(word, (counts.get(word) || 0) + 1);
  return new Set(words).size >= Math.min(12, minWords * 0.6) && (words.length < 8 || Math.max(0, ...counts.values()) / words.length < 0.25);
}
export function realImage(value: unknown) { return Boolean(value) && !/product-unavailable|product-tube|placeholder|\/assets\/logo/i.test(String(value)); }
export type ChecklistContext = { uniqueSlug: boolean; uniqueTitle: boolean; uniqueDescription: boolean; productCount: number };
export function calculateChecklist(type: ChecklistType, row: any, context: ChecklistContext, evidence?: PageEvidence) {
  const product = type === "product";
  const title = plainText(row.seoTitle), meta = plainText(row.seoDescription);
  const terms = keywords(row.seoKeywords);
  const url = `https://paratunisie.com/${product ? "produits/" : ""}${row.slug}`;
  const description = product ? row.description : row.seoContent;
  const checks: { id: string; label: string; passed: boolean; points: number; reason: string }[] = [];
  const add = (id: string, label: string, passed: unknown, reason: string) => checks.push({ id, label, passed: Boolean(passed), points: 5, reason: passed ? "Conforme" : reason });
  add("title", "Titre SEO", title.length >= 20 && title.length <= 80 && usefulText(title, 3) && context.uniqueTitle, "Titre distinct et descriptif de 20 à 80 caractères requis.");
  add("meta", "Méta description", meta.length >= 120 && meta.length <= 170 && usefulText(meta, 15), "Description utile de 120 à 170 caractères, sans répétition artificielle.");
  add("h1", "H1 visible", plainText(row.seoH1).length >= 4 && evidence?.h1, "Un H1 descriptif doit être présent dans le HTML publié.");
  add("slug", "Slug unique", /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) && context.uniqueSlug, "Slug lisible, unique, en minuscules et tirets.");
  add("canonical", "Canonical", row.canonicalUrl === url, "La canonical doit désigner cette URL principale.");
  add("description", product ? "Description produit" : "Guide de catégorie", usefulText(description, product ? 60 : 100) && context.uniqueDescription, "Texte utile et distinct : au moins 60 mots pour un produit, 100 pour une catégorie. Vérifier les faits manquants.");
  add("intro", "Introduction", usefulText(row.seoIntro, 12), "Introduction descriptive d’au moins 12 mots.");
  const subject = normalize(`${row.name} ${row.seoH1}`);
  add("primary", "Mot-clé principal", terms[0] && normalize(terms[0]).split(/\W+/).some(w => w.length >= 3 && subject.includes(w) && !["tunisie", "prix", "pour", "les", "des"].includes(w)), "Le mot-clé principal doit correspondre au produit ou à la catégorie.");
  add("secondary", "Mots-clés secondaires", new Set(terms.slice(1).map(normalize)).size >= 2 && terms.every(t => usefulText(t, 1)), "Au moins deux expressions secondaires distinctes et lisibles.");
  const image = product ? row.image || row.images?.[0]?.url : row.ogImage;
  add("image", "Image réelle et ALT", realImage(image) && plainText(row.imageAlt).length >= 5 && (!product || (row.images || []).every((i: any) => plainText(i.alt).length >= 5)) && evidence?.image, "Photo réelle accessible et texte alternatif descriptif requis.");
  add("brand", product ? "Marque confirmée" : "Produits associés", product ? row.brand && !/unknown|non renseigne/i.test(normalize(row.brand.name)) : context.productCount > 0, product ? "Confirmer le fabricant ; ne pas inventer une marque." : "Associer des produits réels, sans duplication.");
  add("category", product ? "Catégorie" : "Hiérarchie", product ? Boolean(row.category?.slug) : row.parentId !== row.id, "Relation de catégorie valide requise.");
  add("og", "Open Graph", usefulText(row.ogTitle, 2) && usefulText(row.ogDescription, 12) && realImage(row.ogImage), "Titre, description et image de partage adaptés à cette page.");
  add("links", "Liens internes visibles", evidence?.internalLinks, "Au moins deux liens contextuels valides dans le contenu, hors navigation générale.");
  add("http", "Page HTTP 200", evidence?.http, "Vérifier la page publique : HTTP 200 sans redirection.");
  add("indexable", "Indexation autorisée", row.indexable !== false && row.followLinks !== false && (product ? row.publishState === "PUBLISHED" : row.status === "ACTIVE" && context.productCount > 0) && evidence?.indexable, "La page doit être publiée, indexable et autorisée par robots.txt.");
  add("sitemap", "Présence dans le sitemap", evidence?.sitemap, "Vérifier la présence de l’URL canonique dans le sitemap public.");
  add("schema", product ? "Product Schema" : "Collection Schema", evidence?.schema, "Balisage JSON-LD valide et cohérent avec la page publiée.");
  add("offer", product ? "Prix et stock réels" : "Liste de produits", evidence?.offer, product ? "Offer : prix TND et disponibilité conformes aux variantes." : "ItemList visible avec de vraies URL de produits.");
  add("breadcrumb", "Fil d’Ariane et métadonnées", evidence?.breadcrumb && evidence?.metadata, "Fil d’Ariane visible, schéma et métadonnées doivent correspondre à la page.");
  const score = checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0);
  return { id: row.id, name: row.name, slug: row.slug, type, score, total: 100, grade: score >= 90 ? "Excellent" : score >= 70 ? "À améliorer" : "Insuffisant", checks, verifiedAt: evidence?.checkedAt || null, verificationError: evidence?.error || null };
}
