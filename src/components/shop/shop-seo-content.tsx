import Link from "next/link";

/**
 * Single source of truth for the Shop FAQ — rendered here AND used to build
 * the FAQPage JSON-LD in shop/page.tsx, so the two can never drift
 * (CLAUDE.md §6: structured data generated from the same data that renders
 * the visible page). Only real, verifiable ParaTunisie facts — no invented
 * delivery/payment promises (CLAUDE.md §20).
 */
export const SHOP_FAQ: { question: string; answer: string }[] = [
  {
    question: "Quels produits peut-on trouver sur ParaTunisie ?",
    answer:
      "ParaTunisie propose une sélection de soins visage, corps et cheveux, de protections solaires, de produits d'hygiène, d'articles bébé & maman ainsi que des compléments alimentaires, organisés par marque, catégorie et besoin.",
  },
  {
    question: "Comment choisir un soin adapté à ma peau ou à mes besoins ?",
    answer:
      "Utilisez les filtres du Shop pour affiner par catégorie ou par marque, ou passez par notre diagnostic en ligne qui vous oriente vers une sélection de produits adaptés à votre routine.",
  },
  {
    question: "Quels produits solaires sont disponibles ?",
    answer:
      "Retrouvez nos protections solaires visage et corps pour tous types de peau dans la catégorie Solaire, filtrable directement depuis le Shop.",
  },
  {
    question: "Livrez-vous partout en Tunisie ?",
    answer: "Oui, ParaTunisie livre partout en Tunisie.",
  },
  {
    question: "Comment payer ma commande ?",
    answer: "Le paiement s'effectue à la livraison (paiement à la réception de votre commande).",
  },
  {
    question: "Comment rechercher une marque spécifique sur le Shop ?",
    answer:
      "Utilisez le champ « Rechercher une marque » dans le filtre Marques de la barre latérale, ou consultez la liste complète depuis notre page Marques.",
  },
];

const INTERNAL_LINKS: { label: string; href: string }[] = [
  { label: "Soins du visage", href: "/visage" },
  { label: "Soins du corps", href: "/corps" },
  { label: "Produits capillaires", href: "/cheveux" },
  { label: "Protections solaires", href: "/solaire" },
  { label: "Bébé & Maman", href: "/bebe-maman" },
  { label: "Compléments alimentaires", href: "/complements" },
  { label: "Toutes les marques", href: "/marques" },
];

export function ShopSeoContent() {
  return (
    <section className="border-t border-border bg-brand-blush/25">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {/* ── SEO copy block ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Votre parapharmacie en ligne en Tunisie
            </h2>
            <div className="space-y-4 text-sm leading-7 text-ink-muted sm:text-[0.9375rem]">
              <p>
                ParaTunisie est une parapharmacie en ligne en Tunisie dédiée aux soins authentiques et aux
                marques dermocosmétiques de référence. Notre Shop réunit des produits de parapharmacie Tunisie
                pensés pour toute la famille&nbsp;: soins visage Tunisie pour l&apos;hydratation, l&apos;éclat
                ou les imperfections, soins du corps, produits capillaires, protections solaires, hygiène
                quotidienne, univers bébé &amp; maman et compléments alimentaires.
              </p>
              <p>
                Chaque référence peut être filtrée par catégorie, par marque ou par besoin pour retrouver
                rapidement les produits dermocosmétiques adaptés à votre routine. Que vous cherchiez un soin
                ciblé, une protection solaire au quotidien ou un complément alimentaire, ParaTunisie vous
                accompagne dans le choix de vos produits de parapharmacie en Tunisie, avec une sélection
                actualisée en continu et une livraison partout dans le pays.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {INTERNAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────── */}
          <div>
            <h2 className="font-serif text-xl font-bold text-ink sm:text-2xl">Questions fréquentes</h2>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-white">
              {SHOP_FAQ.map((item) => (
                <details key={item.question} className="group px-4 py-3.5 first:rounded-t-2xl last:rounded-b-2xl open:bg-soft-nude/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink marker:content-none">
                    <span>{item.question}</span>
                    <span className="shrink-0 text-lg font-normal leading-none text-primary transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-xs leading-6 text-ink-muted sm:text-sm">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
