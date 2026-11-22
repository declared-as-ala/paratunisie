import Link from "next/link";

import { CLUSTER_LABEL, GOVERNORATES, type Cluster } from "@/lib/local/governorates";

/** Directory of the 24 governorates for one cluster ("Livraison et produits par région"). */
export function RegionDirectory({ cluster, compact = false }: { cluster: Cluster; compact?: boolean }) {
  return (
    <nav aria-label={`${CLUSTER_LABEL[cluster].short} par gouvernorat`}>
      <ul className={compact ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"}>
        {GOVERNORATES.map((g) => (
          <li key={g.slug}>
            <Link href={`${CLUSTER_LABEL[cluster].path}/${g.slug}`} className="flex min-h-11 items-center rounded-2xl border border-border bg-white px-4 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
