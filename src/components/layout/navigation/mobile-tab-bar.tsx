"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, Sparkles, User } from "lucide-react";

const mobileTabs = [
  { label: "Accueil", href: "/", icon: House },
  { label: "Shop", href: "/shop", icon: LayoutGrid },
  { label: "Favoris", href: "/favoris", icon: Heart },
  { label: "Compte", href: "/compte", icon: User },
] as const;

const categoryPaths = [
  "/categories",
  "/visage",
  "/corps",
  "/cheveux",
  "/solaire",
  "/bebe-maman",
  "/hygiene",
  "/complements",
  "/homme",
  "/besoins",
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  if (href === "/shop") {
    return pathname === href || categoryPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-alt pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(43,35,38,0.07)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4 px-1">
        {mobileTabs.map(({ label, href, icon: Icon }) => {
          const active = isTabActive(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 touch-manipulation flex-col items-center justify-center gap-1 px-1 text-xs font-medium tracking-tight transition-colors duration-[var(--duration-micro)] focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 focus-visible:outline-none active:bg-brand-blush/40 ${
                  active ? "text-primary" : "text-ink-muted"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-primary transition-transform duration-[var(--duration-micro)] ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <Icon
                  className={`size-5 ${active ? "stroke-[2.25]" : "stroke-[1.75]"}`}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
