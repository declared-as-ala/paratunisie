"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Cart drawer open/close + "which row was just added" state. Split from
 * use-cart.ts so pages that only need cart data (checkout, /panier) don't
 * re-render on drawer open/close. Same useSyncExternalStore pattern as
 * use-cart.ts and use-recently-viewed.ts — one shared source, not a
 * React Context, for consistency with the rest of this codebase.
 */

let isOpen = false;
let lastAddedKey: string | null = null;
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
function getOpenSnapshot() {
  return isOpen;
}
function getLastAddedSnapshot() {
  return lastAddedKey;
}
function getServerSnapshot() {
  return false;
}
function getServerLastAdded() {
  return null;
}

/** Called from useCart's addItem — the single place that triggers the open. */
export function openCartDrawer(highlightKey?: string) {
  isOpen = true;
  if (highlightKey) {
    lastAddedKey = highlightKey;
    // Clear the highlight after it's had time to be seen, without leaving a
    // stale key around to falsely re-highlight a later render.
    setTimeout(() => {
      if (lastAddedKey === highlightKey) {
        lastAddedKey = null;
        emitChange();
      }
    }, 1200);
  }
  emitChange();
}

export function closeCartDrawer() {
  isOpen = false;
  emitChange();
}

export function useCartDrawer() {
  const open = useSyncExternalStore(subscribe, getOpenSnapshot, getServerSnapshot);
  const lastAdded = useSyncExternalStore(subscribe, getLastAddedSnapshot, getServerLastAdded);
  const setOpen = useCallback((next: boolean) => {
    isOpen = next;
    emitChange();
  }, []);

  return { open, setOpen, lastAdded };
}
