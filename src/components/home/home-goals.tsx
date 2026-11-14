import Link from "next/link";
import { ArrowRight, Backpack, Beef, Dumbbell, HeartPulse, Scale, Zap, type LucideIcon } from "lucide-react";

import type { ShopDepartment } from "@/lib/api/client";

export type PopularSubcategory = { name: string; slug: string; count: number; icon: LucideIcon };

/** Decorative icon per department key; names, counts and links always come from the catalogue. */
const DEPARTMENT_ICONS: Record<string, LucideIcon> = {
  proteines: Beef,
  "prise-de-masse": Dumbbell,
  performance: Zap,
  "perte-de-poids": Scale,
  sante: HeartPulse,
  equipement: Backpack,
};

/**
 * "Shoppez par catégorie" — the six shop departments as image-panel cards,
 * plus a row of popular subcategories with live product counts.
 */
export function HomeGoals({ departments, popular }: { departments: ShopDepartment[]; popular: PopularSubcategory[] }) {
  return (
    <section aria-labelledby="home-goals" className="bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <h2 id="home-goals" className="font-serif text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Shoppez par <span className="text-primary">catégorie</span>
        </h2>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {departments.map((dept) => {
            const Icon = DEPARTMENT_ICONS[dept.key] ?? Dumbbell;
            return (
              <li key={dept.key}>
                <Link
                  href={dept.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border-strong/60 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/50 hover:shadow-[0_24px_40px_-26px_rgba(90,27,61,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="flex aspect-[4/3] items-center justify-center bg-muted transition-colors duration-300 group-hover:bg-primary-soft">
                    <Icon className="size-14 text-secondary/80 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary motion-reduce:transition-none sm:size-16" strokeWidth={1.25} aria-hidden />
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-2 px-4 py-4">
                    <span className="text-[0.8125rem] font-extrabold uppercase leading-tight tracking-wide text-foreground">
                      {dept.label}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {popular.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 sm:mt-6">
            {popular.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
                >
                  {p.name} <span className="font-normal text-ink-muted">({p.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
