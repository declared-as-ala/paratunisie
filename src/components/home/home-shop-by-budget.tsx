import Link from "next/link";
import { Coins, ChevronRight } from "lucide-react";

const BUDGET_RANGES = [
  { label: "Moins de 30 DT", href: "/shop?maxPrice=30000", count: "45+ soins" },
  { label: "De 30 à 50 DT", href: "/shop?minPrice=30000&maxPrice=50000", count: "90+ soins" },
  { label: "De 50 à 100 DT", href: "/shop?minPrice=50000&maxPrice=100000", count: "120+ soins" },
  { label: "100 DT et plus", href: "/shop?minPrice=100000", count: "60+ soins" },
];

export function HomeShopByBudget() {
  return (
    <section className="bg-white py-10 sm:py-14 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/15">
              <Coins size={13} />
              Shopping par Prix
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Pour chaque budget
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {BUDGET_RANGES.map((b) => (
            <Link
              key={b.label}
              href={b.href}
              className="group flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-border/70 bg-surface-alt hover:border-primary/40 hover:bg-soft-nude/40 hover:shadow-xs transition-all"
            >
              <div>
                <span className="font-bold text-sm text-ink group-hover:text-primary transition-colors block">
                  {b.label}
                </span>
                <span className="text-[0.6875rem] font-medium text-ink-muted mt-0.5 block">
                  {b.count}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-end text-primary">
                <span className="text-[0.6875rem] font-bold opacity-0 group-hover:opacity-100 transition-opacity mr-1">Découvrir</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
