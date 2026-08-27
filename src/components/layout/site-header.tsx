"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Phone, ShoppingBag, User, MessageCircle, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScrolled } from "@/hooks/use-scrolled";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";
import { Logo } from "@/components/layout/logo";
import { SearchOverlay } from "@/components/layout/navigation/search-overlay";
import { MegaMenu } from "@/components/layout/navigation/mega-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { phoneHref, phoneNumber, whatsappHref } from "@/lib/contact";

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-2xs">
      {/* ── ROW 1: Thin Announcement & Contact Bar ────────────────────── */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-7 sm:h-8 max-w-[1440px] items-center justify-between gap-4 px-4 text-[0.6875rem] sm:text-xs font-medium tracking-wide">
          <div className="flex min-w-0 items-center gap-4 overflow-hidden">
            <a href={phoneHref} className="flex shrink-0 items-center gap-1 hover:underline">
              <Phone size={11} aria-hidden />
              <span>{phoneNumber}</span>
            </a>
            <span className="hidden md:inline opacity-60">|</span>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex shrink-0 items-center gap-1 text-emerald-300 hover:underline"
            >
              <MessageCircle size={11} aria-hidden />
              <span>WhatsApp</span>
            </a>
            <span className="hidden lg:inline opacity-60">|</span>
            <span className="hidden lg:flex items-center gap-1 opacity-90">
              <MapPin size={11} aria-hidden />
              <span>Livraison partout en Tunisie</span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 font-bold">
            <span>Livraison offerte dès 99 DT</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Main Header Bar (Logo + Large Search + Actions) ───── */}
      <div className="border-b border-border/70">
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-[padding] duration-200 ${
            scrolled ? "py-1.5" : "py-2 sm:py-3"
          }`}
        >
          {/* Left: ParaTunisie Logo */}
          <Link href="/" aria-label="ParaTunisie — Accueil" className="shrink-0">
            <Logo />
          </Link>

          {/* Center: Large Search Field (Desktop lg+) */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-4">
            <SearchOverlay variant="full" />
          </div>

          {/* Right: Actions Icons with Labels (Compte, Favoris, Panier) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Mobile Search Trigger Icon */}
            <div className="lg:hidden">
              <SearchOverlay variant="icon" />
            </div>

            {/* Compte */}
            <Link
              href="/compte"
              aria-label="Mon compte"
              className="hidden sm:flex flex-col items-center justify-center text-ink hover:text-primary transition-colors group p-1"
            >
              <User size={20} className="group-hover:scale-105 transition-transform" />
              <span className="text-[0.6875rem] font-medium mt-0.5">Compte</span>
            </Link>

            {/* Favoris */}
            <Link
              href="/favoris"
              aria-label="Favoris"
              className="hidden sm:flex flex-col items-center justify-center text-ink hover:text-primary transition-colors group relative p-1"
            >
              <div className="relative">
                <Heart size={20} className="group-hover:scale-105 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.55rem] font-extrabold text-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[0.6875rem] font-medium mt-0.5">Favoris</span>
            </Link>

            {/* Panier Button / Trigger */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Panier${itemCount > 0 ? ` — ${itemCount} article${itemCount === 1 ? "" : "s"}` : ""}`}
              className="flex flex-col items-center justify-center text-ink hover:text-primary transition-colors group relative p-1"
            >
              <div className="relative">
                <ShoppingBag size={20} className="group-hover:scale-105 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-white shadow-2xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[0.6875rem] font-medium mt-0.5">Panier</span>
            </button>
          </div>
        </div>

        {/* ── ROW 3: Desktop Mega Menu Navigation (lg+) ───────────────── */}
        <div className="hidden lg:block border-t border-border/50 bg-soft-nude/30">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-center py-1">
              <MegaMenu />
            </nav>
          </div>
        </div>
      </div>

      <CartDrawer />
    </header>
  );
}


