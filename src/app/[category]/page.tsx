import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { fetchCategoryBySlug, fetchPaginatedProducts, fetchSeoRedirect } from "@/lib/api/client";
import { ProductCard } from "@/components/product/product-card";
import { ProductRichText } from "@/components/product/product-rich-text";
import { buildCategoryMetadata, buildBreadcrumbsSchema, buildItemListSchema, buildFaqSchema } from "@/lib/seo";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ category: string }>; searchParams: Promise<Query> };
const scalar = (value: Query[string]) => typeof value === "string" ? value : "";
const pageNumber = (query: Query) => Math.max(1, Math.floor(Number(scalar(query.page)) || 1));
const filtered = (query: Query) => ["q", "brand", "sort"].some((key) => Boolean(scalar(query[key])));

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { robots: { index: false, follow: true } };
  const query = await searchParams;
  const result = await fetchPaginatedProducts({ category: slug, limit: 1 });
  return buildCategoryMetadata({
    ...category,
    name: category.name, slug, seoTitle: category.seoTitle,
    seoDescription: category.seoDescription || category.seoIntro || category.description,
    indexable: category.indexable !== false && result.meta.total > 0,
    page: pageNumber(query), hasFilters: filtered(query),
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) {
    const target = await fetchSeoRedirect(`/${slug}`);
    if (target) permanentRedirect(target);
    notFound();
  }
  const query = await searchParams;
  const page = pageNumber(query);
  const { products, meta } = await fetchPaginatedProducts({
    category: category.slug, page, limit: 24,
    search: scalar(query.q), brand: scalar(query.brand), sort: scalar(query.sort),
  });
  if (page > meta.totalPages) notFound();
  const crumbs = [{ name: "Accueil", url: "/" },
    ...(category.parent ? [{ name: category.parent.name, url: `/${category.parent.slug}` }] : []),
    { name: category.name, url: `/${category.slug}` }];
  const schemas = [buildBreadcrumbsSchema(crumbs), {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: category.seoH1 || category.name,
    description: category.seoIntro || category.shortDescription || category.name,
    url: buildCanonicalUrl(`/${slug}`, { page, allowPagination: true }),
  }, buildItemListSchema(products.map((product, index) => ({
    name: product.name, url: `/produits/${product.slug}`, position: (page - 1) * 24 + index + 1,
  })), category.name)];
  const faqText = category.seoContent?.split("## Questions fréquentes\n")[1];
  const faqs = faqText ? Array.from(faqText.matchAll(/### ([^\n]+)\n\n([\s\S]*?)(?=\n\n### |$)/g), (match) => ({
    question: match[1], answer: match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim(),
  })) : [];
  const pageUrl = (nextPage: number) => {
    const values = new URLSearchParams();
    for (const key of ["q", "brand", "sort"]) if (scalar(query[key])) values.set(key, scalar(query[key]));
    if (nextPage > 1) values.set("page", String(nextPage));
    return `/${slug}${values.size ? `?${values}` : ""}`;
  };
  return <main className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    {page === 1 && !filtered(query) && faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqs)).replace(/</g, "\\u003c") }} />}
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
    <nav aria-label="Fil d’Ariane" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      {crumbs.map((crumb, index) => <span key={crumb.url}>{index > 0 && <span aria-hidden="true"> / </span>}<Link href={crumb.url} aria-current={index === crumbs.length - 1 ? "page" : undefined}>{crumb.name}</Link></span>)}
    </nav>
    <header className="max-w-3xl space-y-3">
      <h1 className="font-serif text-3xl font-bold sm:text-4xl">{category.seoH1 || category.name}</h1>
      <p className="text-muted-foreground">{category.seoIntro || category.shortDescription || ""}</p>
    </header>
    {Boolean(category.children?.length) && <nav aria-label="Sous-catégories" className="flex flex-wrap gap-2">
      {category.children!.map((child) => <Link key={child.slug} href={`/${child.slug}`} className="rounded-full border px-4 py-2 text-sm hover:border-primary">{child.name}</Link>)}
    </nav>}
    <details open={filtered(query)} className="rounded-xl border bg-white">
    <summary className="min-h-12 cursor-pointer px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary">Filtrer et trier{filtered(query) ? " · Filtres actifs" : ""}</summary>
    <form action={`/${slug}`} method="get" className="grid grid-cols-2 items-end gap-3 border-t p-4 md:grid-cols-4">
      <label className="flex min-w-0 flex-col gap-1 text-sm">Rechercher<input aria-label="Rechercher dans cette catégorie" name="q" defaultValue={scalar(query.q)} placeholder="Nom du produit" className="min-h-11 min-w-0 rounded-lg border px-3" /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Marque<input name="brand" defaultValue={scalar(query.brand)} placeholder="Nom de la marque" className="min-h-11 min-w-0 rounded-lg border px-3" /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Trier<select name="sort" defaultValue={scalar(query.sort)} className="min-h-11 min-w-0 rounded-lg border px-3"><option value="">Disponibilité</option><option value="name">Nom A–Z</option><option value="newest">Nouveautés</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option></select></label>
      <button className="min-h-11 rounded-lg bg-primary px-5 text-white">Appliquer</button>
      {filtered(query) && <Link href={`/${slug}`} className="px-3 py-3 text-sm underline">Réinitialiser</Link>}
    </form>
    </details>
    <p className="text-sm text-muted-foreground">{meta.total} produit{meta.total !== 1 ? "s" : ""}{page > 1 ? ` · Page ${page}` : ""}</p>
    <section aria-label="Produits" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
      {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
    </section>
    {products.length === 0 && <p className="rounded-xl bg-soft-nude p-6">{filtered(query) ? "Aucun produit ne correspond à ces filtres. Essayez une autre recherche." : "Aucun produit n’est actuellement proposé dans cette catégorie."} <Link href="/shop" className="underline">Voir le catalogue</Link></p>}
    {meta.totalPages > 1 && <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: meta.totalPages }, (_, index) => index + 1).map((number) => <Link key={number} href={pageUrl(number)} aria-current={page === number ? "page" : undefined} className={`min-w-11 rounded-lg border p-3 text-center ${page === number ? "bg-primary text-white" : ""}`}>{number}</Link>)}
    </nav>}
    {page === 1 && !filtered(query) && category.seoContent && <section className="max-w-4xl border-t pt-10"><ProductRichText content={category.seoContent} className="text-sm leading-7 text-muted-foreground" /></section>}
    <nav aria-label="Continuer la visite" className="flex flex-wrap gap-5 border-t pt-6 text-sm underline"><Link href="/nutrition-sportive">Nutrition sportive</Link><Link href="/complements-alimentaires">Compléments alimentaires</Link><Link href="/marques">Marques</Link><Link href="/conseils">Conseils</Link><Link href="/shop">Tous les produits</Link></nav>
  </main>;
}
