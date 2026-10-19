import { Banknote, Headset, ShieldCheck, Truck } from "lucide-react";
import { phoneHref } from "@/lib/contact";

const items = [
  { icon: Truck, title: "Livraison partout en Tunisie", text: "Offerte dès 99 DT" },
  { icon: Banknote, title: "Paiement à la livraison", text: "Payez à la réception" },
  { icon: ShieldCheck, title: "Produits authentiques", text: "Marques officielles" },
  { icon: Headset, title: "Une question ?", text: "Appelez-nous ou WhatsApp", href: phoneHref },
] as const;

/** Compact commercial reassurance strip — only claims that are true site-wide policies. */
export function HomeTrustStrip() {
  return (
    <section aria-label="Nos engagements" className="border-y border-border/60 bg-white">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-border/50 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text, ...rest }) => {
          const href = "href" in rest ? rest.href : undefined;
          const body = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.8125rem] font-bold text-ink sm:text-sm">{title}</span>
                <span className="block truncate text-[0.6875rem] text-ink-muted sm:text-xs">{text}</span>
              </span>
            </>
          );
          return (
            <li key={title} className="bg-white">
              {href ? (
                <a href={href} className="flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-soft-nude/50 sm:px-6 sm:py-4">{body}</a>
              ) : (
                <div className="flex items-center gap-3 px-3 py-3.5 sm:px-6 sm:py-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
