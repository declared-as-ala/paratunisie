import Image from "next/image";
import Link from "next/link";
import { Sun, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data/products";

export function HomeSeasonalCampaign() {
  const seasonalProducts = [products[0], products[1], products[2]];

  return (
    <section className="bg-white py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Editorial Visual Banner */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-border min-h-[400px] bg-gradient-to-br from-amber-500/20 via-primary/8 to-soft-nude p-8 sm:p-10 flex flex-col justify-between shadow-xs">
            <Image
              src="/assets/hero-cinematic-poster.webp"
              alt="Campagne solaire ParaTunisie"
              fill
              sizes="(max-width: 1023px) 100vw, 40vw"
              className="object-cover mix-blend-overlay opacity-55"
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-500/30 mb-4">
                <Sun size={14} />
                Campagne de Saison
              </div>
              <h3 className="font-serif text-2xl font-medium text-ink sm:text-3xl lg:text-4xl leading-tight">
                L&apos;été sous haute protection
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md">
                Écrans solaires dermatologiques SPF50+, fluides invisibles anti-brillance et soins après-soleil apaisants.
              </p>
            </div>

            <div className="relative z-10 pt-6 border-t border-border/40">
              <Link
                href="/shop?categorie=solaire"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-xs"
              >
                Découvrir la sélection solaire <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right 3 Curated Products */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Sélection Solaire</p>
                <h4 className="text-lg font-serif font-medium text-ink">3 soins incontournables de la saison</h4>
              </div>
              <Link
                href="/shop?categorie=solaire"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Tout voir <ChevronRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {seasonalProducts.map((p) => (
                <ProductCard key={p.id} product={p} variant="shop" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
