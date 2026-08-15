"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getProductBySlug, type ProductSummary } from "@/lib/data/products";

const STORAGE_KEY = "paratunisie-recently-viewed";
const MAX_ITEMS = 8;

let listeners: (() => void)[] = [];
function emitChange() {
  listeners.forEach((listener) => listener());
}
function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}
function getSnapshot() {
  // localStorage.getItem returns an equal string until the key changes,
  // so this stays referentially stable for useSyncExternalStore.
  return typeof window === "undefined" ? "[]" : (localStorage.getItem(STORAGE_KEY) ?? "[]");
}
function getServerSnapshot() {
  return "[]";
}

function parseSlugs(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Real browsing history (this device, this user), not fabricated behavioral
 * data — distinct from "frequently bought together," which we deliberately
 * don't show (DECISIONS.md D-0012). Backed by useSyncExternalStore rather
 * than setState-in-effect, since localStorage is the external system this
 * hook synchronizes with.
 */
export function useRecentlyViewed(currentSlug: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Side effect: record this view. A plain write + notify, no setState here.
  useEffect(() => {
    const slugs = parseSlugs(getSnapshot());
    const next = [currentSlug, ...slugs.filter((slug) => slug !== currentSlug)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }, [currentSlug]);

  return useMemo(
    () =>
      parseSlugs(snapshot)
        .filter((slug) => slug !== currentSlug)
        .map((slug) => getProductBySlug(slug))
        .filter((product): product is ProductSummary => Boolean(product)),
    [snapshot, currentSlug],
  );
}
