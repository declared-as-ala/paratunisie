import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, MapPin, Phone, Send } from "lucide-react";
import { phoneHref, phoneNumber, whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contactez-nous — ParaTunisie",
  description: "Contactez l'équipe de conseil et de service client ParaTunisie par téléphone ou WhatsApp.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Contact</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Contactez ParaTunisie</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Une question sur un produit dermo-cosmétique ou le suivi de votre commande ? Notre équipe est à votre écoute.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Assistance WhatsApp</h2>
                  <p className="text-xs text-ink-muted">Conseil personnalisé immédiat</p>
                </div>
              </div>
              <a
                href={whatsappHref}
                className="mt-3 inline-flex items-center justify-center w-full rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5 gap-2 hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle size={16} />
                Ouvrir WhatsApp
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Téléphone</h2>
                  <p className="text-xs text-ink-muted">Appelez-nous directement</p>
                </div>
              </div>
              <a
                href={phoneHref}
                className="mt-3 inline-flex items-center justify-center w-full rounded-xl bg-primary text-white text-xs font-bold py-2.5 gap-2 hover:bg-primary/90 transition-colors"
              >
                <Phone size={16} />
                {phoneNumber}
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Zone de service</h2>
                  <p className="text-xs text-ink-muted">Livraison sur les 24 gouvernorats (Tunisie)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Envoyez-nous un message</h2>
            <form action="#" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Nom complet</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="w-full h-10 rounded-xl border border-border px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Téléphone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+216 00 000 000"
                  className="w-full h-10 rounded-xl border border-border px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Votre message</label>
                <textarea
                  rows={4}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full rounded-xl border border-border p-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Send size={14} /> Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
