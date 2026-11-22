"use client";

import { useEffect, useState } from "react";
import { Download, Truck, Tag, Bell } from "lucide-react";
import { trackEvent } from "@/lib/ga";
import { openAppSheet } from "@/components/AppInstall";

// Compact "install our app" banner for the customer's orders list. Shown ONLY
// when the TheBookX PWA is NOT already installed. Clicking Install fires the
// browser's native install prompt (beforeinstallprompt); if the browser can't
// offer one it shows a short "Add to Home screen" hint. UI mirrors the checkout
// sheet (white card, rounded, dark CTA).
export default function PwaInstallPromo({ variant = "bar" }) {
  // Prefer a globally-captured prompt (RegisterSW stashes it the instant Chrome
  // fires beforeinstallprompt — which can happen before this mounts).
  const [deferred, setDeferred] = useState(
    typeof window !== "undefined" ? window.__bipEvent || null : null,
  );
  // Already running as an installed app? Then hide the promo entirely. Computed
  // lazily (not in an effect) so it's decided before first paint.
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    const sa =
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches;
    return !!sa || (typeof navigator !== "undefined" && navigator.standalone === true);
  });

  useEffect(() => {
    const onReady = () => setDeferred(window.__bipEvent || null);
    const onPrompt = (e) => {
      e.preventDefault();
      window.__bipEvent = e;
      setDeferred(e);
    };
    const onInstalled = () => {
      window.__bipEvent = null;
      setInstalled(true);
    };
    window.addEventListener("bip-ready", onReady);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // If the PWA is already installed on this device — even while viewing in a
    // normal browser tab (not standalone) — don't show the promo at all.
    try {
      navigator.getInstalledRelatedApps?.().then((apps) => {
        if (Array.isArray(apps) && apps.length > 0) setInstalled(true);
      });
    } catch (_) {}

    return () => {
      window.removeEventListener("bip-ready", onReady);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Opens the shared install sheet (browser prompt or short steps).
  const handleInstall = () => {
    trackEvent("app_sheet_opened", { source: `orders_${variant}` });
    openAppSheet(`orders_${variant}`);
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
        </div>
        <button type="button" className="pwa-promo-cta" onClick={handleInstall}>
          Install
        </button>
      </div>
    </>
  );
}
