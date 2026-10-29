import { CreditCard, Headset, ShieldCheck, Truck } from "lucide-react";
import { phoneHref } from "@/lib/contact";

const TRUST_ITEMS = [
  { icon: Truck, title: "Livraison partout en Tunisie", text: "Express 24 à 48h" },
  { icon: CreditCard, title: "Paiement sécurisé", text: "Carte, ou à la livraison" },
  { icon: ShieldCheck, title: "Produits authentiques", text: "Marques officielles" },
  { icon: Headset, title: "Une question ?", text: "Appelez au 97 991 266", href: phoneHref },
] as const;

/**
 * 4-card reassurance strip with soft pill cards matching reference image.
 */
export function HomeTrustStrip() {
  return (
    <section aria-label="Engagements et garanties ParaTunisie" className="bg-[#FAF7F5] py-4 sm:py-6">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, text, ...rest }) => {
            const href = "href" in rest ? rest.href : undefined;
            const content = (
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-border/70 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={20} aria-hidden />
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-xs sm:text-sm font-bold text-ink">{title}</span>
                  <span className="block truncate text-[0.6875rem] sm:text-xs text-ink-muted mt-0.5">{text}</span>
                </div>
              </div>
            );

            return href ? (
              <a key={title} href={href} className="block transition-transform hover:-translate-y-0.5">
                {content}
              </a>
            ) : (
              <div key={title} className="transition-transform hover:-translate-y-0.5">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
