"use client";

// Namespace shim — the shared ToastProvider/useToast live in @paratunisie/ui
// (SPRINT A). Kept so existing imports (`@/components/toast`) keep working;
// new code should import from "@paratunisie/ui" directly.
export { ToastProvider, useToast } from "@paratunisie/ui";
