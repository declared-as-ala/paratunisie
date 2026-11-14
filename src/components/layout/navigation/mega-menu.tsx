"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";

import { primaryNav } from "@/lib/data/storefront-navigation";
import { formatPrice } from "@/lib/data/products";
import type { ShopDepartment } from "@/lib/api/client";

const linkClass =
  "group/link relative flex h-12 items-center px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary aria-[current=page]:text-primary " +
  "after:absolute after:inset-x-4 after:bottom-1.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100 motion-reduce:after:transition-none";

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Desktop navigation. "Boutique" opens a department mega menu (hover,
 * focus or click; Escape and outside click close it). Without catalogue
 * data it degrades to a plain link.
 */
export function MegaMenu({ departments }: { departments: ShopDepartment[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(departments[0]?.key);
  const rootRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const active = departments.find((d) => d.key === activeKey) ?? departments[0];
  const categoryTotal = departments.reduce((sum, d) => sum + d.categories.length, 0);

  return (
    <ul className="flex items-center">
      {primaryNav.map((item) => {
        const current = isCurrent(pathname, item.href) ? "page" : undefined;

        if (item.href !== "/shop" || !active) {
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={current} className={linkClass}>
                {item.label}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={item.href}
            ref={rootRef}
            onMouseEnter={() => {
              cancelClose();
              setOpen(true);
            }}
            onMouseLeave={scheduleClose}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
            }}
            onFocus={cancelClose}
          >
            <div className="flex items-center">
              <Link href={item.href} aria-current={current} className={`${linkClass} pe-1 after:end-1`}>
                {item.label}
              </Link>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="mega-boutique"
                aria-label="Afficher les rayons de la boutique"
                onClick={() => setOpen((v) => !v)}
                className="flex h-12 w-8 items-center justify-center text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary"
              >
                <ChevronDown className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden />
              </button>
            </div>

            <div id="mega-boutique" hidden={!open} className="absolute inset-x-0 top-full z-50 pt-1">
              <div className="mx-auto max-w-[1440px] px-8">
                <div className="grid grid-cols-[17rem_1fr] overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_24px_60px_-20px_rgba(36,19,29,0.3)]">
                  {/* ── Departments ─────────────────────────────────────── */}
                  <div className="flex flex-col gap-1 bg-muted/60 p-3">
                    {departments.map((dept) => {
                      const selected = dept.key === active.key;
                      return (
                        <button
                          key={dept.key}
                          type="button"
                          aria-pressed={selected}
                          onMouseEnter={() => setActiveKey(dept.key)}
                          onFocus={() => setActiveKey(dept.key)}
                          onClick={() => setActiveKey(dept.key)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
                            selected ? "bg-white shadow-2xs" : "hover:bg-white/70"
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className={`block text-xs font-extrabold uppercase leading-tight tracking-wide ${selected ? "text-primary" : "text-ink"}`}>
                              {dept.label}
                            </span>
                            <span className="block text-[0.6875rem] text-ink-muted">
                              {dept.categories.length} {dept.categories.length > 1 ? "catégories" : "catégorie"}
                            </span>
                          </span>
                          {selected && <ChevronRight className="size-4 shrink-0 text-primary" aria-hidden />}
                        </button>
                      );
                    })}
                    <Link
                      href="/shop"
                      className="mt-2 flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                      Voir tous les produits
                    </Link>
                    <p className="pt-1 text-center text-[0.6875rem] text-ink-muted">
                      {departments.length} rayons · {categoryTotal} catégories
                    </p>
                  </div>

                  {/* ── Active department ───────────────────────────────── */}
                  <div className="flex flex-col p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-extrabold uppercase tracking-wide text-ink">{active.label}</p>
                      <Link href={active.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover">
                        Tout le rayon <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </div>

                    <ul className="mt-4 grid grid-cols-3 gap-x-6 gap-y-1 xl:grid-cols-4">
                      {active.categories.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/${cat.slug}`}
                            className="flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 text-sm text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary"
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-[0.6875rem] tabular-nums text-ink-faint">{cat.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {active.products.length > 0 && (
                      <div className="mt-auto border-t border-border/70 pt-4">
                        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-muted">À découvrir dans ce rayon</p>
                        <ul className="mt-3 grid grid-cols-3 gap-3">
                          {active.products.map((product) => (
                            <li key={product.slug}>
                              <Link
                                href={`/produits/${product.slug}`}
                                className="flex items-center gap-3 rounded-xl border border-border/70 p-2 transition-colors hover:border-primary/40"
                              >
                                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted/60">
                                  <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-xs font-semibold text-ink">{product.name}</span>
                                  <span className="block text-xs font-extrabold tabular-nums text-primary">{formatPrice(product.priceMillimes)}</span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
