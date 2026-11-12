"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { navExtras, navGroups } from "@/lib/data/storefront-navigation";

const triggerClass =
  "relative flex h-11 items-center gap-1 rounded-lg px-3.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-white hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** Desktop navigation with accessible dropdown panels (hover, focus and click; Escape closes). */
export function MegaMenu() {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpenKey(null), [pathname]);

  useEffect(() => {
    if (!openKey) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  const open = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 140);
  };

  return (
    <ul ref={rootRef} className="relative flex w-full items-center justify-center gap-x-1">
      {navGroups.map((group) => {
        const isOpen = openKey === group.key;
        const active = group.links.some((l) => l.href === pathname) || pathname === group.href;
        const panelId = `mega-${group.key}`;
        return (
          <li
            key={group.key}
            onMouseEnter={() => open(group.key)}
            onMouseLeave={scheduleClose}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
            }}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenKey(isOpen ? null : group.key)}
              className={`${triggerClass} ${active ? "text-primary" : ""}`}
            >
              {group.label}
              <ChevronDown className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            <div
              id={panelId}
              hidden={!isOpen}
              className="absolute inset-x-0 top-full z-50 mx-auto w-full max-w-3xl pt-1"
            >
              <div className="grid grid-cols-[1fr_auto] gap-8 rounded-2xl border border-border/70 bg-white p-6 shadow-[0_24px_60px_-20px_rgba(43,35,38,0.25)]">
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-soft-nude hover:text-primary aria-[current=page]:font-bold aria-[current=page]:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={group.href}
                  className="flex w-52 flex-col justify-end rounded-xl bg-gradient-to-br from-primary to-[#5E203C] p-5 text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] opacity-80">Explorer</span>
                  <span className="mt-1 font-serif text-lg font-semibold leading-snug">Toute la gamme {group.label.toLowerCase()}</span>
                  <span className="mt-3 text-xs font-bold underline underline-offset-4">Voir les produits →</span>
                </Link>
              </div>
            </div>
          </li>
        );
      })}
      {navExtras.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            className={`${triggerClass} aria-[current=page]:text-primary`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
