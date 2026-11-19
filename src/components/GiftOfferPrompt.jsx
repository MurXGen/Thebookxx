"use client";

// First visit to the home or a book page → the "Free delivery + free
// bookmarks" gift pop-up (same card as the bag's). Shown once per device; if
// they claim it, free delivery drops to ₹149 on this device and the bag adds
// the free bookmarks. Not shown again once claimed or dismissed.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import WelcomeCouponPopup from "@/components/WelcomeCouponPopup";
import { claimGiftOffer, freeDeliveryOfferOn, FREE_DELIVERY_OFFER_AT } from "@/utils/cartOffers";
import { trackOfferClaim } from "@/utils/cartEvents";
import { showToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/ga";

const SEEN_KEY = "tbx_gift_prompt_seen";
const DELAY_MS = 3500;

const onPromptPage = (p = "") => p === "/" || p.startsWith("/books/");

export default function GiftOfferPrompt() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!onPromptPage(pathname)) return;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return;
    }
    if (seen || freeDeliveryOfferOn()) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setOpen(true);
      trackEvent("gift_prompt_shown", { page: pathname });
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

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

  if (!onPromptPage(pathname)) return null;
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
