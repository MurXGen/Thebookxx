"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = "G-VZX7GSTR9Z";
const LAST_VISIT_KEY = "tbx_last_visit";
const VISIT_COUNT_KEY = "tbx_visit_count";

// Fire a GA event, retrying briefly if the GA library hasn't loaded yet so
// early events aren't silently dropped.
function safeGtag(...args) {
  if (typeof window === "undefined") return;
  let tries = 0;
  const send = () => {
    if (typeof window.gtag === "function") {
      window.gtag(...args);
      return;
    }
    if (tries++ < 20) setTimeout(send, 400); // retry up to ~8s
  };
  send();
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const scrollFired = useRef({}); // milestones already sent for this page
  const sessionInit = useRef(false);

  // ── Page view on every route change ──
  useEffect(() => {
    safeGtag("config", GA_ID, { page_path: pathname });
    scrollFired.current = {}; // reset scroll milestones for the new page
  }, [pathname]);

  // ── Returning-visitor / recency (fires once per mount) ──
  useEffect(() => {
    if (sessionInit.current) return;
    sessionInit.current = true;
    try {
      const now = Date.now();
      const last = parseInt(localStorage.getItem(LAST_VISIT_KEY) || "0", 10);
      const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);

      if (last > 0) {
        const days = Math.floor((now - last) / 86400000);
        const hours = Math.floor((now - last) / 3600000);
        let bucket = "same_day";
        if (days >= 30) bucket = "30d_plus";
        else if (days >= 7) bucket = "7_30d";
        else if (days >= 2) bucket = "2_7d";
        else if (days >= 1) bucket = "1d";
        else if (hours >= 1) bucket = "hours";
        safeGtag("event", "returning_visitor", {
          days_inactive: days,
          hours_inactive: hours,
          recency_bucket: bucket,
          visit_number: count + 1,
        });
      } else {
        safeGtag("event", "first_visit_custom", { visit_number: 1 });
      }
      localStorage.setItem(LAST_VISIT_KEY, String(now));
      localStorage.setItem(VISIT_COUNT_KEY, String(count + 1));
    } catch {}
  }, []);

  // ── Scroll-depth milestones (25 / 50 / 75 / 100 %) ──
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.round((window.scrollY / scrollable) * 100);
      [25, 50, 75, 100].forEach((m) => {
        if (pct >= m && !scrollFired.current[m]) {
          scrollFired.current[m] = true;
          safeGtag("event", "scroll_depth", {
            percent: m,
            page_path: pathname,
          });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
