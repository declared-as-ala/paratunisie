import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";

import { BrandProducts } from "@/components/marques/brand-products";
import { fetchBrandBySlug, fetchProducts, fetchSeoRedirect } from "@/lib/api/client";
import { buildBrandMetadata, buildBreadcrumbsSchema, buildCanonicalUrl } from "@/lib/seo";
import { COMPANY_CONFIG } from "@/lib/config/company";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return {};

  return buildBrandMetadata({
    name: brand.name,
    slug: brand.slug,
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    description: brand.shortDescription || brand.description,
    logo: brand.ogImage || brand.image || brand.logo,
    indexable: brand.indexable,
  });
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) {
    const redirect = await fetchSeoRedirect(`/marques/${slug}`);
    if (redirect) permanentRedirect(redirect);
    notFound();
  }

  const brandProducts = await fetchProducts({ brand: brand.slug });

  const breadcrumbJsonLd = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: "Marques", url: "/marques" },
    { name: brand.name, url: `/marques/${brand.slug}` },
  ]);

  const introText =
    brand.description ||
    brand.shortDescription ||
    `Découvrez la sélection ${brand.name} disponible en Tunisie : produits authentiques, prix et livraison partout dans le pays.`;

  const brandLogo = brand.image || brand.logo || undefined;

  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: buildCanonicalUrl(`/marques/${brand.slug}`),
    logo: brandLogo
      ? brandLogo.startsWith("http")
        ? brandLogo
        : `${COMPANY_CONFIG.siteUrl}${brandLogo.startsWith("/") ? "" : "/"}${brandLogo}`
      : undefined,
    description: introText,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-muted sm:text-sm font-medium">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
            <li aria-hidden className="text-ink-muted/40">/</li>
            <li><Link href="/marques" className="hover:text-primary transition-colors">Marques</Link></li>
            <li aria-hidden className="text-ink-muted/40">/</li>
            <li aria-current="page" className="text-ink font-bold">{brand.name}</li>
          </ol>
        </nav>

        {/* Brand Banner Header */}
        <header className="rounded-3xl border border-border/80 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Official Logo Well */}
            <div className="size-24 sm:size-28 shrink-0 rounded-2xl border border-border/70 bg-white p-3 flex items-center justify-center shadow-xs">
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt={`Logo ${brand.name} Tunisie`}
                  className="max-h-full max-w-full object-contain filter contrast-105"
                />
              ) : (
                <div className="size-16 rounded-xl bg-primary/10 text-primary font-serif font-black text-2xl flex items-center justify-center">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[0.6875rem] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Marque identifiée
                </span>
                {brand.origin && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.6875rem] font-bold text-slate-700">
                    Origine : {brand.origin}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                {brand.seoH1 || `${brand.name} Tunisie`}
              </h1>

              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-3xl">
                {introText}
              </p>
            </div>
          </div>
        </header>

        <BrandProducts brandName={brand.name} products={brandProducts} />

        {brand.seoContent && (
          <section className="mt-14 max-w-4xl rounded-3xl border border-border/80 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-2xl font-bold text-ink">
              À propos des compléments {brand.name} en Tunisie
            </h2>
            <p className="mt-3 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-ink-muted">
              {brand.seoContent}
            </p>
          </section>
        )}
      </div>
    </>
  );
}
