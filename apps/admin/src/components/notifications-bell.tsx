"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Boxes, Hourglass, ShoppingCart } from "lucide-react";
import { cn } from "@paratunisie/ui";

export interface NotificationCounts {
  /** Orders waiting for a first action (EN_ATTENTE + TENTATIVE_CONTACT). */
  pendingOrders: number;
  /** Abandoned checkouts that need a human follow-up. */
  abandoned: number;
  /** Stock items at or under their reorder threshold. */
  lowStock: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export function NotificationsBell({ counts }: { counts: NotificationCounts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const items = [
    { key: "orders", n: counts.pendingOrders, icon: ShoppingCart, href: "/admin/commandes", text: plural(counts.pendingOrders, "commande à traiter", "commandes à traiter") },
    { key: "abandoned", n: counts.abandoned, icon: Hourglass, href: "/admin/commandes-abandonnees", text: plural(counts.abandoned, "commande abandonnée à relancer", "commandes abandonnées à relancer") },
    { key: "stock", n: counts.lowStock, icon: Boxes, href: "/admin/stocks", text: plural(counts.lowStock, "produit en stock bas", "produits en stock bas") },
  ].filter((i) => i.n > 0);
  const total = items.reduce((s, i) => s + i.n, 0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={total > 0 ? `Notifications : ${total} à traiter` : "Notifications : rien à traiter"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="press relative flex size-9 items-center justify-center rounded-lg text-ink-muted hover:text-ink"
      >
        <Bell size={17} strokeWidth={1.7} aria-hidden />
        {total > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-bold leading-none text-primary-foreground">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface-alt shadow-[0_16px_40px_-16px_rgba(23,23,23,0.28)]">
          <p className="border-b border-border px-4 py-3 text-[0.8125rem] font-semibold text-ink">À traiter</p>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-[0.8125rem] text-ink-muted">Tout est à jour.</p>
          ) : (
            <ul data-lenis-prevent className="max-h-80 overflow-y-auto p-1.5">
              {items.map((i) => (
                <li key={i.key}>
                  <Link
                    href={i.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn("press flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8125rem] text-ink")}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-soft-nude text-ink-muted">
                      <i.icon size={15} aria-hidden />
                    </span>
                    {i.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
