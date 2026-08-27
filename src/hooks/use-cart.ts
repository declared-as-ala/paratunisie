"use client";

import { useMemo, useSyncExternalStore, useCallback } from "react";
import type { ProductSummary } from "@/lib/data/products";
import { openCartDrawer } from "@/hooks/use-cart-drawer";
import { trackAddToCart } from "@/lib/meta-pixel";

const STORAGE_KEY = "paratunisie-cart";
export const FREE_DELIVERY_THRESHOLD = 99_000; // 99 DT in millimes

export type CartItem = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  sizeLabel: string;
  priceMillimes: number;
  quantity: number;
  image: string;
};

type CartState = CartItem[];

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
function getSnapshot(): string {
  return typeof window === "undefined" ? "[]" : (localStorage.getItem(STORAGE_KEY) ?? "[]");
}
function getServerSnapshot(): string {
  return "[]";
}

function parseCart(raw: string): CartState {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(state: CartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitChange();
}

/**
 * Real cart state — no fabricated data. Backed by useSyncExternalStore
 * (same pattern as use-recently-viewed.ts) to avoid setState-in-effect.
 */
export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const state = useMemo(() => parseCart(snapshot), [snapshot]);

  const addItem = useCallback(
    (product: ProductSummary, sizeLabel?: string, quantity = 1) => {
      const size = sizeLabel
        ? product.sizes.find((s) => s.label === sizeLabel) ?? product.sizes[0]
        : product.sizes.find((s) => s.label === product.size) ?? product.sizes[0];

      const current = parseCart(getSnapshot());
      const existingIndex = current.findIndex(
        (item) => item.productId === product.id && item.sizeLabel === size.label,
      );

      if (existingIndex >= 0) {
        current[existingIndex] = {
          ...current[existingIndex],
          quantity: current[existingIndex].quantity + quantity,
        };
      } else {
        current.push({
          productId: product.id,
          slug: product.slug,
          brand: product.brand,
          name: product.name,
          sizeLabel: size.label,
          priceMillimes: size.priceMillimes,
          quantity,
          image: product.image,
        });
      }
      persist(current);

      // Trigger Meta Pixel AddToCart
      trackAddToCart({
        productId: product.id,
        name: product.name,
        quantity,
        priceMillimes: size.priceMillimes,
        category: product.category,
        brand: product.brand,
      });

      // Centralized here — every add-to-cart entry point (product card, PDP,
      // recommendations, routine actions) gets drawer-open + highlight for
      // free, with no per-component wiring.
      openCartDrawer(`${product.id}-${size.label}`);
    },
    [],
  );

  const removeItem = useCallback((productId: string, sizeLabel: string) => {
    const current = parseCart(getSnapshot());
    persist(current.filter((item) => !(item.productId === productId && item.sizeLabel === sizeLabel)));
  }, []);

  const updateQuantity = useCallback((productId: string, sizeLabel: string, quantity: number) => {
    if (quantity < 1) return;
    const current = parseCart(getSnapshot());
    const index = current.findIndex(
      (item) => item.productId === productId && item.sizeLabel === sizeLabel,
    );
    if (index < 0) return;
    current[index] = { ...current[index], quantity };
    persist(current);
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const itemCount = useMemo(
    () => state.reduce((sum, item) => sum + item.quantity, 0),
    [state],
  );

  const subtotal = useMemo(
    () => state.reduce((sum, item) => sum + item.priceMillimes * item.quantity, 0),
    [state],
  );

  const freeDeliveryRemaining = useMemo(
    () => Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
    [subtotal],
  );

  const hasFreeDelivery = freeDeliveryRemaining === 0;

  /**
   * Whether a given product (any size, or a specific one) is already in the
   * cart — lets "Ajouter"/"Ajouté" reflect real cart membership instead of a
   * local flag that goes stale the moment the item is removed elsewhere.
   */
  const isInCart = useCallback(
    (productId: string, sizeLabel?: string) =>
      state.some(
        (item) => item.productId === productId && (sizeLabel === undefined || item.sizeLabel === sizeLabel),
      ),
    [state],
  );

  return useMemo(
    () => ({
      items: state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      itemCount,
      subtotal,
      freeDeliveryRemaining,
      hasFreeDelivery,
    }),
    [state, addItem, removeItem, updateQuantity, clearCart, isInCart, itemCount, subtotal, freeDeliveryRemaining, hasFreeDelivery],
  );
}
