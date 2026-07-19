"use client";

import { useEffect, useState } from "react";

/**
 * Small shiny reward pill that pops up just above the cart offer strip
 * (.offer-strip) with a quick vibrate when the cart crosses into a new offer
 * tier. Triggered by the global "tbx:offer-unlocked" event from the store.
 */
export default function OfferCelebration() {
  const [state, setState] = useState(null); // { reward, id, style }

  useEffect(() => {
    const onUnlock = (e) => {
      const reward = e.detail?.reward || "Offer";
      // Anchor just ABOVE the on-screen cart offer strip. There can be more
      // than one .offer-strip in the DOM, so pick the bottom-most visible one.
      let style;
      const vh = window.innerHeight;
      const strips = Array.from(document.querySelectorAll(".offer-strip"))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.top < vh && r.bottom > 0)
        .sort((a, b) => b.top - a.top);
      const r = strips[0];
      if (r) {
        style = {
          left: `${r.left + r.width / 2}px`,
          // pill's bottom sits a clear gap above the strip's top edge
          bottom: `${Math.max(12, vh - r.top + 14)}px`,
        };
      }
      // A little haptic "vibrate" on supported devices.
      try {
        navigator.vibrate?.([18, 40, 22]);
      } catch {
        /* ignore */
      }
      setState({ reward, id: Date.now(), style });
    };
    window.addEventListener("tbx:offer-unlocked", onUnlock);
    return () => window.removeEventListener("tbx:offer-unlocked", onUnlock);
  }, []);

  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => {
      setState((s) => (s && s.id === state.id ? null : s));
    }, 2000);
    return () => clearTimeout(t);
  }, [state]);

  if (!state) return null;

  return (
    <div
      className="offer-pop"
      role="status"
      key={state.id}
      style={state.style}
    >
      <span className="offer-pop-emoji">🎉</span>
      <span className="offer-pop-text">{state.reward} unlocked!</span>
    </div>
  );
}
