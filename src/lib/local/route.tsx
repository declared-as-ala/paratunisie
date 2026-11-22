import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocalLanding } from "@/components/local/local-landing";
import { buildLocalCopy } from "@/lib/local/content";
import { CLUSTER_LABEL, GOVERNORATES, getGovernorate, isIndexable, type Cluster } from "@/lib/local/governorates";
import { loadLocalPageData, passesQualityGate } from "@/lib/local/page-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbsSchema, buildItemListSchema } from "@/lib/seo/schema";

export const dynamic = "force-dynamic";
export const staticParamsFor = () => GOVERNORATES.map((g) => ({ gouvernorat: g.slug }));

export async function localMetadata(cluster: Cluster, slug: string): Promise<Metadata> {
  const g = getGovernorate(slug);
  if (!g) return { robots: { index: false, follow: false } };
  const data = await loadLocalPageData(cluster);
  const copy = buildLocalCopy(cluster, g, data);
  // Indexed only if listed in the pilot AND the live catalogue still gives enough real content.
  const indexable = isIndexable(cluster, slug) && passesQualityGate(data);
  return buildPageMetadata({ title: copy.title, description: copy.description, path: `${CLUSTER_LABEL[cluster].path}/${slug}`, noindex: !indexable });
}

export async function LocalRoute({ cluster, slug }: { cluster: Cluster; slug: string }) {
  const g = getGovernorate(slug);
  if (!g) notFound();
  const data = await loadLocalPageData(cluster);
  const crumbs = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: CLUSTER_LABEL[cluster].short, url: CLUSTER_LABEL[cluster].path },
    { name: g.name, url: `${CLUSTER_LABEL[cluster].path}/${g.slug}` },
  ]);
  const list = data.products.length ? buildItemListSchema(data.products.map((p) => ({ name: p.name, url: `/produits/${p.slug}` })), `${CLUSTER_LABEL[cluster].short} ${g.name}`) : null;
  const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(crumbs) }} />
      {list && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(list) }} />}
      <LocalLanding cluster={cluster} governorate={g} data={data} />
    </>
  );
}
