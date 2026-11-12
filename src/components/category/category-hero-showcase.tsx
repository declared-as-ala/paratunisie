import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Headphones, ShieldCheck, Truck, Zap, Activity, Dumbbell, Sparkles } from "lucide-react";
import { formatPrice, type ProductSummary } from "@/lib/data/products";

interface CategoryHeroShowcaseProps {
  title: string;
  description: string;
  featuredProduct?: ProductSummary | null;
  categorySlug: string;
}

export function CategoryHeroShowcase({
  title,
  description,
  featuredProduct,
  categorySlug,
}: CategoryHeroShowcaseProps) {
  // Category-specific benefits for the right card
  const isCreatine = categorySlug.includes("creatine");
  const isWhey = categorySlug.includes("whey") || categorySlug.includes("proteine");
  const isBienEtre = categorySlug.includes("bien-etre") || categorySlug.includes("ashwagandha") || categorySlug.includes("magnesium") || categorySlug.includes("sommeil");

  const benefit1 = isCreatine ? "Force augmentée" : isWhey ? "Prise de muscle sec" : isBienEtre ? "Stress & Cortisol réduit" : "Efficacité prouvée";
  const benefit2 = isCreatine ? "Meilleure récupération" : isWhey ? "Récupération rapide" : isBienEtre ? "Sommeil profond réparateur" : "Absorption optimale";
  const benefit3 = isCreatine ? "Prise de masse musculaire" : isWhey ? "Maintien de la masse" : isBienEtre ? "Vitalité & Énergie durable" : "Qualité certifiée";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_470px] gap-6 lg:gap-8 items-stretch pt-2 pb-6">
      
      {/* ── LEFT: Title, Description & Trust Badges ─────────────────── */}
      <div className="flex flex-col justify-between py-2">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
            {title}
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-base leading-relaxed text-ink-muted max-w-2xl">
            {description}
          </p>
        </div>

        {/* 4 Trust Badges Horizontal Strip */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-border/70 flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-semibold text-ink/80">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 border border-border/80 shadow-2xs">
            <Award size={14} className="text-primary shrink-0" />
            <span>Grandes marques reconnues</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 border border-border/80 shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Produits 100% authentiques</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 border border-border/80 shadow-2xs">
            <Headphones size={14} className="text-primary shrink-0" />
            <span>Conseils d&apos;experts à votre écoute</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 border border-border/80 shadow-2xs">
            <Truck size={14} className="text-primary shrink-0" />
            <span>Livraison 24-48h dans toute la Tunisie</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Promotional Featured Card ("À LA UNE") ───────────── */}
      {featuredProduct && (
        <aside aria-label="Produit à la une" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF5F2] via-[#F5EDE8] to-[#EFE3DC] p-5 sm:p-6 border border-border/80 shadow-[0_15px_35px_-20px_rgba(94,32,60,0.2)] flex flex-col justify-between">
          {/* Top Row: Pill Tag */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs">
              <Sparkles size={12} />
              <span>À LA UNE</span>
            </span>

            <span className="text-[10px] uppercase tracking-wider font-bold text-ink-muted/80">
              {featuredProduct.brand}
            </span>
          </div>

          {/* Middle Body: Headline, Image & Benefit Badges */}
          <div className="grid grid-cols-[1fr_auto] gap-4 items-center my-3 sm:my-4">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-ink line-clamp-2 leading-snug">
                {featuredProduct.name}
              </h2>

              <p className="mt-1 text-xs text-ink-muted line-clamp-1 font-medium">
                Qualité premium • Résultats prouvés
              </p>

              <div className="mt-3 font-tabular text-xl sm:text-2xl font-black text-primary">
                {formatPrice(featuredProduct.priceMillimes)}
              </div>

              <div className="mt-4">
                <Link
                  href={`/produits/${featuredProduct.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Découvrir maintenant</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Product Image & Benefit Badges Stack */}
            <div className="relative flex items-center gap-3">
              <div className="relative size-32 sm:size-36 shrink-0">
                <Image
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  fill
                  priority
                  sizes="160px"
                  className="object-contain mix-blend-multiply"
                />
              </div>

              {/* 3 Benefit Badges (hidden on extra small screens) */}
              <div className="hidden sm:flex flex-col gap-2 text-[10px] font-bold text-ink/80">
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/60 shadow-2xs">
                  <Zap size={12} className="text-amber-500 shrink-0" />
                  <span>{benefit1}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/60 shadow-2xs">
                  <Activity size={12} className="text-emerald-500 shrink-0" />
                  <span>{benefit2}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/60 shadow-2xs">
                  <Dumbbell size={12} className="text-primary shrink-0" />
                  <span>{benefit3}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

    </div>
  );
}
