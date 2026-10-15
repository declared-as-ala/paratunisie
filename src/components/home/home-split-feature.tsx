import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";

import { fetchPaginatedProducts } from "@/lib/api/client";
import { formatPrice } from "@/lib/data/products";

const ADVANTAGES = [
  "Sélection rigoureuse de grandes marques internationales",
  "Formats, dosages et prix clairement présentés",
  "Expédition rapide dans les 24 gouvernorats tunisiens",
  "Service client disponible pour toute question de commande",
];

export async function HomeSplitFeature() {
  const rows = await Promise.all(["creatine", "whey-proteine", "vitamines", "omega-3"].map((category) => fetchPaginatedProducts({ category, limit: 1 })));
  const featuredProducts = rows.flatMap((row) => row.products).map((product) => ({
    name: product.name, subtitle: `${product.brand} - ${product.size}`, price: formatPrice(product.priceMillimes), image: product.image, href: `/produits/${product.slug}`,
  }));
  return (
    <section className="bg-gradient-to-b from-[#FAF7F5]/80 via-white to-background py-20 sm:py-24 border-y border-border/70">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Brand Story & Bullet Points (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
              <Sparkles size={14} />
              <span>Nutrition &amp; Performance</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight leading-tight">
              Des compléments de qualité,{" "}
              <br className="hidden sm:inline" />
              <span className="font-serif italic text-primary">pour vos objectifs sportifs.</span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              ParaTunisie sélectionne des compléments alimentaires et produits de nutrition sportive issus de grandes marques reconnues pour accompagner vos entraînements et votre bien-être au quotidien.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-foreground/90 pt-1">
              {ADVANTAGES.map((adv) => (
                <li key={adv} className="flex items-center gap-2.5">
                  <span className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Check size={11} className="stroke-[3]" />
                  </span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-3.5">
              <Link
                href="/shop"
                className="group/button inline-flex shrink-0 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-white uppercase tracking-widest text-xs font-semibold px-6 py-3.5 shadow-md gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Découvrir le catalogue</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Curated Product Cards Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredProducts.map((prod) => (
              <Link
                key={prod.name}
                href={prod.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white p-2 mb-3">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{prod.subtitle}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{prod.price}</span>
                  <span className="size-6 rounded-full bg-secondary/80 text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
