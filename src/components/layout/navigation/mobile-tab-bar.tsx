"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartDrawer } from "@/hooks/use-cart-drawer";

type TabItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCenter?: boolean;
  isCart?: boolean;
};

const mobileTabs: TabItem[] = [
  { label: "Accueil", href: "/", icon: House },
  { label: "Favoris", href: "/favoris", icon: Heart },
  { label: "Boutique", href: "/shop", icon: LayoutGrid, isCenter: true },
  { label: "Compte", href: "/compte", icon: User },
  { label: "Panier", href: "/panier", icon: ShoppingBag, isCart: true },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { setOpen: setCartOpen } = useCartDrawer();

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(43,35,38,0.08)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-1 py-1 items-center">
        {mobileTabs.map(({ label, href, icon: Icon, isCenter, isCart }) => {
          const active =
            href === "/shop"
              ? pathname === "/shop" || pathname.startsWith("/shop/")
              : href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

          if (isCenter) {
            return (
              <li key={href} className="flex justify-center items-center">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center size-12 rounded-2xl shadow-md transition-all ${
                    active
                      ? "bg-primary text-white scale-105 shadow-primary/30 font-bold"
                      : "bg-soft-nude text-primary hover:bg-primary hover:text-white font-medium"
                  }`}
                >
                  <Icon className="size-5 stroke-[2.2]" />
                  <span className="text-[0.6rem] leading-none mt-0.5">{label}</span>
                </Link>
              </li>
            );
          }

          if (isCart) {
            return (
              <li key={href}>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative flex w-full min-h-13 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium text-ink-muted hover:text-primary transition-colors"
                >
                  <div className="relative">
                    <Icon className="size-5 stroke-[1.8]" />
                    {itemCount > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.55rem] font-extrabold text-white">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-13 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors ${
                  active ? "text-primary font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                <div className="relative">
                  <Icon className={`size-5 ${active ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                  {href === "/favoris" && wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.55rem] font-extrabold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

