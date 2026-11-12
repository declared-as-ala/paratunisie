import Image from "next/image";
import Link from "next/link";
import type { HomepageCategoryRow } from "@/lib/api/client";

type CategoryTileDef = {
  key: string;
  label: string;
  slug: string;
  defaultImage: string;
  isSpecial?: boolean;
  badge?: string;
};

const CATEGORY_STRIP_ITEMS: CategoryTileDef[] = [
  { key: "whey-proteine", label: "Whey Protéine", slug: "whey-proteine", defaultImage: "/uploads/products/anabolic-whey-80-2-25kg-proactive-d1e70098.webp" },
  { key: "creatine", label: "Créatine", slug: "creatine", defaultImage: "/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp" },
  { key: "gainers-proteines", label: "Mass Gainer", slug: "gainers-proteines", defaultImage: "/uploads/products/thunder-gainer-5-4kg-challenger-nutrition-20b49293.webp" },
  { key: "pre-workout", label: "Pré-Workout", slug: "pre-workout", defaultImage: "/uploads/products/psychotic-pre-workout-c7dabc0f.webp" },
  { key: "acides-amines", label: "BCAA / EAA", slug: "acides-amines", defaultImage: "/uploads/products/xtend-bcaa-420g-f3c29f70.webp" },
  { key: "vitamines", label: "Vitamines", slug: "vitamines", defaultImage: "/uploads/products/one-a-day-biotech-usa-635bcef6.webp" },
  { key: "mineraux", label: "Minéraux", slug: "mineraux", defaultImage: "/uploads/products/zinc-90-tab-real-pharm-a5dee538.webp" },
  {
    key: "anti-stress",
    label: "Anti-Stress",
    slug: "pack-anti-stress",
    defaultImage: "/assets/pack-anti-stress.jpg",
    isSpecial: true,
    badge: "Nouveau",
  },
  { key: "bruleurs-de-graisse", label: "Perte de poids", slug: "bruleurs-de-graisse", defaultImage: "/uploads/products/lipo-6-black-ultra-concentrate-60caps-7abcdedc.webp" },
  { key: "bien-etre", label: "Bien-être", slug: "bien-etre", defaultImage: "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp" },
  { key: "soins", label: "Santé & Beauté", slug: "soins", defaultImage: "/uploads/products/bio-orient-bain-d-huiles-cheveux-90-ml-18f04f26.webp" },
  { key: "accessoires", label: "Accessoires", slug: "accessoires", defaultImage: "/uploads/products/bandes-de-tirage.webp" },
];

/**
 * Category shortcut strip matching the attached reference:
 * Includes the highlighted "Anti-Stress" tile with pink glow border and "Nouveau" badge.
 */
export function HomeCategoryTiles({ rows }: { rows: HomepageCategoryRow[] }) {
  const getProductImage = (def: CategoryTileDef) => {
    if (def.isSpecial) return def.defaultImage;
    const matchedRow = rows.find((r) => r.key === def.key || r.slug === def.slug);
    if (matchedRow && matchedRow.products.length > 0 && matchedRow.products[0].image) {
      return matchedRow.products[0].image;
    }
    return def.defaultImage;
  };

  return (
    <section aria-labelledby="home-categories" className="bg-[#FAF7F5] py-4 sm:py-7">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-3 min-[380px]:grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3.5">
          {CATEGORY_STRIP_ITEMS.map((item) => {
            const isSpecial = item.isSpecial;
            const targetUrl = isSpecial ? "/pack-anti-stress" : `/${item.slug}`;

            return (
              <li key={item.slug} className="min-w-0">
                <Link
                  href={targetUrl}
                  className="group relative flex flex-col items-center gap-1.5 sm:gap-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {/* Badge for special Anti-Stress tile */}
                  {item.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}

                  {/* Square Card Container */}
                  <span
                    className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 group-hover:-translate-y-1 motion-reduce:transition-none ${
                      isSpecial
                        ? "bg-white border-2 border-[#E11D48] shadow-[0_0_16px_rgba(225,29,72,0.35)] ring-2 ring-[#E11D48]/20"
                        : "bg-white border border-border/80 shadow-2xs group-hover:border-primary/40 group-hover:shadow-[0_12px_24px_-10px_rgba(94,32,60,0.25)]"
                    }`}
                  >
                    <Image
                      src={getProductImage(item)}
                      alt={item.label}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 100px"
                      className={`object-contain p-2 sm:p-2.5 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none ${
                        isSpecial ? "p-1.5 object-cover" : "mix-blend-multiply"
                      }`}
                    />
                  </span>

                  {/* Category Label */}
                  {isSpecial ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-[0.6875rem] sm:text-xs font-black text-white shadow-2xs">
                      {item.label}
                    </span>
                  ) : (
                    <span className="text-[0.6875rem] sm:text-xs font-bold leading-tight text-ink group-hover:text-primary transition-colors line-clamp-1">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
