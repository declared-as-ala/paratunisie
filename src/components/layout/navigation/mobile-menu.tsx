"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, Dumbbell, Home, Leaf, Menu, Pill, Search, Tag, User } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { navExtras, navGroups, type NavGroup } from "@/lib/data/storefront-navigation";

const ICONS: Record<NavGroup["icon"], React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  leaf: Leaf,
  pill: Pill,
  tag: Tag,
  book: BookOpen,
};

const rowClass =
  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-soft-nude active:bg-soft-nude focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary";

/** Slide-out mobile navigation: search, expandable category groups, extras and account. */
export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("nutrition");

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-soft-nude active:scale-95 lg:hidden"
      >
        <Menu className="size-[22px]" aria-hidden />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 bg-white p-0 data-[side=left]:sm:max-w-sm">
          <SheetHeader className="shrink-0 border-b border-border/70 px-4 py-3">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation du site ParaTunisie</SheetDescription>
            <Link href="/" aria-label="ParaTunisie — Accueil" className="inline-flex w-fit">
              <Logo size="drawer" />
            </Link>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 pt-3">
            <form action="/shop" method="get" role="search" className="relative mb-3">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input
                type="search"
                name="q"
                enterKeyHint="search"
                placeholder="Rechercher un produit…"
                aria-label="Rechercher un produit"
                className="h-12 w-full rounded-xl border border-border bg-soft-nude/40 ps-10 pe-3 text-[0.9375rem] text-ink placeholder:text-ink-muted/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>

            <nav aria-label="Navigation mobile">
              <Link href="/" className={rowClass} aria-current={pathname === "/" ? "page" : undefined}>
                <Home className="size-[18px] text-primary" aria-hidden /> Accueil
              </Link>

              {navGroups.map((group) => {
                const Icon = ICONS[group.icon];
                const isOpen = expanded === group.key;
                const panelId = `mobile-nav-${group.key}`;
                return (
                  <div key={group.key} className="mt-0.5">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : group.key)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className={`${rowClass} w-full justify-between text-start`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="size-[18px] text-primary" aria-hidden /> {group.label}
                      </span>
                      <ChevronDown className={`size-4 text-ink-muted transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                    </button>
                    <div
                      id={panelId}
                      className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <ul className="min-h-0 overflow-hidden" hidden={!isOpen}>
                        <li>
                          <Link href={group.href} className="ms-9 flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-primary hover:bg-soft-nude">
                            Tout voir
                          </Link>
                        </li>
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={pathname === link.href ? "page" : undefined}
                              className="ms-9 flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-soft-nude hover:text-ink aria-[current=page]:font-bold aria-[current=page]:text-primary"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}

              <div className="my-2 border-t border-border/70" />
              {navExtras.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <Link key={item.href} href={item.href} className={rowClass} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
                    <Icon className="size-[18px] text-primary" aria-hidden /> {item.label}
                  </Link>
                );
              })}
              <Link href="/compte" className={rowClass}>
                <User className="size-[18px] text-primary" aria-hidden /> Mon compte
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
