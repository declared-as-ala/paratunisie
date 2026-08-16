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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-2xs">
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-7 sm:h-8 max-w-[1440px] items-center justify-between gap-4 px-4 text-[0.6875rem] sm:text-xs font-medium tracking-wide">
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

      {/* Main Header Bar: Logo + Inline Search + Actions */}
      <div className="border-b border-border/70">
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 transition-[padding] duration-200 ${
            scrolled ? "py-1.5" : "py-2 sm:py-2.5"
          }`}
        >
          {/* Logo */}
          <Link href="/" aria-label="ParaTunisie — Accueil" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop Search Bar (Inline in main row on lg+) */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <SearchOverlay variant="compact" />
          </div>

          {/* Actions: Search icon (mobile), Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile Search Icon Trigger */}
            <div className="lg:hidden">
              <SearchOverlay variant="icon" />
            </div>

            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Favoris"
              className="hidden sm:inline-flex text-ink hover:text-primary"
              render={<Link href="/favoris" />}
            >
              <Heart size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Mon compte"
              className="hidden sm:inline-flex text-ink hover:text-primary"
              render={<Link href="/compte" />}
            >
              <User size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={`Panier${itemCount > 0 ? ` — ${itemCount} article${itemCount === 1 ? "" : "s"}` : ""}`}
              onClick={() => setCartOpen(true)}
              className="relative text-ink hover:text-primary"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground shadow-2xs">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Category Navigation Bar (MegaMenu) - Desktop Only */}
        <div className="hidden lg:block border-t border-border/50 bg-soft-nude/30">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center justify-center py-0.5">
            <MegaMenu />
          </div>
        </div>
      </div>

      <CartDrawer />
    </header>
  );
}

