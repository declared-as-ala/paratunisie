"use client";

import Link from "next/link";
import { Heart, Phone, ShoppingBag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScrolled } from "@/hooks/use-scrolled";
import { useCart } from "@/hooks/use-cart";
import { useCartDrawer } from "@/hooks/use-cart-drawer";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/navigation/mega-menu";
import { SearchOverlay } from "@/components/layout/navigation/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { phoneHref, phoneNumber } from "@/lib/contact";

const ANNOUNCEMENTS = [
  "Livraison offerte dès 99 DT",
  "Produits 100% authentiques garantis",
  "Expédition sous 24h/48h partout en Tunisie",
];

export function SiteHeader() {
  const scrolled = useScrolled();
  const { itemCount } = useCart();
  const { setOpen: setCartOpen } = useCartDrawer();

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between gap-4 px-4 text-[0.7rem] font-medium tracking-wide sm:h-9 sm:text-xs">
          <div className="flex min-w-0 items-center gap-4 overflow-hidden">
            <span className="truncate">{ANNOUNCEMENTS[0]}</span>
            <span className="hidden md:inline truncate">{ANNOUNCEMENTS[1]}</span>
            <span className="hidden lg:inline truncate">{ANNOUNCEMENTS[2]}</span>
          </div>
          <a href={phoneHref} className="flex shrink-0 items-center gap-1.5 font-bold hover:underline">
            <Phone size={12} className="shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{phoneNumber}</span>
          </a>
        </div>
      </div>

      {/* Main Header Bar: Logo + Prominent Search + Actions */}
      <div
        className={`border-b border-border transition-[padding] duration-[var(--duration-standard)] ease-[var(--ease-in-out-standard)] ${
          scrolled ? "py-1.5" : "py-2.5"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" aria-label="ParaTunisie — Accueil" className="shrink-0">
            <Logo />
          </Link>

          {/* Prominent Search Bar (Flexible Center) */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-6 min-w-0">
            <SearchOverlay />
          </div>

          {/* Right Actions: Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Favoris"
              className="hidden sm:inline-flex"
              render={<Link href="/favoris" />}
            >
              <Heart />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Mon compte"
              className="hidden sm:inline-flex"
              render={<Link href="/compte" />}
            >
              <User />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={`Panier${itemCount > 0 ? ` — ${itemCount} article${itemCount === 1 ? "" : "s"}` : ""}`}
              onClick={() => setCartOpen(true)}
              className="relative"
            >
              <ShoppingBag />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (MegaMenu) - Desktop Only */}
      <div className="hidden lg:block border-b border-border/60 bg-surface-alt/50">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <MegaMenu />
        </div>
      </div>

      <CartDrawer />
    </header>
  );
}
