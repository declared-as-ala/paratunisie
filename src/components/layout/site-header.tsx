"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Phone, ShoppingBag, ShieldCheck, Truck } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";
import { Logo } from "@/components/layout/logo";
import { SearchOverlay } from "@/components/layout/navigation/search-overlay";
import { MegaMenu } from "@/components/layout/navigation/mega-menu";
import { MobileMenu } from "@/components/layout/navigation/mobile-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { COMPANY_CONFIG } from "@/lib/config/company";
import type { ShopDepartment } from "@/lib/api/client";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -end-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-4 text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader({ departments = [] }: { departments?: ShopDepartment[] }) {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/90 backdrop-blur-xl transition-shadow duration-300 motion-reduce:transition-none ${
        scrolled ? "shadow-[0_8px_30px_-18px_rgba(36,19,29,0.35)]" : "border-b border-border/60"
      }`}
    >
      {/* ── 1. Top Utility Bar (fixed height: collapsing it shifts the page and makes the header jitter) ── */}
      <div className="bg-secondary text-white">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-4 text-[0.6875rem] sm:text-xs font-medium">
          {/* Left: contact */}
          <div className="flex items-center gap-4 shrink-0">
            <a href={`tel:${COMPANY_CONFIG.phoneRaw}`} className="flex items-center gap-1.5 text-white/95 hover:text-white transition-colors">
              <Phone size={12} className="text-white/80" aria-hidden />
              <span className="font-bold">{COMPANY_CONFIG.phone}</span>
            </a>
            <a
              href={COMPANY_CONFIG.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-white/95 hover:text-white transition-colors"
            >
              <MessageCircle size={12} className="text-white/80" aria-hidden />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Center: authenticity */}
          <span className="hidden lg:flex items-center gap-1.5 text-white/90">
            <ShieldCheck size={13} className="text-white/80 shrink-0" aria-hidden />
            <span>Produits 100% authentiques</span>
          </span>

          {/* Right: delivery policy */}
          <span className="flex items-center gap-1.5 truncate text-white/90">
            <Truck size={13} className="text-white/80 shrink-0" aria-hidden />
            <span className="truncate">Livraison {COMPANY_CONFIG.deliveryTime} · paiement à la livraison</span>
          </span>
        </div>
      </div>

      {/* ── 2. Main Row (Logo, Central Search, Account, Wishlist, Cart) ────── */}
      <div className="mx-auto flex h-16 sm:h-[4.5rem] max-w-[1440px] items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:h-20 lg:gap-8 lg:px-8">
        <MobileMenu departments={departments} />

        {/* Brand Logo */}
        <Link href="/" aria-label="ParaTunisie — Accueil" className="shrink-0">
          <Logo size="header" />
        </Link>

        {/* Central Search Bar */}
        <div className="mx-auto hidden max-w-2xl flex-1 lg:block">
          <SearchOverlay variant="full" />
        </div>

        {/* User actions */}
        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/favoris"
            aria-label={`Favoris (${wishlistCount})`}
            className="group relative flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Heart size={21} className="transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" aria-hidden />
            <Badge count={wishlistCount} />
          </Link>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Panier (${itemCount})`}
            className="group relative flex h-11 items-center gap-2 rounded-full bg-secondary ps-4 pe-4 text-sm font-bold text-white transition-colors hover:bg-primary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ShoppingBag size={18} aria-hidden />
            <span className="hidden sm:inline">Panier</span>
            {itemCount > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[0.6875rem] font-extrabold leading-5 text-secondary tabular-nums">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── 2b. Mobile Compact Search Bar Row (< 1024px) ───────────────────── */}
      <div className="border-t border-border/50 bg-white px-3 py-2 lg:hidden">
        <SearchOverlay variant="compact" className="w-full" />
      </div>

      {/* ── 3. Desktop navigation ──────────────────────────────────────── */}
      <div className="relative hidden border-t border-border/50 lg:block">
        <nav aria-label="Navigation principale" className="mx-auto flex max-w-[1440px] justify-center px-8">
          <MegaMenu departments={departments} />
        </nav>
      </div>

      <CartDrawer />
    </header>
  );
}
