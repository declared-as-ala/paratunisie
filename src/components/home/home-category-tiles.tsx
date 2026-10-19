import Image from "next/image";
import Link from "next/link";
import type { HomepageCategoryRow } from "@/lib/api/client";

const SHORT_TITLES: Record<string, string> = {
  creatine: "Créatine",
  "whey-proteine": "Whey & Gainers",
  "pre-workout": "Pre-Workout",
  vitamines: "Vitamines",
  "bcaa-eaa": "BCAA & EAA",
  mineraux: "Zinc & Magnésium",
  "omega-3": "Oméga 3",
  ashwagandha: "Ashwagandha",
  minceur: "Minceur",
};

/** Visual shop-by-category. Images are the real product photos of each category's first product. */
export function HomeCategoryTiles({ rows }: { rows: HomepageCategoryRow[] }) {
  const tiles = rows.filter((r) => r.products.length > 0);
  if (tiles.length === 0) return null;
  return (
    <section aria-labelledby="home-categories" className="bg-[#FAF7F5] py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between sm:mb-6">
          <h2 id="home-categories" className="font-serif text-xl font-bold tracking-tight text-ink sm:text-3xl">
            Acheter par catégorie
          </h2>
          <Link href="/shop" className="text-xs font-bold text-primary hover:underline sm:text-sm">Toute la boutique</Link>
        </div>
        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-9 [&::-webkit-scrollbar]:hidden">
          {tiles.map((row) => (
            <li key={row.key} className="w-[6.25rem] shrink-0 snap-start sm:w-auto">
              <Link href={`/${row.slug}`} className="group flex flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <span className="relative block aspect-square w-full overflow-hidden rounded-3xl bg-white ring-1 ring-border/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-16px_rgba(94,32,60,0.35)] group-hover:ring-primary/30 motion-reduce:transition-none">
                  <Image
                    src={row.products[0].image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100px, (max-width: 1024px) 30vw, 150px"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </span>
                <span className="text-[0.75rem] font-bold leading-tight text-ink group-hover:text-primary sm:text-sm">
                  {SHORT_TITLES[row.key] ?? row.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
