import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { type HomepageCategoryRow } from "@/lib/api/client";

type Variant = "grid" | "spotlight" | "rail";

/**
 * Three layouts so the homepage does not repeat one carousel:
 *  - spotlight: editorial panel + product grid (flip alternates the side)
 *  - rail: swipeable row on mobile, grid on desktop
 *  - grid: classic responsive grid
 */
export function HomeCategoryRow({
  row,
  bgClass = "bg-white",
  variant = "grid",
  flip = false,
  eyebrow,
}: {
  row: HomepageCategoryRow;
  bgClass?: string;
  variant?: Variant;
  flip?: boolean;
  eyebrow?: string;
}) {
  if (!row.products || row.products.length === 0) return null;
  const href = `/${row.slug}`;

  if (variant === "spotlight") {
    return (
      <section aria-labelledby={`row-${row.key}`} className={`py-10 sm:py-14 ${bgClass}`}>
        <div className="mx-auto grid max-w-[1440px] gap-5 px-4 sm:px-6 lg:grid-cols-[22rem_1fr] lg:gap-8 lg:px-8">
          <div
            className={`relative flex flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#6a2848] to-[#3f1329] p-6 text-primary-foreground sm:p-8 lg:min-h-[28rem] ${flip ? "lg:order-2" : ""}`}
          >
            <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
            {eyebrow && <p className="relative text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>}
            <h2 id={`row-${row.key}`} className="relative mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">{row.title}</h2>
            <p className="relative mt-2 text-sm leading-relaxed text-white/80">{row.subtitle}</p>
            <Link
              href={href}
              className="group relative mt-5 inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-primary transition-all hover:bg-soft-nude active:scale-[0.98]"
            >
              Voir toute la gamme <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {row.products.slice(0, 6).map((product, i) => (
              <div key={product.id} className={i >= 4 ? "hidden md:block" : ""}>
                <ProductCard product={product} variant="shop" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const list =
    variant === "rail" ? (
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {row.products.map((product) => (
          <div key={product.id} className="w-[44vw] max-w-[13rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ProductCard product={product} variant="shop" />
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {row.products.map((product) => (
          <ProductCard key={product.id} product={product} variant="shop" />
        ))}
      </div>
    );

  return (
    <section aria-labelledby={`row-${row.key}`} className={`py-10 sm:py-14 ${bgClass}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div className="min-w-0">
            <h2 id={`row-${row.key}`} className="font-serif text-xl font-bold tracking-tight text-ink sm:text-3xl">{row.title}</h2>
            <p className="mt-1 hidden max-w-2xl text-sm leading-relaxed text-ink-muted sm:block">{row.subtitle}</p>
          </div>
          <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover sm:text-sm">
            Voir tout <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        {list}
      </div>
    </section>
  );
}
