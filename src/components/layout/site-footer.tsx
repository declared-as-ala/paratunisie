import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { hasConfiguredWhatsApp, whatsappHref } from "@/lib/contact";
import { Logo } from "@/components/layout/logo";

import {
  primaryCategories,
  featuredBrands,
  secondaryNav,
} from "@/lib/data/navigation";

const CUSTOMER_SERVICE = [
  { label: "Livraison", href: "/livraison" },
  { label: "Retours & remboursements", href: "/retours" },
  { label: "Authenticité des produits", href: "/authenticite" },
  { label: "Paiement à la livraison", href: "/paiement" },
  { label: "FAQ & Aide", href: "/aide" },
  { label: "Contact", href: "/contact" },
];

const LEGAL = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions générales de vente", href: "/cgv" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-6 lg:gap-x-8">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-xs sm:text-sm text-ink-muted leading-relaxed">
              ParaTunisie est une plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires, le bien-être et une sélection de produits de parapharmacie.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={whatsappHref}
                aria-label={
                  hasConfiguredWhatsApp
                    ? "Contacter ParaTunisie sur WhatsApp"
                    : "Ouvrir le centre d'aide ParaTunisie"
                }
                className="flex size-11 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="size-5" aria-hidden />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Catégories"
            items={primaryCategories.map((c) => ({
              label: c.label,
              href: c.href,
            }))}
          />
          <FooterColumn
            title="Marques"
            items={[...featuredBrands, { label: "Toutes les marques", href: "/marques" }]}
          />
          <FooterColumn title="Service client" items={CUSTOMER_SERVICE} />
          <FooterColumn
            title="Découvrir"
            items={secondaryNav}
          />
        </div>

        <div className="mt-12 border-t border-border pt-6 sm:mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-muted">
              © {new Date().getFullYear()} ParaTunisie. Tous droits réservés.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-ink-muted hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-medium text-ink">{title}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-ink-muted hover:text-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
