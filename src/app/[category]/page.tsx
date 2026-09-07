import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

import { CategoryPLP } from "@/components/category/category-plp";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getCategoryGuide } from "@/lib/data/category-guides";
import { fetchCategoryBySlug, fetchPaginatedProducts, fetchSeoRedirect } from "@/lib/api/client";
import {
  buildCategoryMetadata,
  buildBreadcrumbsSchema,
  buildFaqSchema,
  buildItemListSchema,
} from "@/lib/seo";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const query = await searchParams;
  const [localCat, dbCat] = [getCategoryBySlug(slug), await fetchCategoryBySlug(slug)];
  if (!localCat && !dbCat) return {};

  const page = Number(query.page) || 1;
  const hasFilters = Object.keys(query).some((k) => k !== "page");

  const name = localCat?.name || dbCat?.name || "";
  const seoTitle = localCat?.seoTitle || dbCat?.seoTitle;
  const seoDescription =
    localCat?.seoDescription ||
    dbCat?.seoDescription ||
    dbCat?.seoIntro ||
    dbCat?.shortDescription ||
    dbCat?.description ||
    localCat?.description;

  return buildCategoryMetadata({
    name,
    slug,
    seoTitle,
    seoDescription,
    indexable: dbCat?.indexable,
    page,
    hasFilters,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category: slug } = await params;
  const [localCat, dbCat] = [getCategoryBySlug(slug), await fetchCategoryBySlug(slug)];
  if (!localCat && !dbCat) {
    const redirect = await fetchSeoRedirect(`/${slug}`);
    if (redirect) permanentRedirect(redirect);
    notFound();
  }
  const cat = localCat || {
    slug: dbCat!.slug,
    name: dbCat!.name,
    eyebrow: dbCat!.parent?.name,
    description: dbCat!.seoIntro || dbCat!.shortDescription || dbCat!.description || "",
    seoIntro: dbCat!.seoIntro || "",
    subcategories: [],
    concerns: [],
  };

  const guide = getCategoryGuide(cat.slug);

  const params_ = await searchParams;
  const page = Math.max(1, Number(params_.page) || 1);

  /* Keep collection HTML bounded and expose crawlable page links. */
  const paginated = await fetchPaginatedProducts({ category: cat.slug, page, limit: 24 });
  const rawProducts = paginated.products;

  /* Dynamically calculate genuine minimum price from in-stock products */
  const inStockProducts = rawProducts.filter((p) => p.inStock);
  const minPriceDt =
    inStockProducts.length > 0
      ? Math.min(...inStockProducts.map((p) => (p.salePriceMillimes || p.priceMillimes) / 1000))
      : null;
  const dynamicPriceText =
    minPriceDt !== null ? `à partir de ${Math.round(minPriceDt)} DT` : "aux meilleurs prix du marché";

  /* Strip large non-card text fields to keep serialized RSC HTML stream lightweight */
  const cardProducts = rawProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    benefit: p.benefit,
    size: p.size,
    priceMillimes: p.priceMillimes,
    regularPriceMillimes: p.regularPriceMillimes,
    salePriceMillimes: p.salePriceMillimes,
    saleStartAt: p.saleStartAt,
    saleEndAt: p.saleEndAt,
    category: p.category,
    categorySlug: p.categorySlug,
    concerns: p.concerns,
    skinTypes: p.skinTypes,
    image: p.image,
    imageAlt: p.imageAlt,
    inStock: p.inStock,
    description: "",
    benefits: [],
    usage: "",
    sizes: p.sizes,
    routineTime: p.routineTime,
  }));

  /* Pre-compute serializable maps on the server */
  const subcategoryMap: Record<string, string[]> = {};
  for (const sub of cat.subcategories) {
    subcategoryMap[sub.slug] = rawProducts.filter(sub.match).map((p) => p.id);
  }

  const concernMap: Record<string, string[]> = {};
  for (const concern of cat.concerns) {
    concernMap[concern.name] = rawProducts.filter(concern.match).map((p) => p.id);
  }

  /* Strip function properties from category for client */
  const categoryData = {
    slug: cat.slug,
    name: cat.name,
    h1: localCat?.seoH1 || dbCat?.seoH1 || cat.name,
    eyebrow: cat.eyebrow,
    description: cat.description,
    subcategories: cat.subcategories.map((s) => ({ slug: s.slug, name: s.name })),
    concerns: cat.concerns.map((c) => ({ slug: c.slug, name: c.name })),
  };

  const breadcrumbJsonLd = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: cat.name, url: `/${cat.slug}` },
  ]);

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryData.h1 || categoryData.name,
    description: cat.description,
    url: buildCanonicalUrl(`/${cat.slug}`),
  };

  const itemListJsonLd = buildItemListSchema(
    cardProducts.map((p, idx) => ({
      name: `${p.name} ${p.brand ? `- ${p.brand}` : ""}`.trim(),
      url: `/produits/${p.slug}`,
      position: idx + 1,
    })),
    categoryData.h1 || categoryData.name
  );

  const faqJsonLd = guide?.faqs?.length ? buildFaqSchema(guide.faqs) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Suspense
        fallback={
          <div className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-16 text-muted-foreground">
            Chargement de {cat.name}…
          </div>
        }
      >
        <CategoryPLP
          category={categoryData}
          products={cardProducts}
          subcategoryMap={subcategoryMap}
          concernMap={concernMap}
          searchParams={params_}
          meta={paginated.meta}
        />
      </Suspense>

      {/* ── SEO Buyer Guide & Educational Content Section (Below Products to Preserve UX) ── */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 border-t border-border/60 mt-12 bg-white/50">
        <div className="space-y-10">
          {/* Main Category Overview & Hub Links */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Conseils &amp; Guide d&apos;Achat
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {guide?.title || `${cat.name} : notre sélection & conseils`}
              </h2>
              <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {guide?.intro || dbCat?.seoContent || cat.seoIntro || cat.description}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Explorez aussi</h3>
              <div className="mt-3 space-y-1.5">
                <Link
                  href="/nutrition-sportive"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-soft-nude"
                >
                  <span>Nutrition Sportive</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
                <Link
                  href="/marques"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-soft-nude"
                >
                  <span>Toutes nos marques</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
                <Link
                  href="/shop"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-soft-nude"
                >
                  <span>Le Shop complet</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
                {categories
                  .filter((c) => c.slug !== cat.slug)
                  .slice(0, 3)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-soft-nude"
                    >
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          {/* Structured Buyer Guide Sections with exact H2 Hierarchy */}
          {guide?.sections && guide.sections.length > 0 ? (
            <div className="space-y-6 pt-4 border-t border-border/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guide.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border/80 bg-white p-6 shadow-2xs space-y-3"
                  >
                    <h2 className="font-serif text-lg font-bold text-ink">{section.heading}</h2>
                    {section.type === "points" && section.points && (
                      <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                        {section.points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary font-bold">✓</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.type === "dynamic-price" && section.content && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {section.content.replace("{dynamicPriceText}", dynamicPriceText)}
                      </p>
                    )}
                    {section.type !== "points" && section.type !== "dynamic-price" && section.content && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : guide?.howToChoose && guide?.usageGuide ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
              <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-2xs space-y-3">
                <h2 className="font-serif text-lg font-bold text-ink">{guide.howToChoose.heading}</h2>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {guide.howToChoose.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-2xs space-y-3">
                <h2 className="font-serif text-lg font-bold text-ink">{guide.usageGuide.heading}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {guide.usageGuide.content}
                </p>
              </div>
            </div>
          ) : null}

          {/* Related In-Depth Guide Callout */}
          {guide?.relatedGuide && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <BookOpen className="size-4" />
                  <span>Guide Détaillé</span>
                </div>
                <h3 className="font-serif text-base font-bold text-ink">{guide.relatedGuide.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Pour aller plus loin, consultez notre dossier rédigé par nos experts.
                </p>
              </div>
              <Link
                href={`/conseils/${guide.relatedGuide.slug}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Lire le guide</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          )}

          {/* Structured FAQ Section */}
          {guide?.faqs && guide.faqs.length > 0 && (
            <div className="pt-4 border-t border-border/40 space-y-4">
              <h2 className="font-serif text-xl font-bold text-ink">Questions fréquentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guide.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/80 bg-white p-5 shadow-2xs space-y-2"
                  >
                    <h3 className="font-serif text-sm font-bold text-ink">{faq.question}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
