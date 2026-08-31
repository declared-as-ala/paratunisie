"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/tracker";

function inferPageType(pathname: string): string {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/produits/")) return "product";
  if (pathname.startsWith("/shop") || pathname.startsWith("/catalogue")) return "shop";
  if (pathname.startsWith("/marques")) return "brand";
  if (pathname.startsWith("/besoins")) return "category";
  if (pathname.startsWith("/conseils")) return "blog";
  if (pathname.startsWith("/panier")) return "cart";
  if (pathname.startsWith("/checkout")) return "checkout";
  return "other";
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTimeRef = useRef<number>(Date.now());
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    // Skip tracking for admin paths
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) return;

    const fullUrl = typeof window !== "undefined" ? window.location.href : pathname;
    const pageType = inferPageType(pathname);

    // Track previous page duration if there was a previous path
    if (previousPathRef.current && previousPathRef.current !== pathname) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000));
      if (durationSeconds > 0) {
        trackEvent({
          eventType: "PAGE_VIEW",
          pagePath: previousPathRef.current,
          pageType: inferPageType(previousPathRef.current),
          timeOnPageSeconds: durationSeconds,
        });
      }
    }

    // Reset start time for current page
    startTimeRef.current = Date.now();
    previousPathRef.current = pathname;

    // Track initial page view
    trackEvent({
      eventType: "PAGE_VIEW",
      pageUrl: fullUrl,
      pagePath: pathname,
      pageType,
      pageTitle: typeof document !== "undefined" ? document.title : undefined,
    });
  }, [pathname, searchParams]);

  // Handle tab close / reload duration tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pathname.startsWith("/admin")) return;
      const durationSeconds = Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000));
      if (durationSeconds > 0) {
        trackEvent({
          eventType: "PAGE_VIEW",
          pagePath: pathname,
          pageType: inferPageType(pathname),
          timeOnPageSeconds: durationSeconds,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname]);

  return null;
}
