"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Full-screen tools that must keep native scrolling (none yet; add a path prefix here, e.g. a POS screen). */
const NATIVE_SCROLL_PATHS: string[] = [];

/** Elements that own their scrolling: dialogs, drawers, menus and anything tagged data-lenis-prevent. */
const OWN_SCROLL = '[data-lenis-prevent], [role="dialog"], [aria-modal="true"], [data-slot="drawer-panel"], [data-slot="dialog-content"], [cmdk-list]';

/**
 * Lenis smooth scrolling for the admin window.
 * - skipped for reduced motion and for the native-scroll paths above;
 * - steps aside (stop) while any dialog/drawer is open, resumes when it closes;
 * - nested scroll areas keep native scrolling through the `prevent` hook.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (NATIVE_SCROLL_PATHS.some((p) => pathname.startsWith(p))) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      smoothWheel: true,
      anchors: true,
      prevent: (node) => node.closest(OWN_SCROLL) !== null,
    });

    const sync = () => {
      const modalOpen = document.querySelector('[role="dialog"], [aria-modal="true"], [data-slot="drawer-panel"], [data-slot="dialog-content"]') !== null;
      if (modalOpen) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    sync();

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
