"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  Search,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@paratunisie/ui";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { onOrdersChanged } from "@/lib/order-events";
import { findNavItem, navSections } from "@/lib/admin-nav";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CommandPalette } from "@/components/command-palette";
import { NotificationsBell, type NotificationCounts } from "@/components/notifications-bell";

const COLLAPSE_KEY = "pt-admin-sidebar-collapsed";
const GROUPS_KEY = "pt-admin-sidebar-closed-groups";

type OrderCounts = { normal: number; abandoned?: number; byStatus?: Record<string, number> };

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { staff, loading, logout } = useAuth();

  // Sidebar badges + the bell read the same canonical endpoints the pages use (never an independently
  // derived number), refetched on real order mutations through a lightweight DOM event.
  const [counts, setCounts] = useState<OrderCounts | null>(null);
  const [lowStock, setLowStock] = useState(0);
  const loadCounts = useCallback(async () => {
    const [c, s] = await Promise.allSettled([
      apiClient.get<OrderCounts>("/orders/counts"),
      apiClient.get<unknown[]>("/inventory/alerts/low-stock"),
    ]);
    if (c.status === "fulfilled") setCounts(c.value);
    if (s.status === "fulfilled" && Array.isArray(s.value)) setLowStock(s.value.length);
  }, []);

  useEffect(() => {
    if (!staff) return;
    loadCounts();
    return onOrdersChanged(loadCounts);
  }, [staff, loadCounts]);

  // Per-viewer preferences (best effort — storage can be unavailable).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
      const raw = localStorage.getItem(GROUPS_KEY);
      if (raw) setClosedGroups(JSON.parse(raw));
    } catch {}
  }, []);

  // Close menus on navigation / outside click / Escape.
  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }, []);

  const toggleGroup = useCallback((title: string) => {
    setClosedGroups((g) => {
      const next = g.includes(title) ? g.filter((t) => t !== title) : [...g, title];
      try {
        localStorage.setItem(GROUPS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // The login page renders its own full-screen layout — no sidebar/topbar chrome,
  // and no point rendering the shell while auth status is still loading either.
  if (pathname === "/admin/login" || loading || !staff) {
    return <>{children}</>;
  }

  const current = findNavItem(pathname);
  const isDetail = current ? pathname !== current.item.href && pathname.startsWith(current.item.href + "/") : false;
  const initial = staff.name.charAt(0).toUpperCase();

  const notifications: NotificationCounts = {
    pendingOrders: (counts?.byStatus?.EN_ATTENTE ?? 0) + (counts?.byStatus?.TENTATIVE_CONTACT ?? 0),
    abandoned: counts?.abandoned ?? 0,
    lowStock,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SmoothScroll />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <a
        href="#contenu-admin"
        className="fixed left-3 top-3 z-[80] -translate-y-20 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:translate-y-0"
      >
        Aller au contenu
      </a>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface-alt",
          "transition-[transform,width] duration-200 ease-[var(--ease-out-standard)] motion-reduce:transition-none",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-[4.5rem]" : "lg:w-64",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b border-border px-4", collapsed ? "lg:justify-center lg:px-0" : "justify-between")}>
          <Link href="/admin" className="flex min-w-0 items-center" aria-label="ParaTunisie — tableau de bord">
            {collapsed && (
              <Image src="/assets/logo-mark.png" alt="ParaTunisie" width={113} height={140} priority className="hidden h-9 w-auto lg:block" />
            )}
            <Image
              src="/assets/logo-trim.png"
              alt="ParaTunisie"
              width={420}
              height={150}
              priority
              className={cn("h-9 w-auto", collapsed && "lg:hidden")}
            />
          </Link>
          <button
            type="button"
            className="press rounded-md p-1.5 text-ink-muted lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3" aria-label="Navigation admin">
          {navSections.map((section) => {
            const closed = closedGroups.includes(section.title) && !collapsed;
            const single = section.items.length === 1;
            return (
              <div key={section.title} className="mb-1.5">
                {!single ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(section.title)}
                    className={cn(
                      "mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[0.625rem] font-medium uppercase tracking-[0.07em] text-ink-faint transition-colors hover:text-ink",
                      collapsed && "lg:hidden",
                    )}
                    aria-expanded={!closed}
                  >
                    {section.title}
                    <ChevronDown size={11} className={cn("transition-transform", closed && "-rotate-90")} aria-hidden />
                  </button>
                ) : (
                  <p className={cn("mb-0.5 px-2.5 py-1.5 text-[0.625rem] font-medium uppercase tracking-[0.07em] text-ink-faint", collapsed && "lg:hidden")}>{section.title}</p>
                )}
                {collapsed && <div className="mx-3 mb-1.5 hidden border-t border-border lg:block" />}
                <div className={cn("space-y-0.5", closed && "hidden")}>
                  {section.items.map((item) => {
                    const active = current?.item.href === item.href;
                    const badge =
                      item.href === "/admin/commandes"
                        ? counts?.normal
                        : item.href === "/admin/commandes-abandonnees"
                          ? counts?.abandoned
                          : item.badge;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "press group/i relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[0.8125rem]",
                          collapsed && "lg:justify-center lg:px-0",
                          active ? "bg-soft-nude font-semibold text-ink" : "font-medium text-ink-muted hover:text-ink",
                        )}
                      >
                        {active && <span className="absolute inset-y-2 -left-3 w-[3px] rounded-r bg-primary" aria-hidden="true" />}
                        <item.icon size={17} strokeWidth={active ? 2 : 1.6} className="shrink-0" aria-hidden />
                        <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span
                            className={cn(
                              "flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-bold text-primary-foreground",
                              collapsed && "lg:absolute lg:right-1.5 lg:top-0.5 lg:h-3.5 lg:min-w-[0.875rem] lg:text-[0.5rem]",
                            )}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden shrink-0 border-t border-border p-3 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn("press flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[0.75rem] font-medium text-ink-muted hover:text-ink", collapsed && "justify-center px-0")}
            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
            title={collapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronsRight size={16} aria-hidden /> : <ChevronsLeft size={16} aria-hidden />}
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-8">
          <button type="button" className="press -ml-1 rounded-md p-2 text-ink-muted lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
            <Menu size={19} />
          </button>

          <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
            <Link href="/admin" className="hidden text-ink-faint transition-colors hover:text-ink sm:inline">
              Admin
            </Link>
            {current && current.item.href !== "/admin" && (
              <>
                <ChevronRight size={13} className="hidden shrink-0 text-ink-faint sm:inline" aria-hidden />
                {current.section.title !== current.item.label && (
                  <>
                    <span className="hidden truncate text-ink-faint md:inline">{current.section.title}</span>
                    <ChevronRight size={13} className="hidden shrink-0 text-ink-faint md:inline" aria-hidden />
                  </>
                )}
                {isDetail ? (
                  <>
                    <Link href={current.item.href} className="truncate text-ink-faint transition-colors hover:text-ink">
                      {current.item.label}
                    </Link>
                    <ChevronRight size={13} className="shrink-0 text-ink-faint" aria-hidden />
                    <span className="truncate font-semibold text-ink">Détail</span>
                  </>
                ) : (
                  <span className="truncate font-semibold text-ink">{current.item.label}</span>
                )}
              </>
            )}
            {(!current || current.item.href === "/admin") && (
              <>
                <ChevronRight size={13} className="hidden shrink-0 text-ink-faint sm:inline" aria-hidden />
                <span className="font-semibold text-ink">Tableau de bord</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="press hidden h-9 items-center gap-2 rounded-lg border border-border bg-surface-alt pl-3 pr-2 text-[0.8125rem] text-ink-muted hover:border-border-strong md:flex md:w-56 lg:w-64"
              aria-label="Ouvrir la palette de commandes (Ctrl K)"
            >
              <Search size={14} aria-hidden />
              <span className="flex-1 text-left">Rechercher…</span>
              <kbd className="rounded border border-border bg-soft-nude px-1.5 py-0.5 font-mono text-[0.625rem]">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="press flex size-9 items-center justify-center rounded-lg text-ink-muted md:hidden"
              aria-label="Rechercher une page"
            >
              <Search size={17} aria-hidden />
            </button>

            <NotificationsBell counts={notifications} />

            <Link
              href="/admin/commandes"
              className="hidden h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-[0.8125rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.98] sm:inline-flex"
            >
              <ShoppingCart size={14} aria-hidden /> Commandes
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="press flex h-9 items-center gap-2 rounded-full border border-border bg-surface-alt py-1 pl-1 pr-2.5 hover:border-border-strong"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menu utilisateur"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[0.6875rem] font-semibold text-white">{initial}</span>
                <span className="hidden max-w-[8rem] truncate text-[0.75rem] font-medium text-ink lg:inline">{staff.name}</span>
                <ChevronDown size={12} className="text-ink-faint" aria-hidden />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface-alt shadow-[0_16px_40px_-16px_rgba(23,23,23,0.28)]">
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-[0.8125rem] font-semibold text-ink">{staff.name}</p>
                    <p className="truncate text-[0.6875rem] text-ink-muted">{staff.role}</p>
                  </div>
                  <Link href="/admin/parametres" role="menuitem" className="press flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] text-ink">
                    <Settings size={14} aria-hidden /> Paramètres
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-left text-[0.8125rem] text-danger transition-colors hover:bg-danger-bg"
                  >
                    <LogOut size={14} aria-hidden /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="contenu-admin" tabIndex={-1} className="flex-1 p-4 outline-none sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
