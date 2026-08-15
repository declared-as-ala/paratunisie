"use client";

// Namespace shim — the shared ConfirmModal lives in @paratunisie/ui
// (SPRINT A). Kept so existing imports (`@/components/confirm-modal`) keep
// working; new code should import from "@paratunisie/ui" directly.
export { ConfirmModal } from "@paratunisie/ui";
