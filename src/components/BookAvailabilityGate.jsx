"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

// Rights-holder display condition for certain titles: the page is only
// available on Saturday & Sunday (all day), and 6pm–9pm on weekdays. Outside
// those windows the URL returns the 404 page. Times use the visitor's browser
// clock. Keyed by slug (slugify(name)).
const GATED_SLUGS = new Set([
  "we-are-there-for-each-other",
  "technical-analysis-of-financial-markets",
]);

// Weekday evening window (24h local): 18:00–20:59.
const WEEKDAY_START_HOUR = 18;
const WEEKDAY_END_HOUR = 21; // exclusive

export function isBookVisibleNow(date = new Date()) {
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return true; // weekends: all day
  const h = date.getHours();
  return h >= WEEKDAY_START_HOUR && h < WEEKDAY_END_HOUR;
}

export function isGatedSlug(slug) {
  return GATED_SLUGS.has(String(slug || "").toLowerCase());
}

// Wraps a gated book page. Renders children only inside the allowed window
// (checked on the client against the browser clock); otherwise shows the 404.
export default function BookAvailabilityGate({ slug, children }) {
  const gated = isGatedSlug(slug);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!gated) return children;
  // Before hydration we can't read the browser clock — render nothing to avoid
  // a hydration mismatch, then decide once mounted.
  if (!mounted) return null;
  if (!isBookVisibleNow()) notFound();
  return children;
}
