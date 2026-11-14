import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BrandListItem } from "@/lib/api/client";

/** Partner brands as a bordered logo wall, built from catalogue brands that have a logo and live products. */
export function HomeFeaturedBrands({ brands }: { brands: BrandListItem[] }) {
  const withLogo = brands
    .filter((b) => b.logo && (b.productCount ?? 0) > 0)
    .sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));
  // Whole rows only (8 per row on desktop) so the wall never ends with empty cells.
  const shown = withLogo.slice(0, Math.min(24, Math.floor(withLogo.length / 8) * 8));
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="home-brands" className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="home-brands" className="text-xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
            Nos marques partenaires
          </h2>
          <Link
            href="/marques"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border-strong px-5 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Toutes les marques <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border-strong bg-border-strong sm:mt-8 sm:grid-cols-4 lg:grid-cols-8">
          {shown.map((brand) => (
            <li key={brand.slug} className="bg-card">
              <Link
                href={`/marques/${brand.slug}`}
                aria-label={brand.name}
                className="group relative flex h-24 items-center justify-center transition-colors hover:bg-primary-soft/50 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary sm:h-28"
              >
                <Image
                  src={brand.logo as string}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 160px"
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
