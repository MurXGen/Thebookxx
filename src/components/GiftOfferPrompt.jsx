"use client";

// First visit to the home or a book page → the "Free delivery + free
// bookmarks" gift pop-up (same card as the bag's). Shown once per device; if
// they claim it, free delivery drops to ₹149 on this device and the bag adds
// the free bookmarks. Not shown again once claimed or dismissed.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
// The popup's code downloads only when it's about to show.
let popupP = null;
const loadPopup = () => (popupP ||= import("@/components/WelcomeCouponPopup").then((m) => m.default));
import { claimGiftOffer, freeDeliveryOfferOn, FREE_DELIVERY_OFFER_AT } from "@/utils/cartOffers";
import { trackOfferClaim } from "@/utils/cartEvents";
import { showToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/ga";

const SEEN_KEY = "tbx_gift_prompt_seen";
const DELAY_MS = 2500; // after the first scroll / tap

const onPromptPage = (p = "") => p === "/" || p.startsWith("/books/");

// One popup at a time: while this gift popup is waiting to show (or showing),
// other auto popups (the scratch-card number modal) hold back, then open after
// it closes. See waitForGiftPrompt().
const setGiftPending = (on) => {
  if (typeof window === "undefined") return;
  const was = !!window.__tbxGiftPending;
  window.__tbxGiftPending = on;
  if (was && !on) window.dispatchEvent(new Event("tbx:gift-done"));
};

/** Runs `fn` now, or once the first-visit gift popup has been dismissed. */
export function waitForGiftPrompt(fn) {
  if (typeof window === "undefined" || !window.__tbxGiftPending) return fn();
  const go = () => setTimeout(fn, 700);
  window.addEventListener("tbx:gift-done", go, { once: true });
  return () => window.removeEventListener("tbx:gift-done", go);
}

export default function GiftOfferPrompt() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [Popup, setPopup] = useState(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!onPromptPage(pathname)) return;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return;
    }
    if (seen || freeDeliveryOfferOn()) return;
    setGiftPending(true);
    // Wait until the visitor starts browsing (first scroll / tap / key), then
    // show it a moment later — it no longer covers the page while it loads.
    let t;
    const EVENTS = ["scroll", "pointerdown", "keydown", "touchstart"];
    const arm = () => {
      EVENTS.forEach((e) => window.removeEventListener(e, arm, true));
      loadPopup().then((C) => setPopup(() => C));
      t = setTimeout(() => {
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch {}
        setOpen(true);
        trackEvent("gift_prompt_shown", { page: pathname });
      }, DELAY_MS);
    };
    EVENTS.forEach((e) => window.addEventListener(e, arm, { capture: true, passive: true }));
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, arm, true));
      clearTimeout(t);
      // Left the page before it showed: let other popups go.
      if (!shownRef.current) setGiftPending(false);
    };
  }, [pathname]);

  useEffect(() => {
    if (open) shownRef.current = true;
    // Closed (claimed or "Maybe later") → the next popup may show.
    else if (shownRef.current) setGiftPending(false);
  }, [open]);

  const claim = () => {
    setOpen(false);
    claimGiftOffer();
    trackOfferClaim("Free delivery + bookmarks");
    trackEvent("gift_prompt_claimed", { page: pathname });
    showToast(
      `Free delivery from ₹${FREE_DELIVERY_OFFER_AT} + 2 free bookmarks unlocked. They apply in your bag.`,
      "success",
      { title: "Gifts claimed 🎁" },
    );
  };

  if (!onPromptPage(pathname) || !Popup) return null;
  const WelcomeCouponPopup = Popup;
  return (
    <WelcomeCouponPopup
      variant="bookmark"
      open={open}
      onApply={claim}
      onClose={() => setOpen(false)}
      freeBookmarks={2}
      deliveryFree
      freeAt={FREE_DELIVERY_OFFER_AT}
    />
  );
}
