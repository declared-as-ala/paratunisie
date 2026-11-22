"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { primaryNav } from "@/lib/data/storefront-navigation";
import type { ShopDepartment } from "@/lib/api/client";

const rowClass =
  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-soft-nude active:bg-soft-nude focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary";

/** Slide-out mobile navigation: search, primary links and expandable shop departments. */
export function MobileMenu({ departments }: { departments: ShopDepartment[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

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
              {primaryNav.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={rowClass}
                    aria-current={(item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>

                  {item.href === "/shop" &&
                    departments.map((dept) => {
                      const isOpen = expanded === dept.key;
                      const panelId = `mobile-nav-${dept.key}`;
                      return (
                        <div key={dept.key} className="ms-3">
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : dept.key)}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className={`${rowClass} w-full justify-between text-start text-sm`}
                          >
                            <span>
                              {dept.label}
                              <span className="ms-2 text-xs font-medium text-ink-muted">{dept.categories.length}</span>
                            </span>
                            <ChevronDown className={`size-4 text-ink-muted transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                          </button>
                          <ul id={panelId} hidden={!isOpen}>
                            <li>
                              <Link href={dept.href} className="ms-4 flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-primary hover:bg-soft-nude">
                                Tout le rayon
                              </Link>
                            </li>
                            {dept.categories.map((cat) => (
                              <li key={cat.slug}>
                                <Link
                                  href={`/${cat.slug}`}
                                  aria-current={pathname === `/${cat.slug}` ? "page" : undefined}
                                  className="ms-4 flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-soft-nude hover:text-ink aria-[current=page]:font-bold aria-[current=page]:text-primary"
                                >
                                  {cat.name}
                                  <span className="text-xs tabular-nums text-ink-faint">{cat.count}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                </div>
              ))}

            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
