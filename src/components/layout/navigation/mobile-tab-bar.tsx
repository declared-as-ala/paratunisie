"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, Leaf, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const tabs: { label: string; href: string; icon: Icon; match: (p: string) => boolean }[] = [
  { label: "Accueil", href: "/", icon: House, match: (p) => p === "/" },
  {
    label: "Boutique",
    href: "/shop",
    icon: LayoutGrid,
    match: (p) => p.startsWith("/shop") || p.startsWith("/produits") || p.startsWith("/whey-proteine") || p.startsWith("/gainers-proteines"),
  },
  {
    label: "Créatine",
    href: "/creatine",
    icon: Zap,
    match: (p) => p.startsWith("/creatine"),
  },
  {
    label: "Bien-être",
    href: "/bien-etre",
    icon: Leaf,
    match: (p) => p.startsWith("/bien-etre") || p.startsWith("/ashwagandha") || p.startsWith("/magnesium"),
  },
  {
    label: "Favoris",
    href: "/favoris",
    icon: Heart,
    match: (p) => p.startsWith("/favoris"),
  },
];

function Badge({ count, variant = "primary" }: { count: number; variant?: "primary" | "white" }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -end-2 -top-1.5 flex min-w-[17px] h-[17px] items-center justify-center rounded-full px-1 text-[0.6rem] font-extrabold leading-none ring-2 ${
        variant === "white"
          ? "bg-white text-[#5E203C] ring-[#5E203C]"
          : "bg-[#5E203C] text-white ring-white"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const itemBase =
  "relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-[0.65rem] min-[375px]:text-[0.6875rem] transition-all duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary motion-reduce:transition-none select-none";

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();

  // Mid-checkout the customer should only see the order form and its confirm bar.
  if (pathname.startsWith("/checkout")) return null;

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_28px_-8px_rgba(43,35,38,0.22)] backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-6 px-1">
        {tabs.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${itemBase} ${
                  active ? "font-extrabold text-[#5E203C]" : "font-medium text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  className={`absolute top-0 h-0.5 w-7 rounded-full bg-[#5E203C] transition-all duration-200 ${
                    active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"
                  }`}
                  aria-hidden
                />
                <span
                  className={`relative flex items-center justify-center rounded-xl px-2.5 py-1 transition-colors ${
                    active ? "bg-[#5E203C]/10 text-[#5E203C]" : ""
                  }`}
                >
                  <Icon className="size-[19px] min-[375px]:size-[20px]" strokeWidth={active ? 2.4 : 1.9} />
                  {href === "/favoris" && <Badge count={wishlistCount} />}
                </span>
                <span className="truncate max-w-full px-0.5 leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}

        {/* Prominent Cart Action Tab */}
        <li className="flex items-center justify-center p-1">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Panier${itemCount > 0 ? ` — ${itemCount} article${itemCount === 1 ? "" : "s"}` : ""}`}
            className="relative flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#5E203C] text-[0.65rem] min-[375px]:text-[0.6875rem] font-bold text-white shadow-xs transition-all active:scale-95 hover:bg-[#4A122A] cursor-pointer"
          >
            <span className="relative">
              <ShoppingBag className="size-[18px] min-[375px]:size-[19px]" strokeWidth={2.2} />
              <Badge count={itemCount} variant="white" />
            </span>
            <span className="leading-none">Panier</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
