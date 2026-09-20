"use client";

import { useEffect, useState } from "react";
import { Download, Truck, Tag, Bell } from "lucide-react";
import { trackEvent } from "@/lib/ga";

// Promotional "install our app" banner shown to customers on the orders list
// (fixed bottom bar) and order-detail page (inline card). It is ALWAYS shown —
// even when the app is already installed — as a reminder of the app's value.
// When the browser exposes a native install prompt we use it; otherwise we show
// a short "add to home screen" hint. UI mirrors the checkout sheet (white card,
// rounded, dark CTA) for consistency.
export default function PwaInstallPromo({ variant = "bar" }) {
  const [deferred, setDeferred] = useState(null);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const handleInstall = async () => {
    trackEvent("pwa_install_clicked", { source: `orders_${variant}` });
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch (_) {}
      setDeferred(null);
      return;
    }
    // No native prompt (already installed / iOS / unsupported) → show a hint.
    setHint(true);
    setTimeout(() => setHint(false), 5000);
  };

  const Body = (
    <>
      <span className="pwa-promo-ic">
        <Download size={variant === "bar" ? 20 : 22} />
      </span>
      <div className="pwa-promo-txt">
        <strong className="pwa-promo-title">Install the TheBookX app</strong>
        <span className="pwa-promo-sub">
          Tracking details, offers &amp; order updates — all in one place.
        </span>
        <div className="pwa-promo-feats">
          <span>
            <Truck size={12} /> Live tracking
          </span>
          <span>
            <Tag size={12} /> Member offers
          </span>
          <span>
            <Bell size={12} /> Order updates
          </span>
        </div>
        {hint && (
          <span className="pwa-promo-hint">
            Open your browser menu and tap <b>“Add to Home screen”</b> to
            install.
          </span>
        )}
      </div>
      <button
        type="button"
        className="pwa-promo-cta"
        onClick={handleInstall}
      >
        Install
      </button>
    </>
  );

  if (variant === "card") {
    return <div className="pwa-promo pwa-promo-card">{Body}</div>;
  }

  // Fixed bottom bar (+ in-flow spacer so it never covers the last order).
  return (
    <>
      <div className="pwa-promo-spacer" aria-hidden="true" />
      <div className="pwa-promo pwa-promo-bar">{Body}</div>
    </>
  );
}
