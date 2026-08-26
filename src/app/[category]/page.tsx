import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { CategoryPLP } from "@/components/category/category-plp";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { fetchCategoryBySlug, fetchProducts, fetchSeoRedirect } from "@/lib/api/client";

const SITE_URL = "https://paratunisie.com";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = await fetchCategoryBySlug(slug);
  if (!cat) return {};

  const title = cat.seoTitle || `${cat.name} en Tunisie | ParaTunisie`;
  const description = cat.seoDescription || cat.seoIntro || cat.shortDescription || cat.description || `Découvrez ${cat.name} en Tunisie sur ParaTunisie.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: cat.canonicalUrl || `/${cat.slug}` },
    robots: { index: cat.indexable !== false, follow: cat.followLinks !== false },
    openGraph: {
      type: "website",
      title: cat.ogTitle || title,
      description: cat.ogDescription || description,
      url: cat.canonicalUrl || `/${cat.slug}`,
      images: cat.ogImage ? [{ url: cat.ogImage, alt: cat.imageAlt || cat.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: cat.ogTitle || title, description: cat.ogDescription || description, images: cat.ogImage ? [cat.ogImage] : undefined },
  };
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
  const cat = localCat || { slug: dbCat!.slug, name: dbCat!.name, eyebrow: dbCat!.parent?.name, description: dbCat!.seoIntro || dbCat!.shortDescription || dbCat!.description || "", seoIntro: dbCat!.seoIntro || "", subcategories: [], concerns: [] };

  const params_ = await searchParams;

  /* Fetch products from the API by category */
  const apiProducts = await fetchProducts({ category: cat.slug });

  /* Pre-compute serializable maps on the server */
  const subcategoryMap: Record<string, string[]> = {};
  for (const sub of cat.subcategories) {
    subcategoryMap[sub.slug] = apiProducts.filter(sub.match).map((p) => p.id);
  }

  const concernMap: Record<string, string[]> = {};
  for (const concern of cat.concerns) {
    concernMap[concern.name] = apiProducts.filter(concern.match).map((p) => p.id);
  }

  /* Strip function properties from category for client */
  const categoryData = {
    slug: cat.slug,
    name: cat.name,
    h1: dbCat?.seoH1 || cat.name,
    eyebrow: cat.eyebrow,
    description: cat.description,
    subcategories: cat.subcategories.map((s) => ({ slug: s.slug, name: s.name })),
    concerns: cat.concerns.map((c) => ({ slug: c.slug, name: c.name })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: cat.name, item: `${SITE_URL}/${cat.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense
        fallback={
          <div className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-16 text-muted-foreground">
            Chargement de {cat.name}…
          </div>
        }
      >
        <CategoryPLP
          category={categoryData}
          products={apiProducts}
          subcategoryMap={subcategoryMap}
          concernMap={concernMap}
          searchParams={params_}
        />
      </Suspense>

      {/* ── SEO Content Section ── */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              {cat.name} : notre sélection
            </h2>
            <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{dbCat?.seoContent || cat.seoIntro}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Explorez aussi</h3>
            <div className="mt-3 space-y-2">
              <Link href="/marques" className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-soft-nude">
                <span>Toutes nos marques</span><span className="text-muted-foreground">→</span>
              </Link>
              <Link href="/shop" className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-soft-nude">
                <span>Le Shop complet</span><span className="text-muted-foreground">→</span>
              </Link>
              {categories.filter((c) => c.slug !== cat.slug).slice(0, 3).map((c) => (
                <Link key={c.slug} href={`/${c.slug}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-soft-nude">
                  <span>{c.name}</span><span className="text-muted-foreground">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
