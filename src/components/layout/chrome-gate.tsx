"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { WHEY_LANDING_PATH, PACK_ANTI_STRESS_PATH } from "@/lib/landing";

/**
 * Direct-order landing pages render their own minimal chrome.
 * Everything wrapped here (site header, footer, mobile tab bar) disappears there
 * so paid visitors only see the product and the order form.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding =
    pathname === WHEY_LANDING_PATH ||
    pathname.startsWith(`${WHEY_LANDING_PATH}/`) ||
    pathname === PACK_ANTI_STRESS_PATH ||
    pathname.startsWith(`${PACK_ANTI_STRESS_PATH}/`);

  useEffect(() => {
    document.body.classList.toggle("lp-mode", isLanding);
    return () => document.body.classList.remove("lp-mode");
  }, [isLanding]);

  return isLanding ? null : <>{children}</>;
}
