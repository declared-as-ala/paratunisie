import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";
import { brands } from "@/lib/data/brands";

export function HomeFeaturedBrands() {
  const featuredBrands = brands.slice(0, 8);

  return (
    <section className="bg-soft-nude/40 py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/15">
              <Award size={13} />
              Marques & Laboratoires Certifiés
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Marques officielles
            </h2>
          </div>
          <Link
            href="/marques"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Découvrir toutes les marques
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {featuredBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/marques/${b.slug}`}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-border/70 bg-white hover:border-primary/40 hover:shadow-xs transition-all text-center h-28"
            >
              <span className="font-serif text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
                {b.name}
              </span>
              <span className="text-[0.625rem] font-medium text-ink-muted mt-1 line-clamp-1">
                {b.tagline || "Dermatologie"}
              </span>
              <span className="text-[0.625rem] text-primary font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Voir produits <ChevronRight size={10} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
