// lib/trackingHooks.js
import { useEffect, useRef, useCallback } from "react";
import { trackFunnelEvent } from "./analytics";
import { EVENTS } from "./trackingEvents";

// Track page view
export const useTrackPageView = (pageName) => {
  useEffect(() => {
    trackFunnelEvent(EVENTS.PAGE_VIEW, { page_name: pageName });
  }, [pageName]);
};

// Track element view (when component becomes visible)
export const useTrackView = (eventName, params = {}, enabled = true) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (enabled && !hasTracked.current) {
      hasTracked.current = true;
      trackFunnelEvent(eventName, params);
    }
  }, [eventName, params, enabled]);
};

// Track click with debouncing
export const useTrackClick = (eventName, getParams = () => ({})) => {
  return useCallback(() => {
    trackFunnelEvent(eventName, getParams());
  }, [eventName, getParams]);
};

// Track cart value changes (debounced)
export const useTrackCartValue = (cartTotal) => {
  const prevTotalRef = useRef(cartTotal);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const prevTotal = prevTotalRef.current;
      const milestones = [151, 299, 400, 599, 799];

      for (const milestone of milestones) {
        if (prevTotal < milestone && cartTotal >= milestone) {
          trackFunnelEvent(EVENTS.CART_TOTAL_MILESTONE, {
            threshold: milestone,
            cart_total: cartTotal,
          });
        }
      }

      prevTotalRef.current = cartTotal;
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cartTotal]);
};
