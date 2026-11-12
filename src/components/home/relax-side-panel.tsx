import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Heart, Leaf, Star, Sparkles, Flame } from "lucide-react";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { FeaturedActions, FeaturedImpression, TrackedLink } from "@/components/home/featured-product-actions";

export interface RelaxProductData {
  id: string;
  name: string;
  brand: string;
  slug: string;
  image: string;
  imageAlt?: string;
  priceMillimes: number;
  regularPriceMillimes?: number;
  benefit?: string;
  inStock?: boolean;
}

const DEFAULT_RELAX_MAIN: RelaxProductData = {
  id: "pack-anti-stress-duo",
  name: "Pack Anti-Stress (Magnésium B6 + Ashwagandha)",
  brand: "ParaTunisie Pack",
  slug: "pack-anti-stress",
  image: "/assets/pack-anti-stress.jpg",
  imageAlt: "Pack Anti-Stress Tunisie — Magnésium B6 + Ashwagandha BioTechUSA",
  priceMillimes: 159000,
  regularPriceMillimes: 184000,
  benefit: "Duo bien-être complet : Magnésium B6 90 comp + Ashwagandha 60 gél. Économisez 25 DT.",
  inStock: true,
};

const DEFAULT_RELAX_OTHERS: RelaxProductData[] = [
  {
    id: "cmtadbh9h0050uqi0a64r4w3r",
    name: "Ashwagandha BioTechUSA 60 Gélules",
    brand: "BioTechUSA",
    slug: "ashwagandha-60-gelules-biotech-usa",
    image: "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp",
    priceMillimes: 95000,
    inStock: true,
  },
  {
    id: "magnesium-vit-b6-musclecare",
    name: "Magnésium + Vitamine B6 90 Comprimés",
    brand: "Muscle Care",
    slug: "magnesium-vitamin-b6-90-tablets",
    image: "/uploads/products/magnesium-vitamin-b6-90-tablets-4a8b69cd.webp",
    priceMillimes: 89000,
    inStock: true,
  },
  {
    id: "magnesium-calcium-vit-b6",
    name: "Magnesium + Calcium + Vit B6 90 tabs",
    brand: "Muscle Care",
    slug: "magnesium-calcium-vitamin-b6-90-tablet-muscle-care",
    image: "/uploads/products/magnesium-calcium-vitamin-b6-90-tablet-muscle-care-82781382.webp",
    priceMillimes: 99000,
    inStock: true,
  },
];

