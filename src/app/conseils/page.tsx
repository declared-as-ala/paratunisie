import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Zap,
  Target,
  Flame,
  HeartPulse,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";
import { articles, articleCategories, type Article } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Conseils Nutrition, Sport & Bien-être en Tunisie | ParaTunisie",
  description:
    "Guides pratiques et comparatifs d'experts pour mieux comprendre la créatine, la whey, les vitamines et les compléments alimentaires en Tunisie.",
  alternates: { canonical: "/conseils" },
  openGraph: {
    type: "website",
    title: "Conseils Nutrition, Sport & Bien-être | ParaTunisie",
    description:
      "Guides d'experts, comparatifs de créatines, protéines, pre-workouts et vitamines disponibles en Tunisie.",
    url: "/conseils",
  },
};

const OBJECTIVES = [
  {
    title: "Force & Puissance Musculaire",
    description: "Tout sur la créatine monohydrate, les dosages et le timing de prise.",
    icon: Dumbbell,
    link: "/conseils/meilleure-creatine-tunisie",
    category: "Créatine",
    badge: "Top Recherche",
  },
  {
    title: "Prise de Masse & Poids",
    description: "Stratégies nutritionnelles, comparatif Whey vs Gainer et surplus calorique.",
    icon: Target,
    link: "/conseils/prise-de-masse-tunisie-guide",
    category: "Protéines & Masse",
    badge: "Guide Pilier",
  },
  {
    title: "Énergie & Performance Pré-Séance",
    description: "Choisir son booster pre-workout, citrulline et bêta-alanine.",
    icon: Zap,
    link: "/conseils/meilleur-pre-workout-tunisie",
    category: "Performance",
    badge: "Boost & Pump",
  },
  {
    title: "Sèche & Définition",
    description: "Rôle de la L-Carnitine, des brûleurs thermogéniques et déficit calorique.",
    icon: Flame,
    link: "/conseils/l-carnitine-perte-graisse",
    category: "Sèche & Minceur",
    badge: "Minceur & Cardio",
  },
  {
    title: "Santé, Vitalité & Sommeil",
    description: "Ashwagandha, Vitamine D3+K2, Zinc, Oméga 3 et Multivitamines.",
    icon: HeartPulse,
    link: "/conseils/ashwagandha-tunisie-guide",
    category: "Bien-être",
    badge: "Micronutrition",
  },
  {
    title: "Guide Débutant Musculation",
    description: "Par quoi commencer ? Les bases de l'alimentation et les 3 compléments essentiels.",
    icon: BookOpen,
    link: "/conseils/complements-musculation-debutant",
    category: "Débutants",
    badge: "Spécial Démarrage",
  },
];

const COMMERCIAL_HUBS = [
  { name: "Créatine", url: "/creatine", count: "Toutes marques" },
  { name: "Whey Protéine", url: "/whey-proteine", count: "Isolate & Concentré" },
  { name: "Mass Gainers", url: "/gainers", count: "Haute calorie" },
  { name: "Pre-Workout", url: "/pre-workout", count: "Boosters & Pump" },
  { name: "BCAA & Acides Aminés", url: "/bcaa-acides-amines", count: "EAA, BCAA, Citrulline" },
  { name: "Ashwagandha", url: "/ashwagandha", count: "Adaptogènes purs" },
  { name: "Vitamines & Minéraux", url: "/vitamines-mineraux", count: "D3, Zinc, Multi" },
  { name: "Brûleurs de Graisse", url: "/bruleurs-de-graisse", count: "Sèche & Minceur" },
];

export default function ConseilsHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ cat?: string }>;
}) {
  const featuredArticles = articles.filter((a) =>
    [
      "meilleure-creatine-tunisie",
      "prise-de-masse-tunisie-guide",
      "complements-musculation-debutant",
      "meilleur-pre-workout-tunisie",
    ].includes(a.slug),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-white p-8 sm:p-12 lg:p-16 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4 backdrop-blur-xs">
            <Sparkles className="size-3.5" />
            Centre de Ressources & Nutrition Sportive
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
            Conseils Nutrition, Sport & Bien-être
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted">
            Guides pratiques, comparatifs impartiaux et conseils fondés sur la science pour mieux comprendre la créatine, les protéines, les vitamines et les compléments alimentaires disponibles en Tunisie.
          </p>

          {/* Quick Stats / Trust */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-ink font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Articles 100% rédigés par notre équipe</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Produits réels du catalogue tunisien</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-amber-600" />
              <span>Sources scientifiques référencées</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Objectives Selector ── */}
      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Explorez par Objectif</h2>
            <p className="text-xs text-ink-muted mt-0.5">Accédez directement aux guides adaptés à vos besoins actuels.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OBJECTIVES.map((obj, idx) => {
            const Icon = obj.icon;
            return (
              <Link
                key={idx}
                href={obj.link}
                className="group rounded-2xl border border-border/80 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <span className="rounded-md bg-soft-nude text-ink-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {obj.badge}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-ink group-hover:text-primary transition-colors">
                  {obj.title}
                </h3>
                <p className="mt-1 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {obj.description}
                </p>

                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>Lire le dossier</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Guides (À la Une) ── */}
      <section className="mt-16">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="size-3.5" />
            Sélection de la Rédaction
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink">Guides Piliers & Incontournables</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredArticles.map((art) => (
            <article
              key={art.slug}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1">
                    <Clock className="size-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
                </h3>

                <p className="mt-2 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <Link
                  href={`/conseils/${art.slug}`}
                  className="font-semibold text-xs text-primary inline-flex items-center gap-1 group-hover:underline"
                >
                  Découvrir le guide
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Complete Articles Grid (Tous nos 20 guides) ── */}
      <section className="mt-16">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Tous Nos Guides & Articles ({articles.length})</h2>
            <p className="text-xs text-ink-muted mt-0.5">Explorez l&apos;ensemble de nos dossiers thématiques classés par catégorie.</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((art) => (
            <article
              key={art.slug}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1">
                    <Clock className="size-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
                </h3>

                <p className="mt-2 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-ink-muted">
                  {new Date(art.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <Link
                  href={`/conseils/${art.slug}`}
                  className="font-semibold text-primary inline-flex items-center gap-1 group-hover:underline"
                >
                  Lire l&apos;article
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Commercial Category Rails ── */}
      <section className="mt-20 rounded-3xl border border-border/80 bg-soft-nude/40 p-8 sm:p-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="font-serif text-2xl font-bold text-ink">Boutique & Produits Authentiques</h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted">
            Commandez directement vos créatines, protéines et vitamines sur ParaTunisie avec livraison express sur toute la Tunisie.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COMMERCIAL_HUBS.map((hub) => (
            <Link
              key={hub.url}
              href={hub.url}
              className="flex items-center justify-between rounded-xl bg-white border border-border/70 p-4 shadow-xs hover:border-primary hover:text-primary transition-colors group"
            >
              <div>
                <p className="font-bold text-sm text-ink group-hover:text-primary">{hub.name}</p>
                <p className="text-[11px] text-ink-muted">{hub.count}</p>
              </div>
              <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
