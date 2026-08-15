import { TunisieParaProvider } from "../provider/tunisiepara.provider";
import { SeoGeneratorService } from "../services/seo-generator.service";
import { LocalSeoProvider } from "../provider/local-seo.provider";
import { OpenAiSeoProvider } from "../provider/openai-seo.provider";

describe("TunisiePara Importer Unit Tests", () => {
  let provider: TunisieParaProvider;
  let seoGenerator: SeoGeneratorService;
  let localSeo: LocalSeoProvider;

  beforeEach(() => {
    provider = new TunisieParaProvider();
    localSeo = new LocalSeoProvider();
    const mockPrisma: any = {
      seoGenerationLog: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };
    seoGenerator = new SeoGeneratorService(mockPrisma, localSeo, new OpenAiSeoProvider());
  });

  it("parses price formatted strings to millimes correctly", () => {
    expect(provider.parsePriceToMillimes("39,900 DT")).toBe(39900);
    expect(provider.parsePriceToMillimes("58.900 TND")).toBe(58900);
    expect(provider.parsePriceToMillimes("18,9 DT")).toBe(18900);
    expect(provider.parsePriceToMillimes(undefined)).toBeUndefined();
  });

  it("slugifies product title into clean French SEO slug", () => {
    const title = "La Roche-Posay Anthelios UVMune 400 SPF50+ 50ml";
    expect(seoGenerator.slugify(title)).toBe("la-roche-posay-anthelios-uvmune-400-spf50-50ml");
  });

  it("generates structured original SEO payload and completeness score", async () => {
    const facts = {
      externalId: "test-123",
      sourceUrl: "https://tunisiepara.com/produit/anthelios-fluide/",
      sourceTitle: "Anthelios Fluide Invisible SPF50+",
      sourceBrand: "La Roche-Posay",
      sourceCategory: "Solaire",
      sourcePriceMillimes: 58900,
      usage: "Appliquer généreusement le matin.",
      ingredients: "Aqua, Alcohol Denat, Diisopropyl Sebacate.",
      mainImage: "https://tunisiepara.com/wp-content/uploads/test.jpg",
    };

    const payload = await seoGenerator.generateProductSeo(facts, { sellingPriceMillimes: 58900 });

    expect(payload.normalizedTitle).toContain("La Roche-Posay Anthelios Fluide Invisible SPF50+");
    expect(payload.metaTitle).toContain("ParaTunisie");
    expect(payload.metaDescription).toContain("58.900 DT");
    expect(payload.longDescription).toContain("Présentation");
    expect(payload.faq.length).toBeGreaterThanOrEqual(1);
    expect(payload.keywords).toContain("la roche-posay tunisie");
    expect(payload.seoScore).toBeGreaterThanOrEqual(70);
  });
});
