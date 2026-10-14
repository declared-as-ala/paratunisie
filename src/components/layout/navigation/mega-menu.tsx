"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { storefrontNavigation, mobileNavigationGroups } from "@/lib/data/storefront-navigation";

const linkClass = "flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-white hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function MegaMenu() {
  const pathname = usePathname();
  return <ul className="flex w-full flex-wrap items-center justify-center gap-x-0.5 gap-y-1 py-1">
    {storefrontNavigation.map((item) => <li key={item.href}><Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={`${linkClass} ${pathname === item.href ? "bg-white text-primary" : "text-ink"}`}>{item.label}</Link></li>)}
  </ul>;
}

export function MobileNavigation() {
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (ref.current) ref.current.open = false; }, [pathname]);
  return <details ref={ref} className="group relative lg:hidden" onKeyDown={(event) => {
    if (event.key === "Escape" && ref.current?.open) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); }
  }}>
    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-bold text-ink focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
      <span className="flex items-center gap-2"><Menu className="size-5" aria-hidden />Menu</span><ChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
    </summary>
    <nav aria-label="Navigation mobile" className="absolute inset-x-0 top-full z-50 max-h-[65dvh] overflow-y-auto border-t border-border bg-white px-4 pb-5 shadow-lg" onClick={(event) => { if ((event.target as Element).closest("a") && ref.current) ref.current.open = false; }}>
      <Link className={linkClass} href="/">Accueil</Link>
      {mobileNavigationGroups.map((group) => <section key={group.label} className="border-t border-border py-3"><h2 className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">{group.label}</h2><ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">{group.items.map((item) => <li key={item.href}><Link href={item.href} className={linkClass} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link></li>)}</ul></section>)}
    </nav>
  </details>;
}
