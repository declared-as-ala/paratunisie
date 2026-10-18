"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Menu,
  X,
  Tags,
  BookOpen,
  LayoutTemplate,
  Star,
  Boxes,
  LogOut,
  BarChart3,
  Wallet,
  Gift,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  FileBarChart,
  PackageSearch,
  Upload,
  Truck,
  Home,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@paratunisie/ui";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { onOrdersChanged } from "@/lib/order-events";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [{ label: "Tableau de bord", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Analyse et rapports",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Rapports", href: "/admin/rapports", icon: FileBarChart },
      { label: "Rentabilité", href: "/admin/rentabilite", icon: Wallet },
    ],
  },
  {
    title: "Commandes",
    items: [
      { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
      { label: "Demandes produits", href: "/admin/demandes", icon: PackageSearch },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Produits", href: "/admin/produits", icon: Package },
      { label: "Marques", href: "/admin/marques", icon: Tags },
      { label: "Catégories", href: "/admin/categories", icon: Tags },
      { label: "Importation", href: "/admin/importation", icon: Upload },
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Avis", href: "/admin/avis", icon: Star },
      { label: "Fidélité", href: "/admin/fidelite", icon: Gift },
    ],
  },
  {
    title: "Logistique",
    items: [{ label: "Stocks", href: "/admin/stocks", icon: Boxes }],
  },
  {
    title: "Contenu et SEO",
    items: [
      { label: "Page d'accueil", href: "/admin/page-accueil", icon: Home },
      { label: "Conseils & Articles", href: "/admin/articles", icon: BookOpen },
    ],
  },
  {
    title: "Paramètres",
    items: [{ label: "Paramètres", href: "/admin/parametres", icon: Settings }],
  },
];

const COLLAPSE_KEY = "pt-admin-sidebar-collapsed";
const GROUPS_KEY = "pt-admin-sidebar-closed-groups";

