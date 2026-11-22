"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beef, Dumbbell, House, LayoutGrid, Zap } from "lucide-react";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const tabs: { label: string; href: string; icon: Icon; match: (p: string) => boolean }[] = [
  { label: "Accueil", href: "/", icon: House, match: (p) => p === "/" },
  {
    label: "Boutique",
    href: "/shop",
    icon: LayoutGrid,
    match: (p) => p.startsWith("/shop") || p.startsWith("/produits")
  },
  {
    label: "Créatine",
    href: "/creatine",
    icon: Zap,
    match: (p) => p.startsWith("/creatine"),
  },
  {
    label: "Whey",
    href: "/whey-proteine",
    icon: Dumbbell,
    match: (p) => p.startsWith("/whey-proteine") || p.startsWith("/whey-isolate"),
  },
  {
    label: "Mass Gainer",
    href: "/gainers-proteines",
    icon: Beef,
    match: (p) => p.startsWith("/gainers-proteines"),
  },
];

const itemBase =
  "relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-[0.65rem] min-[375px]:text-[0.6875rem] transition-all duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary motion-reduce:transition-none select-none";

export function MobileTabBar() {
  const pathname = usePathname();

  // Mid-checkout the customer should only see the order form and its confirm bar.
  if (pathname.startsWith("/checkout")) return null;

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_28px_-8px_rgba(43,35,38,0.22)] backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {tabs.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${itemBase} ${
                  active ? "font-extrabold text-[#5A1B3D]" : "font-medium text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  className={`absolute top-0 h-0.5 w-7 rounded-full bg-[#5A1B3D] transition-all duration-200 ${
                    active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"
                  }`}
                  aria-hidden
                />
                <span
                  className={`relative flex items-center justify-center rounded-xl px-2.5 py-1 transition-colors ${
                    active ? "bg-[#5A1B3D]/10 text-[#5A1B3D]" : ""
                  }`}
                >
                  <Icon className="size-[19px] min-[375px]:size-[20px]" strokeWidth={active ? 2.4 : 1.9} />
                </span>
                <span className="truncate max-w-full px-0.5 leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}

      </ul>
    </nav>
  );
}
