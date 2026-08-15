import Image from "next/image";
import { Check, ShieldCheck, Sparkles, Truck } from "lucide-react";

const highlights = [
  { icon: Truck, label: "Suivi des commandes" },
  { icon: Sparkles, label: "Conseils personnalisés" },
  { icon: ShieldCheck, label: "Données protégées" },
];

interface AccountAuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AccountAuthShell({
  eyebrow,
  title,
  description,
  children,
}: AccountAuthShellProps) {
  return (
    <div className="relative overflow-hidden bg-background px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <div aria-hidden="true" className="absolute -left-32 top-1/3 size-80 rounded-full bg-primary-soft/45 blur-3xl" />
      <div className="relative mx-auto grid min-h-[42rem] max-w-[1280px] overflow-hidden rounded-[1.75rem] border border-border bg-surface-alt shadow-[0_24px_80px_rgba(74,43,55,0.10)] lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <section className="flex items-center px-5 py-9 sm:px-10 sm:py-12 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[29rem]">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 font-serif text-lg italic text-primary">
                P
              </div>
              <div>
                <p className="font-serif text-lg leading-none text-ink">ParaTunisie</p>
                <p className="mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                  Espace personnel
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </p>
              <h1 className="max-w-md font-serif text-[2.25rem] font-medium leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.75rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
                {description}
              </p>
            </div>

            {children}

            <div className="mt-8 grid gap-2 border-t border-border pt-6 sm:grid-cols-3 lg:hidden">
              {highlights.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                  <item.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="relative hidden min-h-[42rem] overflow-hidden lg:block" aria-label="Les avantages de votre compte">
          <Image
            src="/assets/hero-paratunisie.webp"
            alt="Conseil dermocosmétique ParaTunisie"
            fill
            priority
            sizes="(max-width: 1023px) 0px, 53vw"
            className="object-cover object-[58%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,35,38,0.03)_20%,rgba(43,35,38,0.78)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-12">
            <p className="max-w-md font-serif text-3xl leading-tight tracking-[-0.02em]">
              Votre beauté, vos préférences, votre espace.
            </p>
            <div className="mt-7 grid gap-3">
              {highlights.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <span className="flex size-7 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-sm">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
