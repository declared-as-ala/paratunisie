export interface SeoFactsInput {
  name: string;
  brand?: string;
  category?: string;
  volumeSize?: string;
  ingredients?: string;
  usage?: string;
  verifiedBenefits?: string[];
  sellingPriceMillimes?: number; // ONLY ParaTunisie's selling price (NEVER competitor price!)
  language?: string;
  sourceUrl?: string;
}

export interface GeneratedSeoResult {
  normalizedTitle: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  shortDescription: string;
  longDescription: string;
  benefits: string[];
  usage?: string;
  faq: { question: string; answer: string }[];
  keywords: string[];
  imageAlt: string;
  seoScore: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  durationMs: number;
  provider: "local" | "openai";
  model: string;
  promptVersion: string;
}
