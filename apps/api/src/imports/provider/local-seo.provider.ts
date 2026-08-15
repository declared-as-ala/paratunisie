import { Injectable } from "@nestjs/common";
import { GeneratedSeoResult, SeoFactsInput } from "./seo-provider.interface";

@Injectable()
export class LocalSeoProvider {
  readonly code = "local";
  readonly name = "Local Deterministic SEO Engine";

  slugify(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  normalizeTitle(name: string, brand?: string): string {
    let clean = name.trim();

    // 1. Remove duplicate brand prefix if already present at start of title
    if (brand && brand.trim()) {
      const b = brand.trim();
      const regex = new RegExp(`^${b}\\s+`, "i");
      clean = clean.replace(regex, "");
    }

    // 2. Fix repeated duplicate words (accent & unicode safe, e.g. "Soin soin", "crème crème")
    clean = clean.replace(/(\b[\p{L}0-9]+\b)(\s+\1)+/gui, "$1");

    // 3. Fix volume formatting (e.g. "40ml" -> "40 ml", "50g" -> "50 g")
    clean = clean.replace(/(\d+)\s*(ml|g|cl|l|kg)\b/gi, "$1 $2");

    // 4. Clean extra spaces & punctuation
    clean = clean.replace(/\s+/g, " ").trim();

    // 5. Build canonical Title without repeating brand if brand (slugified) is already in title
    if (brand && brand.trim()) {
      const brandSlug = this.slugify(brand);
      const titleSlug = this.slugify(clean);
      if (!titleSlug.includes(brandSlug)) {
        return `${brand.trim()} ${clean}`;
      }
    }
    return clean;
  }

  sanitizeUnsupportedClaims(text: string): string {
    if (!text) return "";
    return text
      // Remove unsupported overpromising medical/clinical claims completely
      .replace(/\b(?:guérit|guerrit)\b/gi, "apaise")
      .replace(/garanti\s*(?:à\s*)?100%/gi, "")
      .replace(/sans\s+danger\s+pour\s+(?:femme\s+enceinte|grossesse)/gi, "")
      .replace(/cliniquement\s+prouv[eé](?:e|s)?/gi, "")
      .replace(/recommand[eé]\s+par\s+les\s+dermatologues/gi, "")
      .replace(/100%\s+efficace/gi, "")
      .replace(/formul[eé]\s+sous\s+contr[oô]le\s+dermatologique/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  generate(facts: SeoFactsInput, promptVersion = "v1"): GeneratedSeoResult {
    const startTime = Date.now();
    const rawBrand = facts.brand?.trim() || "";
    const rawCategory = facts.category?.trim() || "Soin";

    // 1. Normalized Product Title & Slug
    const normalizedTitle = this.normalizeTitle(facts.name, rawBrand);
    const slug = this.slugify(normalizedTitle);

    // 2. Meta Title (target 45-60 chars)
    let metaTitle = `${normalizedTitle} | ParaTunisie`;
    if (metaTitle.length > 60) {
      metaTitle = `${normalizedTitle.substring(0, 45)}... | ParaTunisie`;
    }

    // 3. Meta Description (target 140-160 chars) — ZERO COMPETITOR PRICE LEAK!
    let priceSnippet = "";
    if (facts.sellingPriceMillimes && facts.sellingPriceMillimes > 0) {
      priceSnippet = ` au prix de ${(facts.sellingPriceMillimes / 1000).toFixed(3)} DT`;
    }

    const hashVal = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const metaDescTemplates = [
      `Achetez ${normalizedTitle} en Tunisie.${priceSnippet} Profitez de la livraison rapide à domicile avec ParaTunisie, votre parapharmacie en ligne.`,
      `Soin ${rawCategory.toLowerCase()} ${normalizedTitle}.${priceSnippet} Commandez en ligne sur ParaTunisie avec paiement à la livraison partout en Tunisie.`,
      `${normalizedTitle}${priceSnippet} : retrouvez les caractéristiques et conseils d'utilisation sur ParaTunisie.tn, votre référence parapharmacie en Tunisie.`,
    ];
    let metaDescription = metaDescTemplates[hashVal % metaDescTemplates.length];
    metaDescription = this.sanitizeUnsupportedClaims(metaDescription).substring(0, 160);

    // 4. Verified Benefits (NO fake generic filler!)
    const verifiedBenefits: string[] = [];
    if (facts.verifiedBenefits && facts.verifiedBenefits.length > 0) {
      facts.verifiedBenefits.forEach((b) => {
        const cleaned = this.sanitizeUnsupportedClaims(b);
        if (cleaned) verifiedBenefits.push(cleaned);
      });
    }
    if (verifiedBenefits.length === 0) {
      verifiedBenefits.push(`Soin adapté pour la catégorie ${rawCategory.toLowerCase()}`);
      if (facts.volumeSize) verifiedBenefits.push(`Format pratique de ${facts.volumeSize}`);
    }

    // 5. Usage
    const usage = facts.usage ? this.sanitizeUnsupportedClaims(facts.usage) : undefined;

    // 6. Long Structured Description (Factual Grounding Only)
    const sections: string[] = [
      `### Présentation`,
      `Le produit **${normalizedTitle}** appartient à la catégorie **${rawCategory}**.${
        rawBrand ? ` Il est proposé par la marque **${rawBrand}**.` : ""
      }`,
    ];

    if (verifiedBenefits.length > 0) {
      sections.push(`\n### Caractéristiques principales`);
      verifiedBenefits.forEach((b) => sections.push(`- ${b}`));
    }

    if (usage) {
      sections.push(`\n### Conseils d'utilisation\n${usage}`);
    }

    if (facts.ingredients) {
      const cleanIngr = this.sanitizeUnsupportedClaims(facts.ingredients);
      if (cleanIngr) {
        sections.push(`\n### Composition & Ingrédients\n${cleanIngr}`);
      }
    }

    sections.push(
      `\n### Détails de livraison`,
      `Livraison disponible sur toute la Tunisie avec paiement à la livraison.`
    );

    const longDescription = sections.join("\n\n");

    // 7. Factual FAQ (ONLY if real verified answers exist!)
    const faq: { question: string; answer: string }[] = [];
    if (usage) {
      faq.push({
        question: `Comment utiliser ${normalizedTitle} ?`,
        answer: usage,
      });
    }
    if (facts.sellingPriceMillimes) {
      faq.push({
        question: `Quel est le prix de ${normalizedTitle} sur ParaTunisie ?`,
        answer: `Le prix de ${normalizedTitle} est de ${(facts.sellingPriceMillimes / 1000).toFixed(3)} DT sur ParaTunisie.`,
      });
    }
    if (facts.volumeSize) {
      faq.push({
        question: `Quelle est la contenance de ${normalizedTitle} ?`,
        answer: `Le produit est disponible au format ${facts.volumeSize}.`,
      });
    }
    faq.push({
      question: `Comment se passe la livraison en Tunisie ?`,
      answer: `ParaTunisie assure la livraison à domicile avec paiement à la livraison sur toute la Tunisie.`,
    });

    // 8. Tunisian Keywords
    const keywords: string[] = [
      `${this.slugify(normalizedTitle)} tunisie`,
      `${rawCategory.toLowerCase()} tunisie`,
      `parapharmacie tunisie ${this.slugify(rawBrand || "care")}`,
    ];
    if (rawBrand) keywords.unshift(`${rawBrand.toLowerCase()} tunisie`);

    // 9. Realistic Quality Score (0 - 100)
    let seoScore = 30; // Base score
    if (normalizedTitle.length >= 10 && !normalizedTitle.match(/(\b[\p{L}0-9]+\b)(\s+\1)+/gui)) seoScore += 15;
    if (metaTitle.length >= 35 && metaTitle.length <= 65) seoScore += 15;
    if (metaDescription.length >= 110 && metaDescription.length <= 165) seoScore += 15;
    if (usage) seoScore += 10;
    if (facts.ingredients) seoScore += 10;
    if (verifiedBenefits.length >= 2) seoScore += 5;

    const durationMs = Date.now() - startTime;

    return {
      normalizedTitle,
      slug,
      metaTitle,
      metaDescription,
      shortDescription: `Soin ${rawCategory.toLowerCase()} ${normalizedTitle}. Disponible sur ParaTunisie.`,
      longDescription,
      benefits: verifiedBenefits,
      usage,
      faq,
      keywords,
      imageAlt: `${normalizedTitle} - ${rawCategory} ParaTunisie`,
      seoScore,
      durationMs,
      provider: "local",
      model: "local-engine-v1",
      promptVersion,
    };
  }
}
