import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { ConcernPLP } from "@/components/category/concern-plp";
import {
  getConcernBySlug,
  getAllConcernSlugs,
} from "@/lib/data/concerns";
import { categories } from "@/lib/data/categories";
import { fetchProducts } from "@/lib/api/client";

const SITE_URL = "https://paratunisie.com";

export function generateStaticParams() {
  return getAllConcernSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concern = getConcernBySlug(slug);
  if (!concern) return {};

  const title = `${concern.name} — ParaTunisie`;
  return {
    title,
    description: concern.seoIntro,
    alternates: { canonical: `/besoins/${concern.slug}` },
    openGraph: {
      type: "website",
      title,
      description: concern.seoIntro,
      url: `/besoins/${concern.slug}`,
    },
  };
}

export default async function ConcernPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concern = getConcernBySlug(slug);
  if (!concern) notFound();

  /* Fetch all products from the API, then filter using the concern's match function */
  const allProducts = await fetchProducts();
  const concernProducts = allProducts.filter(concern.match);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: concern.name, item: `${SITE_URL}/besoins/${concern.slug}` },
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
            Chargement…
          </div>
        }
      >
        <ConcernPLP
          concern={{
            slug: concern.slug,
            name: concern.name,
            eyebrow: concern.eyebrow,
            description: concern.description,
            seoIntro: concern.seoIntro,
            relatedConcerns: concern.relatedConcerns,
          }}
          products={concernProducts}
        />
      </Suspense>

      {/* SEO content */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              {concern.name} : notre sélection
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {concern.seoIntro}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Explorez aussi</h3>
            <div className="mt-3 space-y-2">
              <Link href="/shop" className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-soft-nude">
                <span>Le Shop complet</span><span className="text-muted-foreground">→</span>
              </Link>
              {categories.slice(0, 4).map((c) => (
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
