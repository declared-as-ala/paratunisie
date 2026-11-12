"use client";

import Link from "next/link";
import { Heart, Phone, ShoppingBag, User, ShieldCheck, CreditCard, Truck } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";
import { Logo } from "@/components/layout/logo";
import { SearchOverlay } from "@/components/layout/navigation/search-overlay";
import { MegaMenu } from "@/components/layout/navigation/mega-menu";
import { MobileMenu } from "@/components/layout/navigation/mobile-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -end-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-4 text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur-md">
      {/* ── 1. Top Utility / Announcement Bar (Deep Burgundy) ─────────────── */}
      <div className="bg-[#5E203C] text-white">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-4 text-[0.6875rem] sm:text-xs font-medium">
          {/* Left: Value propositions */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
            <span className="flex items-center gap-1.5 truncate">
              <Truck size={13} className="text-white/80 shrink-0" aria-hidden />
              <span>Livraison partout en Tunisie</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-white/90 shrink-0">
              <ShieldCheck size={13} className="text-white/80 shrink-0" aria-hidden />
              <span>Produits 100% authentiques</span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-white/90 shrink-0">
              <CreditCard size={13} className="text-white/80 shrink-0" aria-hidden />
              <span>Paiement à la livraison ou en ligne</span>
            </span>
          </div>

          {/* Right: Phone support */}
          <div className="flex items-center gap-2 shrink-0">
            <a href="tel:+21697991266" className="flex items-center gap-1.5 text-white/95 hover:text-white transition-colors">
              <Phone size={12} className="text-white/80" aria-hidden />
              <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
              <span className="font-bold">+216 97 991 266</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. Main Row (Logo, Central Search, Account, Wishlist, Cart) ────── */}
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1440px] items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:h-20 lg:gap-8 lg:px-8">
        <MobileMenu />

        {/* Brand Logo */}
        <Link href="/" aria-label="ParaTunisie — Accueil" className="shrink-0">
          <Logo size="header" />
        </Link>

        {/* Central Search Bar */}
        <div className="mx-auto hidden max-w-2xl flex-1 lg:block">
          <SearchOverlay variant="full" />
        </div>

        {/* User Actions with Labels */}
        <div className="ms-auto flex items-center gap-1.5 sm:gap-4 lg:gap-6">
          {/* Mon compte */}
          <Link
            href="/compte"
            className="group flex flex-col items-center gap-0.5 text-ink hover:text-primary transition-colors text-center p-1.5 sm:px-1"
            aria-label="Mon compte"
          >
            <User size={20} className="transition-transform group-hover:scale-105" aria-hidden />
            <span className="hidden sm:inline text-[0.6875rem] font-semibold text-ink-muted group-hover:text-primary">Mon compte</span>
          </Link>

          {/* Favoris */}
          <Link
            href="/favoris"
            className="group flex flex-col items-center gap-0.5 text-ink hover:text-primary transition-colors text-center p-1.5 sm:px-1"
            aria-label={`Favoris (${wishlistCount})`}
          >
            <div className="relative">
              <Heart size={20} className="transition-transform group-hover:scale-105" aria-hidden />
              <Badge count={wishlistCount} />
            </div>
            <span className="hidden sm:inline text-[0.6875rem] font-semibold text-ink-muted group-hover:text-primary">Favoris</span>
          </Link>

          {/* Panier */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="group flex flex-col items-center gap-0.5 text-ink hover:text-primary transition-colors text-center p-1.5 sm:px-1 cursor-pointer"
            aria-label={`Panier (${itemCount})`}
          >
            <div className="relative">
              <ShoppingBag size={20} className="transition-transform group-hover:scale-105" aria-hidden />
              <Badge count={itemCount} />
            </div>
            <span className="hidden sm:inline text-[0.6875rem] font-semibold text-ink-muted group-hover:text-primary">Panier</span>
          </button>
        </div>
      </div>

      {/* ── 2b. Mobile Compact Search Bar Row (< 1024px) ───────────────────── */}
      <div className="border-t border-border/50 bg-white px-3 py-2 lg:hidden">
        <SearchOverlay variant="compact" className="w-full" />
      </div>

      {/* ── 3. Desktop Navigation Bar (Categories + Promotions/Nouveautés) ── */}
      <div className="relative hidden border-t border-border/60 bg-white lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8">
          <nav aria-label="Navigation principale">
            <MegaMenu />
          </nav>

          {/* Right badges: Promotions % and Nouveautés */}
          <div className="flex items-center gap-2 py-1.5">
            <Link
              href="/shop?filter=promotions"
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Promotions %</span>
            </Link>
            <Link
              href="/shop?sort=newest"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#4A122A] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#380D20] transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Nouveautés</span>
            </Link>
          </div>
        </div>
      </div>

      <CartDrawer />
    </header>
  );
}
