"use client";

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
};

export type CustomerSession = {
  user: CustomerUser;
  token?: string;
};

const STORAGE_KEY = "paratunisie_customer_session";

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCustomerSession(session: CustomerSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("paratunisie_auth_changed"));
  } catch (err) {
    console.error("Failed to save customer session:", err);
  }
}

export function clearCustomerSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("paratunisie_auth_changed"));
  } catch (err) {
    console.error("Failed to clear customer session:", err);
  }
}
