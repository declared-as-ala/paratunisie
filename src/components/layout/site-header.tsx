"use client";

import Link from "next/link";
import { Heart, MapPin, MessageCircle, Phone, ShoppingBag, User } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";
import { Logo } from "@/components/layout/logo";
import { SearchOverlay } from "@/components/layout/navigation/search-overlay";
import { MegaMenu } from "@/components/layout/navigation/mega-menu";
import { MobileMenu } from "@/components/layout/navigation/mobile-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { phoneHref, phoneNumber, whatsappHref } from "@/lib/contact";

const iconBtn =
  "relative flex size-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-soft-nude hover:text-primary active:scale-95";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute end-0.5 top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-4.5 text-white shadow-2xs ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * Compact sticky header. Fixed heights (no scroll-driven resizing) so content never jumps.
 * Mobile: [menu] [logo] ........ [search] [cart]  — everything in one 56px row under a 28px announcement bar.
 */
export function SiteHeader() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur-md">
      {/* Announcement bar — one slim line */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-7 max-w-[1440px] items-center justify-center gap-4 px-4 text-[0.6875rem] font-medium tracking-wide sm:h-8 sm:text-xs lg:justify-between">
          <div className="hidden items-center gap-4 lg:flex">
            <a href={phoneHref} className="flex items-center gap-1 hover:underline">
              <Phone size={11} aria-hidden />
              <span>{phoneNumber}</span>
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-300 hover:underline">
              <MessageCircle size={11} aria-hidden />
              <span>WhatsApp</span>
            </a>
          </div>
          <p className="flex items-center gap-1.5 truncate">
            <MapPin size={11} className="hidden shrink-0 sm:block" aria-hidden />
            <span>Livraison partout en Tunisie · offerte dès 99 DT<span className="hidden sm:inline"> · Paiement à la livraison</span></span>
          </p>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-1 px-2 sm:gap-3 sm:px-6 lg:h-[4.25rem] lg:gap-6 lg:px-8">
        <MobileMenu />

        <Link href="/" aria-label="ParaTunisie — Accueil" className="shrink-0 px-1">
          <Logo size="header" />
        </Link>

        <div className="mx-4 hidden max-w-2xl flex-1 lg:block">
          <SearchOverlay variant="full" />
        </div>

        <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
          <div className="lg:hidden">
            <SearchOverlay variant="icon" />
          </div>

          <Link href="/compte" aria-label="Mon compte" className={`${iconBtn} hidden sm:flex`}>
            <User size={21} aria-hidden />
          </Link>

          <Link href="/favoris" aria-label={`Favoris${wishlistCount ? ` — ${wishlistCount}` : ""}`} className={`${iconBtn} hidden sm:flex`}>
            <Heart size={21} aria-hidden />
            <Badge count={wishlistCount} />
          </Link>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Panier${itemCount > 0 ? ` — ${itemCount} article${itemCount === 1 ? "" : "s"}` : ""}`}
            className={iconBtn}
          >
            <ShoppingBag size={21} aria-hidden />
            <Badge count={itemCount} />
          </button>
        </div>
      </div>

      {/* Desktop categories */}
      <div className="relative hidden border-t border-border/50 bg-soft-nude/40 lg:block">
        <nav aria-label="Navigation principale" className="mx-auto max-w-[1440px] px-8">
          <MegaMenu />
        </nav>
      </div>

      <CartDrawer />
    </header>
  );
}
