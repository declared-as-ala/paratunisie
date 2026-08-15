"use client";

import { useMemo, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "paratunisie-wishlist";

let listeners: Array<() => void> = [];
let wishlistState: string[] = [];

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot(): string {
  return JSON.stringify(wishlistState);
}

function getServerSnapshot(): string {
  return "[]";
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        wishlistState = parsed.filter((id: unknown): id is string => typeof id === "string");
      }
    }
  } catch {
    // localStorage unavailable
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistState));
  } catch {
    // localStorage unavailable
  }
}

// Hydrate on first import (client-side only)
if (typeof window !== "undefined") {
  hydrate();
}

function setWishlist(next: string[]) {
  wishlistState = next;
  persist();
  emitChange();
}

export function useWishlist() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const ids: string[] = useMemo(() => {
    try {
      return JSON.parse(snapshot);
    } catch {
      return [];
    }
  }, [snapshot]);

  const toggle = useCallback((productId: string) => {
    setWishlist(
      ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId],
    );
  }, [ids]);

  const add = useCallback((productId: string) => {
    if (!ids.includes(productId)) {
      setWishlist([...ids, productId]);
    }
  }, [ids]);

  const remove = useCallback((productId: string) => {
    setWishlist(ids.filter((id) => id !== productId));
  }, [ids]);

  const isWishlisted = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, add, remove, isWishlisted, count: ids.length };
}
