import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, ShieldCheck, Truck } from "lucide-react";

import { COMPANY_CONFIG } from "@/lib/config/company";

const HERO_PHOTO = "/assets/hero-athlete.webp";

/** Editorial wellness hero: fitness photo on the left, headline and CTAs on the right. */
export function HomeHero({
  rightAside,
  aside,
}: {
  rightAside?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const actualRightAside = rightAside || aside;

  return (
    <section aria-label="ParaTunisie — nutrition sportive et vitamines" className="bg-background">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div
          className={`grid grid-cols-1 ${
            actualRightAside ? "lg:grid-cols-[1fr_370px] xl:grid-cols-[1fr_400px]" : "grid-cols-1"
          } gap-4 sm:gap-5 items-stretch`}
        >
          {/* ── MAIN HERO PANEL ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-card shadow-[0_30px_70px_-40px_rgba(90,27,61,0.45)] ring-1 ring-border/60 sm:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[300px] bg-primary-soft lg:min-h-[470px]">
              <Image
                src={HERO_PHOTO}
                alt="Sportif souriant avec son shaker et sa serviette après l'entraînement"
                fill
                priority
                quality={90}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 560px"
                className="object-cover object-[50%_20%]"
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-secondary/55 to-transparent" />
              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                Nouvelle façon de prendre soin de soi
              </span>
              <p className="absolute inset-x-5 bottom-5 font-serif text-lg italic leading-snug text-white sm:text-xl">
                Performance, récupération, vitalité.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 px-6 py-8 sm:px-10 sm:py-10 lg:gap-5 lg:px-12 lg:py-9">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Sport · Vitalité · Bien-être</p>
              <h1 className="font-serif text-[2.25rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-[3rem] lg:text-[3.1rem] xl:text-[3.4rem]">
                Prenez soin de votre <span className="italic text-primary">énergie.</span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
                Whey, créatine, vitamines et compléments authentiques, triés par catégorie pour trouver vite ce qu&apos;il vous faut.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary ps-7 pe-6 text-sm font-bold text-primary-foreground shadow-[0_14px_30px_-12px_rgba(233,30,99,0.7)] transition-all hover:bg-primary-hover active:scale-95"
                >
                  Découvrir la sélection
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </Link>
              </div>
              <ul className="mt-1 grid grid-cols-1 gap-3 border-t border-border/70 pt-4 text-xs font-semibold text-ink-muted min-[420px]:grid-cols-3">
                <li className="flex items-center gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Truck className="size-4" aria-hidden /></span>
                  Livraison {COMPANY_CONFIG.deliveryTime.replace(" ouvrables", "")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><ShieldCheck className="size-4" aria-hidden /></span>
                  Produits authentiques
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Banknote className="size-4" aria-hidden /></span>
                  Paiement à la livraison
                </li>
              </ul>
            </div>
          </div>

          {/* ── DESKTOP RIGHT COLUMN: "À LA UNE SPORT" ───────────────── */}
          {actualRightAside && (
            <aside className="hidden lg:flex w-full flex-col" aria-label="Produit du moment nutrition sportive">
              {actualRightAside}
            </aside>
          )}
        </div>

      </div>
    </section>
  );
}
