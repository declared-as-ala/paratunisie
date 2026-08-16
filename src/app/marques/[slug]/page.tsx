import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { BrandProducts } from "@/components/marques/brand-products";
import { fetchBrandBySlug, fetchProducts } from "@/lib/api/client";

const SITE_URL = "https://paratunisie.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return {};

  // Admin SEO overrides take priority — same pattern as the product page,
  // and the same bug: these fields already existed on the Brand model and
  // in the admin editor, but no public page ever read them back.
  const title = brand.seoTitle || `${brand.name} Tunisie — Produits authentiques`;
  const description =
    brand.seoDescription ||
    brand.shortDescription ||
    brand.description ||
    `Découvrez tous les produits ${brand.name} disponibles en Tunisie sur ParaTunisie : prix, disponibilité et livraison partout dans le pays.`;

  return {
    title,
    description,
    alternates: { canonical: brand.canonicalUrl || `/marques/${brand.slug}` },
    robots: brand.indexable === false ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: `/marques/${brand.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) notFound();

  const brandProducts = await fetchProducts({ brand: brand.slug });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Marques", item: `${SITE_URL}/marques` },
      { "@type": "ListItem", position: 3, name: brand.name, item: `${SITE_URL}/marques/${brand.slug}` },
    ],
  };

  const introText =
    brand.description ||
    brand.shortDescription ||
    `Découvrez la sélection ${brand.name} disponible en Tunisie : produits authentiques, prix et livraison partout dans le pays.`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-muted sm:text-sm">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden className="text-ink-muted/50">/</li>
            <li><Link href="/marques" className="hover:text-primary">Marques</Link></li>
            <li aria-hidden className="text-ink-muted/50">/</li>
            <li aria-current="page" className="text-ink">{brand.name}</li>
          </ol>
        </nav>

        <header>
          {brand.tagline && (
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-sm">
              {brand.tagline}
            </p>
          )}
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {brand.name}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {introText}
          </p>
        </header>

        <BrandProducts brandName={brand.name} products={brandProducts} />
      </div>
    </>
  );
}
