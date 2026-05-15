// components/TrackingProvider.jsx
"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { getSessionId, trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";
import { usePathname, useSearchParams } from "next/navigation";

const TrackingContext = createContext(null);

export const useTracking = () => {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking must be used within TrackingProvider");
  return ctx;
};

export function TrackingProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef(null);

  // Track page views on route change
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      const pageName = pathname === "/" ? "homepage" : pathname.slice(1);

      // Check if gtag is available before sending
      if (typeof window !== "undefined" && window.gtag) {
        trackFunnelEvent(EVENTS.PAGE_VIEW, {
          page_name: pageName,
          page_url: pathname,
          referrer: prevPathRef.current,
        });
      }
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  // Track user unlock status changes (without interfering with GA)
  useEffect(() => {
    const handleStorageChange = () => {
      const unlockData = JSON.parse(
        localStorage.getItem("oneRupeeOffer") || "{}",
      );
      if (unlockData.permanentUnlocked && window.gtag) {
        trackFunnelEvent(EVENTS.UNLOCK_PERMANENT, {
          cart_total: JSON.parse(localStorage.getItem("cart") || "[]").reduce(
            (sum, item) => sum + (item.price || 0) * item.qty,
            0,
          ),
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <TrackingContext.Provider value={{ trackEvent: trackFunnelEvent }}>
      {children}
    </TrackingContext.Provider>
  );
}