export function RelaxSidePanel({
  main = DEFAULT_RELAX_MAIN,
  others = DEFAULT_RELAX_OTHERS,
}: {
  main?: RelaxProductData;
  others?: RelaxProductData[];
}) {
  const discountPercent = main.regularPriceMillimes && main.regularPriceMillimes > main.priceMillimes
    ? Math.round(((main.regularPriceMillimes - main.priceMillimes) / main.regularPriceMillimes) * 100)
    : 14;

  const isPack = main.slug === "pack-anti-stress";

  const productForAction: ProductSummary = {
    id: main.id,
    name: main.name,
    brand: main.brand,
    brandSlug: main.brand.toLowerCase().replace(/\s+/g, "-"),
    slug: main.slug,
    image: main.image,
    priceMillimes: main.priceMillimes,
    regularPriceMillimes: main.regularPriceMillimes,
    benefit: main.benefit || "Gestion du stress, vitalité et sommeil réparateur",
    size: isPack ? "Pack Duo" : "60 gélules",
    category: "Bien-être",
    categorySlug: "bien-etre",
    concerns: ["Stress", "Sommeil", "Vitalité"],
    skinTypes: [],
    description: main.benefit || "",
    benefits: ["Réduit le stress et la fatigue", "Améliore la qualité du sommeil", "Soutient la vitalité naturelle"],
    usage: isPack ? "1 gélule le matin, 1 à 2 comprimés le soir" : "1 gélule par jour avec un verre d'eau",
    sizes: [{ label: isPack ? "Pack Duo" : "Format standard", priceMillimes: main.priceMillimes }],
    routineTime: ["AM", "PM"],
    inStock: main.inStock !== false,
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-900/15 bg-white shadow-[0_20px_50px_-25px_rgba(16,185,129,0.25)]">
      {/* ── Header: À LA UNE RELAX ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-emerald-900/10 bg-[#F4F9F5] px-5 py-3">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
          <Leaf size={15} className="text-emerald-600 fill-emerald-600" aria-hidden />
          <span>À LA UNE RELAX</span>
        </div>
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-emerald-900/70">
          SOMMEIL &amp; STRESS
        </span>
      </div>

      {/* ── Main Featured Relax Product Card ────────────────────────────── */}
      <FeaturedImpression product={productForAction}>
        <div className="p-3.5 sm:p-5">
          {/* Image Container with Badges */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#F2F8F4] to-[#E5F1E8] p-2.5 sm:p-3">
            {/* Discount Badge */}
            <span className="absolute start-2.5 top-2.5 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[0.625rem] font-bold text-white shadow-2xs">
              -{discountPercent}%
            </span>

            {/* Special Pack Badge */}
            {isPack && (
              <span className="absolute start-14 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[#8B263E] px-2 py-0.5 text-[0.625rem] font-black text-white shadow-2xs">
                <Flame size={11} className="fill-white" />
                PACK DUO
              </span>
            )}

            {/* Wishlist Heart */}
            <button
              type="button"
              aria-label="Ajouter aux favoris"
              className="absolute end-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink-muted shadow-2xs hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <Heart size={14} />
            </button>

            {/* Main Product Image */}
            <Link
              href={isPack ? "/pack-anti-stress" : `/produits/${main.slug}`}
              aria-label={`Voir ${main.name}`}
              className="group relative block size-full"
            >
              <Image
                src={main.image}
                alt={main.imageAlt || `${main.name} — ${main.brand}`}
                fill
                sizes="360px"
                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
            </Link>
          </div>

          {/* Brand */}
          <p className="mt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-emerald-800/80">
            {main.brand}
          </p>

          {/* Product Title */}
          <h3 className="mt-0.5 line-clamp-1 text-base font-bold text-ink">
            <Link
              href={isPack ? "/pack-anti-stress" : `/produits/${main.slug}`}
              className="hover:text-emerald-800 transition-colors"
            >
              {main.name}
            </Link>
          </h3>

          {/* Benefit Subtitle */}
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted leading-relaxed">
            {main.benefit}
          </p>

          {/* Star Rating */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[0.6875rem] font-medium text-ink-muted">(98 avis)</span>
          </div>

          {/* Price & Stock Availability */}
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-xl sm:text-2xl font-black tracking-tight text-emerald-900">
                {formatPrice(main.priceMillimes)}
              </span>
              {main.regularPriceMillimes && (
                <span className="font-tabular text-xs text-ink-muted/70 line-through">
                  {formatPrice(main.regularPriceMillimes)}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              En stock
            </span>
          </div>

          {/* Add to Cart or Order Pack CTA */}
          <div className="mt-4">
            {isPack ? (
              <Link
                href="/pack-anti-stress"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8B263E] hover:bg-[#5E203C] text-white py-3 px-4 font-black text-sm shadow-md transition-all active:scale-95"
              >
                <span>Commander le Pack (159 DT)</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <FeaturedActions product={productForAction} buyLabel="Ajouter au panier" compact />
            )}
          </div>
        </div>
      </FeaturedImpression>

      {/* ── 3 Smaller Relax / Magnesium Products ─────────────────────────── */}
      {others.length > 0 && (
        <ul className="mt-auto border-t border-emerald-900/10 divide-y divide-emerald-900/10 bg-white">
          {others.map((p) => (
            <li key={p.id}>
              <Link
                href={`/produits/${p.slug}`}
                className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-emerald-50/50"
              >
                {/* Thumbnail */}
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#F4F9F5] p-1 border border-emerald-900/10">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="48px"
                    className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                </span>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-ink group-hover:text-emerald-800 transition-colors">
                    {p.name}
                  </p>
                  <p className="mt-0.5 font-tabular text-xs font-bold text-emerald-800">
                    {formatPrice(p.priceMillimes)}
                  </p>
                </div>

                <ChevronRight
                  size={15}
                  className="shrink-0 text-emerald-700/60 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ── Footer Link: Voir toute la boutique ─────────────────────────── */}
      <Link
        href="/bien-etre"
        className="flex items-center justify-center gap-1.5 border-t border-emerald-900/10 bg-[#F4F9F5] px-4 py-3 text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline transition-colors"
      >
        <span>Voir la gamme Bien-être &amp; Sommeil</span>
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
