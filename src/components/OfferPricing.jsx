"use client";

// Applies the post-offer price rise for this device and re-renders the app once
// so every module shows the same price. First render always matches the server
// (base prices); the rise is applied right after mount, or the moment the
// device's 2-hour offer ends while they're on the site.

import { Fragment, useEffect, useState } from "react";
import { books } from "@/utils/book";
import {
  applyPriceRise,
  revertPriceRise,
  pricesRaised,
  logExpiredOnce,
  offerState,
  syncOfferFromSheet,
  PRICES_EVENT,
} from "@/lib/offerTimer";

export default function OfferPricing({ children }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let timer;
    const refresh = () => {
      window.dispatchEvent(new Event(PRICES_EVENT));
      setV((n) => n + 1);
    };
    const schedule = () => {
      clearTimeout(timer);
      const s = offerState();
      if (!s.started) return;
      if (s.expired) {
        if (!pricesRaised()) {
          applyPriceRise(books);
          logExpiredOnce();
          refresh();
        }
        return;
      }
      // Offer running (or extended from the sheet after it had ended).
      if (pricesRaised()) {
        revertPriceRise(books);
        refresh();
      }
      // setTimeout caps at ~24.8 days; longer extensions re-check on next visit.
      timer = setTimeout(schedule, Math.min(Math.max(0, s.endsAt - Date.now()) + 50, 2 ** 31 - 1));
    };
    const sync = async (force = false) => {
      if (await syncOfferFromSheet({ force })) {
        const raisedBefore = pricesRaised();
        schedule();
        // End moved but prices didn't flip → still redraw so the countdown
        // shows the new time straight away.
        if (raisedBefore === pricesRaised()) refresh();
      }
    };
    const t0 = setTimeout(() => {
      schedule();
      sync();
    }, 0);
    const onStart = () => schedule();
    // Back from WhatsApp (after "Extend offer for me") → check the sheet.
    const onVisible = () => document.visibilityState === "visible" && sync();
    window.addEventListener("tbx:offer-started", onStart);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(t0);
      clearTimeout(timer);
      window.removeEventListener("tbx:offer-started", onStart);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <Fragment key={v}>{children}</Fragment>;
}
