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
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Analyse",
    items: [
      { label: "Rapports", href: "/admin/rapports", icon: BarChart3 },
      { label: "Rentabilité", href: "/admin/rentabilite", icon: Wallet },
    ],
  },
  {
    title: "Commandes",
    items: [
      { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Produits", href: "/admin/produits", icon: Package },
      { label: "Marques", href: "/admin/marques", icon: Tags },
      { label: "Catégories", href: "/admin/categories", icon: Tags },
      { label: "Importation", href: "/admin/importation", icon: LayoutTemplate },
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
    items: [
      { label: "Stocks", href: "/admin/stocks", icon: Boxes },
    ],
  },
  {
    title: "Contenu",
    items: [
      { label: "Page d'accueil", href: "/admin/page-accueil", icon: LayoutTemplate },
      { label: "Conseils & Articles", href: "/admin/articles", icon: BookOpen },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { label: "Paramètres", href: "/admin/parametres", icon: Settings },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    const basePath = href.split("?")[0];
    return pathname.startsWith(basePath);
  }

  // The login page renders its own full-screen layout — no sidebar/topbar chrome,
  // and no point rendering the shell while auth status is still loading either.
  if (pathname === "/admin/login" || loading || !staff) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex min-h-screen w-60 flex-col border-r border-border bg-surface-alt transition-transform duration-[var(--duration-standard)] ease-[var(--ease-out-standard)] lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:transition-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-border px-4 pt-5 pb-4">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-[0.625rem] font-bold tracking-tight text-primary-foreground transition-colors group-hover:bg-primary-hover">
              PT
            </div>
            <div className="flex flex-col">
              <span className="text-[0.8125rem] font-semibold tracking-tight text-ink">
                ParaTunisie
              </span>
              <span className="mt-0.5 text-[0.5625rem] font-semibold tracking-[0.2em] uppercase text-accent">
                Admin
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-ink-faint transition-colors hover:bg-soft-nude hover:text-ink lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Navigation admin">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-3 text-[0.5625rem] font-semibold tracking-[0.08em] text-ink-faint uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const badge = item.href === "/admin/commandes" ? (normalOrderCount ?? undefined) : item.badge;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-[0.8125rem] font-medium transition-colors",
                        active
                          ? "bg-primary-soft/60 text-primary"
                          : "text-ink-muted hover:bg-soft-nude hover:text-ink"
                      )}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon size={15} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-bold text-primary-foreground">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="mt-auto border-t border-border px-3 py-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.625rem] font-bold text-primary">
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.75rem] font-medium text-ink">{staff.name}</p>
              <p className="truncate text-[0.625rem] text-ink-faint">{staff.role}</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-soft-nude hover:text-danger"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile menu trigger */}
        <div className="flex items-center justify-between border-b border-border bg-surface-alt px-4 py-2.5 lg:hidden">
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-soft-nude"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>
          <span className="text-xs font-bold text-ink">ParaTunisie Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
