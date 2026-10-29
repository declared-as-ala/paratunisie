import Link from "next/link";
import { Phone, Mail, Clock, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { whatsappHref } from "@/lib/contact";

const SERVICES_LINKS = [
  { label: "Livraison & suivi", href: "/livraison" },
  { label: "Paiement sécurisé", href: "/paiement" },
  { label: "Retours & remboursements", href: "/retours" },
  { label: "FAQ", href: "/aide" },
  { label: "Nous contacter", href: "/contact" },
];

const ABOUT_LINKS = [
  { label: "Qui sommes-nous ?", href: "/a-propos" },
  { label: "Nos marques", href: "/marques" },
  { label: "Blog & conseils", href: "/conseils" },
  { label: "Conditions générales", href: "/cgv" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
];

const HELP_LINKS = [
  { label: "Guide d'achat", href: "/conseils" },
  { label: "Suivi de commande", href: "/compte" },
  { label: "Mon compte", href: "/compte" },
  { label: "Nos points forts", href: "/authenticite" },
  { label: "Support WhatsApp", href: whatsappHref, external: true },
];

/**
 * Premium Burgundy Footer matching the reference image:
 * Deep burgundy background (#4A122A), 5 structured columns,
 * social icons, contact details, copyright, and payment methods.
 */
export function SiteFooter() {
  return (
    <footer className="bg-[#4A122A] text-white pt-12 sm:pt-16 pb-8 border-t border-white/10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        
        {/* ── 5 Main Columns Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-white/15">
          
          {/* Column 1: Brand & Socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block brightness-0 invert">
              <Logo size="header" />
            </Link>
            <p className="mt-2 text-xs font-semibold text-white/95">
              Parapharmacie &amp; Nutrition Sportive en Tunisie
            </p>
            <p className="mt-3 text-xs text-white/70 leading-relaxed">
              Votre spécialiste en compléments alimentaires, nutrition sportive, vitamines et bien-être. Des produits authentiques, livrés partout en Tunisie.
            </p>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-2.5">
              {/* Facebook */}
              <a
                href="https://facebook.com/paratunisie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook ParaTunisie"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <span className="font-bold text-xs">f</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/paratunisie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram ParaTunisie"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <span className="font-bold text-xs">ig</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube ParaTunisie"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <span className="font-bold text-xs">yt</span>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok ParaTunisie"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <span className="font-bold text-xs">tk</span>
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              {SERVICES_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white hover:underline transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: À propos */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              À propos
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white hover:underline transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Aide */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Aide
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                    >
                      <MessageCircle size={13} />
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link href={link.href} className="hover:text-white hover:underline transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-xs text-white/80">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-white/70 shrink-0" />
                <a href="tel:+21697991266" className="hover:text-white transition-colors font-bold text-white/95">
                  +216 97 991 266
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-white/70 shrink-0" />
                <a href="mailto:contact@paratunisie.com" className="hover:text-white transition-colors">
                  contact@paratunisie.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={14} className="text-white/70 shrink-0" />
                <span>Lun - Sam : 9h à 18h</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="text-white/70 shrink-0" />
                <span>Tunisie</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar: Copyright & Payment Badges ──────────────────────── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>© {new Date().getFullYear()} ParaTunisie. Tous droits réservés.</p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-white px-2 py-1 text-[10px] font-bold text-[#4A122A] shadow-2xs">
              VISA
            </span>
            <span className="rounded bg-white px-2 py-1 text-[10px] font-bold text-[#4A122A] shadow-2xs">
              Mastercard
            </span>
            <span className="rounded bg-white px-2 py-1 text-[10px] font-bold text-[#4A122A] shadow-2xs">
              Konnect
            </span>
            <span className="rounded bg-white/20 border border-white/30 px-2 py-1 text-[10px] font-semibold text-white">
              Paiement à la livraison
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
