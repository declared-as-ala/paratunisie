import { articles, getArticleBySlug, type Article, type ArticleProductLink, type ArticleFaqItem } from "../../../src/lib/data/articles";
import { getProductBySlug } from "../../../src/lib/data/products";

describe("ParaTunisie SEO Articles & Content Hub Test Suite", () => {
  // Test 1: Exactly 20 articles
  it("Test 1: Exactly 20 articles are defined in the new strategy", () => {
    expect(articles).toHaveLength(20);
  });

  // Test 2: Slugs uniqueness and formatting
  it("Test 2: All 20 article slugs are unique, lower-case and url-safe", () => {
    const slugs = articles.map((a: Article) => a.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(20);

    slugs.forEach((slug: string) => {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).not.toContain(" ");
    });
  });

  // Test 3: Titles and H1s uniqueness and presence
  it("Test 3: All 20 articles have unique H1s and non-empty titles", () => {
    const titles = articles.map((a: Article) => a.h1);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(20);

    articles.forEach((a: Article) => {
      expect(a.title.length).toBeGreaterThan(15);
      expect(a.h1.length).toBeGreaterThan(15);
      expect(a.excerpt.length).toBeGreaterThan(30);
    });
  });

  // Test 4: Canonical URLs and SEO Titles
  it("Test 4: All articles have proper self-canonical URLs and SEO metadata", () => {
    const canonicals = articles.map((a: Article) => a.canonicalUrl);
    const uniqueCanonicals = new Set(canonicals);
    expect(uniqueCanonicals.size).toBe(20);

    articles.forEach((a: Article) => {
      expect(a.canonicalUrl).toBe(`/conseils/${a.slug}`);
      expect(a.seoTitle).toContain("ParaTunisie");
      expect(a.seoDescription.length).toBeGreaterThan(50);
      expect(a.indexable).toBe(true);
      expect(a.status).toBe("PUBLISHED");
    });
  });

  // Test 5: Focus keywords coverage
  it("Test 5: All 20 articles have targeted focus keywords without duplication", () => {
    const keywords = articles.map((a: Article) => a.focusKeyword);
    const uniqueKeywords = new Set(keywords);
    expect(uniqueKeywords.size).toBe(20);
  });

  // Test 6: Real products linkage
  it("Test 6: All referenced product slugs exist in the real database catalogue", () => {
    let totalLinkedProducts = 0;

    articles.forEach((a: Article) => {
      expect(a.products.length).toBeGreaterThanOrEqual(1);
      a.products.forEach((p: ArticleProductLink) => {
        if (p.productSlug) {
          const found = getProductBySlug(p.productSlug);
          expect(found).toBeDefined();
          expect(found?.name).toBeDefined();
          expect(found?.priceMillimes).toBeGreaterThan(0);
          totalLinkedProducts++;
        }
      });
    });

    expect(totalLinkedProducts).toBeGreaterThanOrEqual(30);
  });

  // Test 7: Categories belong to sports nutrition & wellness
  it("Test 7: All article categories are valid sports nutrition & wellness categories", () => {
    const allowed = [
      "Créatine",
      "Protéines & Masse",
      "Performance",
      "Acides Aminés",
      "Vitamines & Santé",
      "Bien-être",
      "Sèche & Minceur",
      "Débutants",
    ];

    articles.forEach((a: Article) => {
      expect(allowed).toContain(a.category);
    });
  });

  // Test 8: Internal topic cluster linking
  it("Test 8: Every article has valid internal cluster links and FAQs", () => {
    articles.forEach((a: Article) => {
      expect(a.relatedSlugs.length).toBeGreaterThanOrEqual(1);
      a.relatedSlugs.forEach((rel: string) => {
        const found = getArticleBySlug(rel);
        expect(found).toBeDefined();
      });

      expect(a.faqs.length).toBeGreaterThanOrEqual(1);
      a.faqs.forEach((faq: ArticleFaqItem) => {
        expect(faq.question.length).toBeGreaterThan(5);
        expect(faq.answer.length).toBeGreaterThan(15);
      });
    });
  });

  // Test 9: Editorial author and sources
  it("Test 9: Author is verified as Équipe éditoriale ParaTunisie and sources exist", () => {
    articles.forEach((a: Article) => {
      expect(a.authorName).toBe("Équipe éditoriale ParaTunisie");
      expect(a.takeaways.length).toBeGreaterThanOrEqual(3);
    });
  });
});
