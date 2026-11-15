"use client";

import { useEffect } from "react";

/**
 * Loads the heavy third-party tracker files (gtag.js and fbevents.js) late, without losing any event.
 *
 * The inline stubs rendered in layout.tsx define `window.dataLayer`/`gtag` and `window.fbq` immediately, so every call made
 * before these files load (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase conversion) is queued and replayed by
 * the real scripts when they arrive. Only the download and execution of the files is postponed.
 *
 * Trigger = earliest of: first user interaction, the page being hidden/left, or a fallback timer after the window load event.
 * Enabled only when the web image is built with NEXT_PUBLIC_DEFER_TRACKERS=1 (build-time, because cached pages are prerendered);
 * unset = legacy `afterInteractive` behaviour. Rollback = redeploy the previous image tag.
 */
const GADS_SRC = "https://www.googletagmanager.com/gtag/js?id=AW-18415809993";
const FB_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const;

let started = false;

function inject(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function loadTrackersNow() {
  if (started) return;
  started = true;
  inject(GADS_SRC);
  inject(FB_SRC);
}

export function DeferredTrackers({ fallbackMs = 5000 }: { fallbackMs?: number }) {
  useEffect(() => {
    if (started) return;
    // Purchase-path and paid-ad landing pages: conversions and attribution matter more than the few KB saved, load immediately.
    if (/^\/(panier|checkout|paiement|commande|pack-anti-stress)(\/|$)/.test(window.location.pathname)) {
      loadTrackersNow();
      return;
    }
    let timer: number | undefined;

    const cleanup = () => {
      INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, go));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", go);
      window.removeEventListener("load", onLoad);
      if (timer) window.clearTimeout(timer);
    };
    function go() {
      cleanup();
      loadTrackersNow();
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") go();
    }
    function onLoad() {
      timer = window.setTimeout(go, fallbackMs);
    }

    INTERACTION_EVENTS.forEach((name) => window.addEventListener(name, go, { once: true, passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", go);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return cleanup;
  }, [fallbackMs]);

  return null;
}
