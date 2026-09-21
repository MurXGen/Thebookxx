"use client";

import { useEffect, useState } from "react";
import { Download, Truck, Tag, Bell } from "lucide-react";
import { trackEvent } from "@/lib/ga";

// Compact "install our app" banner for the customer's orders list. Shown ONLY
// when the TheBookX PWA is NOT already installed. Clicking Install fires the
// browser's native install prompt (beforeinstallprompt); if the browser can't
// offer one it shows a short "Add to Home screen" hint. UI mirrors the checkout
// sheet (white card, rounded, dark CTA).
export default function PwaInstallPromo({ variant = "bar" }) {
  const [deferred, setDeferred] = useState(null);
  // Already running as an installed app? Then hide the promo entirely. Computed
  // lazily (not in an effect) so it's decided before first paint.
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    const sa =
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches;
    return !!sa || (typeof navigator !== "undefined" && navigator.standalone === true);
  });
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    trackEvent("pwa_install_clicked", { source: `orders_${variant}` });
    if (deferred) {
      deferred.prompt();
      try {
        const choice = await deferred.userChoice;
        if (choice?.outcome === "accepted") setInstalled(true);
      } catch (_) {}
      setDeferred(null);
      return;
    }
    // No native prompt available (iOS / unsupported) → short hint.
    setHint(true);
    setTimeout(() => setHint(false), 5000);
  };

  if (installed) return null;

  return (
    <>
      <div className="pwa-promo-spacer" aria-hidden="true" />
      <div className="pwa-promo pwa-promo-bar">
        <span className="pwa-promo-ic">
          <Download size={18} />
        </span>
        <div className="pwa-promo-txt">
          <strong className="pwa-promo-title">Install the TheBookX app</strong>
          <div className="pwa-promo-feats">
            <span>
              <Truck size={11} /> Live tracking
            </span>
            <span>
              <Tag size={11} /> Member offers
            </span>
            <span>
              <Bell size={11} /> Order updates
            </span>
          </div>
          {hint && (
            <span className="pwa-promo-hint">
              Tap your browser menu → <b>Add to Home screen</b>.
            </span>
          )}
        </div>
        <button type="button" className="pwa-promo-cta" onClick={handleInstall}>
          Install
        </button>
      </div>
    </>
  );
}