function findItem(pathname: string) {
  let best: { section: NavSection; item: NavItem } | null = null;
  for (const section of navSections) {
    for (const item of section.items) {
      const match = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
      if (match && (!best || item.href.length > best.item.href.length)) best = { section, item };
    }
  }
  return best;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { staff, loading, logout } = useAuth();

  // Sidebar order badge — same canonical /orders/counts endpoint the Commandes
  // page uses (never a hardcoded/independently-derived number, so the two can't
  // drift again), refetched on real order mutations via a lightweight DOM event.
  const [normalOrderCount, setNormalOrderCount] = useState<number | null>(null);
  const loadOrderCount = useCallback(async () => {
    try {
      const counts = await apiClient.get<{ normal: number }>("/orders/counts");
      setNormalOrderCount(counts.normal);
    } catch {
      // Non-fatal — badge just stays hidden if the count can't be loaded.
    }
  }, []);

  useEffect(() => {
    if (!staff) return;
    loadOrderCount();
    return onOrdersChanged(loadOrderCount);
  }, [staff, loadOrderCount]);

  // Per-viewer preferences (best effort — storage can be unavailable).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
      const raw = localStorage.getItem(GROUPS_KEY);
      if (raw) setClosedGroups(JSON.parse(raw));
    } catch {}
  }, []);

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

  // The login page renders its own full-screen layout — no sidebar/topbar chrome,
  // and no point rendering the shell while auth status is still loading either.
  if (pathname === "/admin/login" || loading || !staff) {
    return <>{children}</>;
  }

  const current = findItem(pathname);
  const isDetail = current ? pathname !== current.item.href && pathname.startsWith(current.item.href + "/") : false;
  const initial = staff.name.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface-alt",
          "transition-[transform,width] duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-[4.25rem]" : "lg:w-64",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className={cn("flex h-14 shrink-0 items-center border-b border-border px-3", collapsed ? "lg:justify-center" : "justify-between")}>
          <Link href="/admin" className="group flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[0.625rem] font-bold tracking-tight text-primary-foreground shadow-sm transition-colors group-hover:bg-primary-hover">
              PT
            </div>
            <div className={cn("flex min-w-0 flex-col leading-tight", collapsed && "lg:hidden")}>
              <span className="truncate text-[0.8125rem] font-semibold tracking-tight text-ink">ParaTunisie</span>
              <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-accent">Admin</span>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-soft-nude hover:text-ink lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3" aria-label="Navigation admin">
          {navSections.map((section) => {
            const closed = closedGroups.includes(section.title) && !collapsed;
            const single = section.items.length === 1;
            return (
              <div key={section.title} className="mb-2">
                {!single && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(section.title)}
                    className={cn(
                      "group/h mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint transition-colors hover:text-ink",
                      collapsed && "lg:hidden"
                    )}
                    aria-expanded={!closed}
                  >
                    {section.title}
                    <ChevronDown size={11} className={cn("transition-transform", closed && "-rotate-90")} />
                  </button>
                )}
                {single && (
                  <p className={cn("mb-0.5 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint", collapsed && "lg:hidden")}>
                    {section.title}
                  </p>
                )}
                {collapsed && <div className="mx-2 mb-1 hidden border-t border-border first:hidden lg:block" />}
                <div className={cn("space-y-0.5", closed && "hidden")}>
                  {section.items.map((item) => {
                    const active = current?.item.href === item.href;
                    const badge = item.href === "/admin/commandes" ? (normalOrderCount ?? undefined) : item.badge;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group/i relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors",
                          collapsed && "lg:justify-center lg:px-0",
                          active
                            ? "bg-primary-soft/70 text-primary"
                            : "text-ink-muted hover:bg-soft-nude hover:text-ink"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {active && <span className="absolute inset-y-1.5 -left-2.5 w-[3px] rounded-r bg-primary" aria-hidden="true" />}
                        <item.icon size={16} strokeWidth={active ? 2 : 1.6} className="shrink-0" />
                        <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span
                            className={cn(
                              "flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-bold text-primary-foreground",
                              collapsed && "lg:absolute lg:right-1 lg:top-0.5 lg:h-3.5 lg:min-w-[0.875rem] lg:text-[0.5rem]"
                            )}
                          >
                            {badge}
                          </span>
                        )}
                        {collapsed && (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.6875rem] font-medium text-background opacity-0 shadow-lg transition-opacity group-hover/i:opacity-100 group-focus-visible/i:opacity-100 lg:block"
                          >
                            {item.label}
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

        <div className="hidden shrink-0 border-t border-border p-2.5 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.75rem] font-medium text-ink-faint transition-colors hover:bg-soft-nude hover:text-ink",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
            title={collapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-alt/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-alt/70 lg:px-6">
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-soft-nude lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>

          <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
            <Link href="/admin" className="hidden text-ink-faint transition-colors hover:text-ink sm:inline">
              Admin
            </Link>
            {current && current.item.href !== "/admin" && (
              <>
                <ChevronRight size={13} className="hidden shrink-0 text-ink-faint sm:inline" />
                <span className="hidden truncate text-ink-faint md:inline">{current.section.title}</span>
                <ChevronRight size={13} className="hidden shrink-0 text-ink-faint md:inline" />
                {isDetail ? (
                  <>
                    <Link href={current.item.href} className="truncate text-ink-faint transition-colors hover:text-ink">
                      {current.item.label}
                    </Link>
                    <ChevronRight size={13} className="shrink-0 text-ink-faint" />
                    <span className="truncate font-semibold text-ink">Détail</span>
                  </>
                ) : (
                  <span className="truncate font-semibold text-ink">{current.item.label}</span>
                )}
              </>
            )}
            {(!current || current.item.href === "/admin") && (
              <>
                <ChevronRight size={13} className="hidden shrink-0 text-ink-faint sm:inline" />
                <span className="font-semibold text-ink">Tableau de bord</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/livraisons"
              className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-2.5 py-1.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:border-border-strong hover:text-ink sm:inline-flex"
            >
              <Truck size={14} /> Livraisons
            </Link>
            <Link
              href="/admin/commandes"
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[0.75rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex"
            >
              <ShoppingCart size={14} /> Commandes
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface-alt py-1 pl-1 pr-2.5 transition-colors hover:border-border-strong"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-[0.6875rem] font-bold text-primary">
                  {initial}
                </span>
                <span className="hidden max-w-[8rem] truncate text-[0.75rem] font-medium text-ink md:inline">{staff.name}</span>
                <ChevronDown size={12} className="text-ink-faint" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface-alt shadow-xl">
                  <div className="border-b border-border px-3.5 py-3">
                    <p className="truncate text-[0.8125rem] font-semibold text-ink">{staff.name}</p>
                    <p className="truncate text-[0.6875rem] text-ink-faint">{staff.role}</p>
                  </div>
                  <Link
                    href="/admin/parametres"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-[0.8125rem] text-ink-muted transition-colors hover:bg-soft-nude hover:text-ink"
                  >
                    <Settings size={14} /> Paramètres
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2.5 border-t border-border px-3.5 py-2.5 text-left text-[0.8125rem] text-danger transition-colors hover:bg-danger-bg"
                  >
                    <LogOut size={14} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
