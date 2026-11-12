"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { CornerDownLeft, Search } from "lucide-react";
import { navSections } from "@/lib/admin-nav";

/**
 * Ctrl/Cmd+K command palette. It is opened from the keyboard hundreds of times a day, so it has
 * NO open/close animation on purpose (instant), and it owns its list scrolling (data-lenis-prevent).
 */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[14vh]" role="presentation">
      <div className="absolute inset-0 bg-ink/40" onClick={() => onOpenChange(false)} aria-hidden="true" />
      <Command
        label="Palette de commandes"
        loop
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface-alt shadow-[0_24px_60px_-20px_rgba(23,23,23,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search size={16} className="shrink-0 text-ink-faint" aria-hidden />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            autoFocus
            placeholder="Aller à une page…"
            className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            aria-label="Rechercher une page"
          />
          <kbd className="hidden rounded border border-border bg-soft-nude px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-muted sm:block">Échap</kbd>
        </div>
        <Command.List data-lenis-prevent className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-ink-muted">Aucune page ne correspond à « {query} ».</Command.Empty>
          {navSections.map((section) => (
            <Command.Group
              key={section.title}
              heading={section.title}
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:text-[0.625rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint"
            >
              {section.items.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${section.title} ${item.label}`}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink data-[selected=true]:bg-soft-nude"
                >
                  <item.icon size={16} className="shrink-0 text-ink-muted" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  <CornerDownLeft size={13} className="hidden text-ink-faint data-[selected=true]:block" aria-hidden />
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <div className="flex items-center justify-between border-t border-border bg-background px-4 py-2 text-[0.6875rem] text-ink-muted">
          <span>↑ ↓ pour naviguer · Entrée pour ouvrir</span>
          <span className="font-mono">Ctrl K</span>
        </div>
      </Command>
    </div>
  );
}
