"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const tabs: { label: string; href: string; icon: Icon; match: (p: string) => boolean }[] = [
  { label: "Accueil", href: "/", icon: House, match: (p) => p === "/" },
  { label: "Boutique", href: "/shop", icon: LayoutGrid, match: (p) => p.startsWith("/shop") || p.startsWith("/produits") },
  { label: "Favoris", href: "/favoris", icon: Heart, match: (p) => p.startsWith("/favoris") },
  { label: "Compte", href: "/compte", icon: User, match: (p) => p.startsWith("/compte") },
];

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -end-2.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-bold leading-4 text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const itemBase =
  "relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] transition-colors duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary motion-reduce:transition-none";

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(43,35,38,0.18)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {tabs.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${itemBase} ${active ? "font-bold text-primary" : "font-medium text-ink-muted hover:text-ink"}`}
              >
                <span className={`absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`} aria-hidden />
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={active ? 2.3 : 1.8} />
                  {href === "/favoris" && <Badge count={wishlistCount} />}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Panier${itemCount > 0 ? ` — ${itemCount} article${itemCount === 1 ? "" : "s"}` : ""}`}
            className={`${itemBase} font-medium text-ink-muted hover:text-ink`}
          >
            <span className="relative">
              <ShoppingBag className="size-[22px]" strokeWidth={1.8} />
              <Badge count={itemCount} />
            </span>
            <span>Panier</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
