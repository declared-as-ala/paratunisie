import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { bestSellers, homeBrands, homeConcerns } from "@/lib/data/home";

const concernTones = {
  blush: "bg-brand-blush",
  nude: "bg-soft-nude",
  ivory: "bg-surface-alt",
  rose: "bg-brand-dusty-rose/25",
} as const;

export function HomeCommerce() {
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl leading-tight font-medium tracking-tight text-ink sm:text-5xl">
            Commencez par votre besoin
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
            Trouvez rapidement les soins adaptés à ce qui compte pour vous
            aujourd&apos;hui.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {homeConcerns.map((concern, index) => (
            <Link
              key={concern.href}
              href={concern.href}
              className={`group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-xl border border-border p-4 transition-transform duration-[var(--duration-standard)] ease-[var(--ease-out-standard)] hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-48 sm:p-5 ${concernTones[concern.tone]} ${index < 2 ? "lg:col-span-2" : ""}`}
            >
              <Image
                src={concern.image}
                alt=""
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 16vw"
                className="object-cover transition-transform duration-[var(--duration-large)] ease-[var(--ease-out-standard)] group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(43,35,38,0.78) 0%, rgba(43,35,38,0.32) 42%, rgba(43,35,38,0.05) 68%, transparent 85%)",
                }}
                aria-hidden="true"
              />
              <span className="relative z-10 text-xs font-medium text-surface-alt/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="relative z-10 flex items-end justify-between gap-3 text-base font-medium text-surface-alt sm:text-lg">
                {concern.label}
                <ArrowUpRight
                  className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-alt py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-8">
          <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
            <Image
              src="/assets/bestsellers-paratunisie.webp"
              alt="Sélection de quatre soins dermocosmétiques"
              fill
              sizes="(max-width: 1023px) 100vw, 58vw"
              className="object-cover"
            />
          </div>

          <div className="lg:ps-6">
            <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
              Les essentiels
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight font-medium tracking-tight text-ink sm:text-5xl">
              Les soins les plus choisis
            </h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {bestSellers.map((product) => (
                <Link
                  key={product.href}
                  href={product.href}
                  className="group grid min-h-20 grid-cols-[1fr_auto] items-center gap-4 py-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span>
                    <span className="block text-xs font-medium tracking-wide text-primary uppercase">
                      {product.brand}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-ink sm:text-base">
                      {product.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm font-medium text-ink">
                    <span className="font-tabular">{product.price}</span>
                    <ArrowUpRight
                      className="size-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/shop"
              className="mt-6 inline-flex min-h-11 items-center gap-2 py-2 text-sm font-medium text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Voir tout le Shop
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-soft-nude py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Nos marques partenaires</h2>
          <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            {homeBrands.map((brand) => (
              <Link
                key={brand}
                href={`/marques/${brand.toLowerCase().replaceAll(" ", "-").replace("è", "e")}`}
                className="flex min-h-24 items-center justify-center px-4 text-center font-serif text-lg font-medium text-ink transition-colors hover:bg-surface-alt hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {brand}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/marques"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Découvrir toutes les marques
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
