import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, RefreshCw, TrendingUp, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

interface CategoryReassuranceProps {
  categoryName: string;
  categorySlug: string;
}

export function CategoryReassurance({
  categoryName,
  categorySlug,
}: CategoryReassuranceProps) {
  const isCreatine = categorySlug.includes("creatine");
  const isWhey = categorySlug.includes("whey") || categorySlug.includes("proteine");
  const isBienEtre = categorySlug.includes("bien-etre") || categorySlug.includes("ashwagandha") || categorySlug.includes("magnesium") || categorySlug.includes("sommeil");

  const title = isCreatine
    ? "Pourquoi choisir la créatine ?"
    : isWhey
    ? "Pourquoi choisir la whey protéine ?"
    : isBienEtre
    ? "Pourquoi choisir nos compléments bien-être ?"
    : `Pourquoi choisir ${categoryName} ?`;

  const description = isCreatine
    ? "La créatine est l'un des compléments alimentaires les plus étudiés et les plus efficaces pour améliorer la force, la performance et la récupération musculaire. Idéale pour la prise de masse et l'entraînement intensif."
    : isWhey
    ? "La whey protéine fournit un profil d'acides aminés complet et une absorption rapide pour construire et réparer les fibres musculaires après l'entraînement."
    : isBienEtre
    ? "L'Ashwagandha et le Magnésium agissent en synergie pour réguler le cortisol, réduire l'anxiété et rétablir des cycles de sommeil profonds et réparateurs."
    : "Sélectionnés auprès des plus grands laboratoires internationaux, nos compléments vous garantissent pureté, traçabilité et efficacité maximale.";

  const item1Text = isCreatine ? "Plus de force et d'énergie" : isBienEtre ? "Anti-stress & Moins de cortisol" : "Énergie et performance";
  const item2Text = isCreatine ? "Meilleure récupération" : isBienEtre ? "Sommeil profond réparateur" : "Récupération musculaire";
  const item3Text = isCreatine ? "Augmentation de la masse musculaire" : isBienEtre ? "Équilibre nerveux et vitalité" : "Développement musculaire";

  return (
    <section aria-label="Pourquoi choisir ce produit" className="my-10 sm:my-14 overflow-hidden rounded-3xl bg-[#FAF5F2] border border-border/80 shadow-xs p-6 sm:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_280px] gap-8 items-center">
        
        {/* ── Left Column: Headline & Description ─────────────────────── */}
        <div className="max-w-xl">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-tight">
            {title}
          </h2>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-ink-muted">
            {description}
          </p>

          <div className="mt-5 sm:mt-6">
            <Link
              href="/conseils"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>En savoir plus</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ── Center Column: 3 Circular Benefit Badges ────────────────── */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6 justify-center">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary border border-border/70 shadow-2xs">
              <Zap size={18} className="text-amber-500" />
            </span>
            <span className="text-xs font-bold text-ink">
              {item1Text}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary border border-border/70 shadow-2xs">
              <RefreshCw size={18} className="text-emerald-600" />
            </span>
            <span className="text-xs font-bold text-ink">
              {item2Text}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary border border-border/70 shadow-2xs">
              <TrendingUp size={18} className="text-primary" />
            </span>
            <span className="text-xs font-bold text-ink">
              {item3Text}
            </span>
          </div>
        </div>

        {/* ── Right Column: Fitness Athlete Image ─────────────────────── */}
        <div className="relative h-56 sm:h-64 lg:h-72 w-full rounded-2xl overflow-hidden shadow-xs hidden sm:block">
          <Image
            src="/assets/fitness-athlete-shaker.webp"
            alt="Nutrition et bien-être ParaTunisie"
            fill
            sizes="300px"
            className="object-cover object-center"
          />
        </div>

      </div>
    </section>
  );
}
