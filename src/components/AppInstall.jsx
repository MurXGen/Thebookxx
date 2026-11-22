"use client";

// "Get the TheBookX app" — one install flow used everywhere:
//   Android  → downloads the native app (APK) + shows the "it's safe" notice
//   Desktop  → the browser's PWA install prompt (Chrome / Edge)
//   iPhone   → Add to Home Screen steps (Safari has no install prompt)
// Pieces: <GetAppButton/> for navbars, <AppPromoCard/> for checkout / order
// pages, and <AppInstallSheet/> (mounted once in the root layout).

import { useEffect, useState } from "react";
import { Bell, Download, MapPin, Smartphone, Zap, X } from "lucide-react";
import { trackEvent } from "@/lib/ga";
import { downloadApk, isAndroidUA, isInAndroidApp, openAppSheet } from "@/lib/appDownload";
import st from "./AppInstall.module.css";

export const APP_BENEFITS = [
  { icon: MapPin, title: "Parcel tracking alerts", text: "Get a notification the moment your order ships, with the India Post ID ready to track." },
  { icon: Bell, title: "Never miss a deal", text: "Reminders for books in your bag and wishlist, plus new ₹1 picks." },
  { icon: Zap, title: "Faster checkout", text: "Your address and number are saved, so ordering takes a few taps." },
  { icon: Smartphone, title: "Light & quick", text: "Opens instantly from your home screen, smoother than the website." },
];
// The installed website (PWA) can't send tracking alerts or reminders.
const PWA_BENEFITS = [
  { icon: Smartphone, title: "One tap away", text: "Opens like an app from your home screen or desktop — no searching for us." },
  { icon: Zap, title: "Faster checkout", text: "Your address and number are remembered, so ordering takes a few taps." },
  { icon: MapPin, title: "Orders in one place", text: "See every order, its delivery date and tracking ID instantly." },
  { icon: Download, title: "No big download", text: "Installs in seconds and stays up to date on its own." },
];
const benefitsFor = (p) => (p === "android" ? APP_BENEFITS : PWA_BENEFITS);

const platformOf = () => {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (isAndroidUA()) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
};

const isInstalled = () => {
  if (typeof window === "undefined") return false;
  if (isInAndroidApp()) return true;
  try {
    return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  } catch {
    return false;
  }
};

// Platform + install action. `ready` is false during SSR / first paint so
// nothing flashes before we know the device.
export function useAppInstall() {
  const [s, setS] = useState({ ready: false, platform: "desktop", installed: false, canPrompt: false });
  useEffect(() => {
    const sync = () =>
      setS({ ready: true, platform: platformOf(), installed: isInstalled(), canPrompt: !!window.__bipEvent });
    const t = setTimeout(sync, 0);
    const onInstalled = () => setS((x) => ({ ...x, installed: true }));
    window.addEventListener("bip-ready", sync);
    window.addEventListener("bip-installed", onInstalled);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(t);
      window.removeEventListener("bip-ready", sync);
      window.removeEventListener("bip-installed", onInstalled);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Returns "ios" when the caller should show Add-to-Home-Screen steps.
  const install = async (source) => {
    if (s.platform === "android") {
      trackEvent("apk_download_clicked", { source });
      downloadApk();
      return "done";
    }
    const bip = window.__bipEvent;
    if (bip) {
      trackEvent("pwa_install_clicked", { source });
      bip.prompt();
      try {
        const c = await bip.userChoice;
        trackEvent(c?.outcome === "accepted" ? "pwa_install_accepted" : "pwa_install_dismissed", { source });
        if (c?.outcome === "accepted") setS((x) => ({ ...x, installed: true }));
      } catch {}
      window.__bipEvent = null;
      return "done";
    }
    return s.platform === "ios" ? "ios" : "manual";
  };
  return { ...s, install };
}

const ctaLabel = (p) => (p === "android" ? "Download app" : p === "ios" ? "Add to Home Screen" : "Install app");

/** Compact pill for navbars. Hidden once the app is installed. */
export function GetAppButton({ source = "navbar", className = "", compact = false }) {
  const { ready, installed, platform, canPrompt } = useAppInstall();
  // Desktop browsers without an install prompt (Safari / Firefox) can't install.
  if (!ready || installed || (platform === "desktop" && !canPrompt)) return null;
  return (
    <button
      type="button"
      className={`${st.pill}${compact ? ` ${st.pillSm}` : ""} ${className}`}
      onClick={() => {
        trackEvent("app_sheet_opened", { source });
        openAppSheet(source);
      }}
      data-no-busy
      aria-label="Get the TheBookX app"
    >
      <Download size={14} strokeWidth={2.4} />
      <span>{compact ? "App" : "Get app"}</span>
    </button>
  );
}

/** Inline card with the benefits — checkout, order placed, order details. */
export function AppPromoCard({ source = "card", title, compact = false }) {
  const { ready, installed, platform, canPrompt, install } = useAppInstall();
  const [iosSteps, setIosSteps] = useState(false);
  if (!ready || installed || (platform === "desktop" && !canPrompt)) return null;
  const all = benefitsFor(platform);
  const list = compact ? all.slice(0, 3) : all;
  return (
    <section className={st.card} aria-label="Get the TheBookX app">
      <div className={st.cardHead}>
        <span className={st.logo} aria-hidden="true">
          <Smartphone size={18} />
        </span>
        <div>
          <h3 className={st.cardTitle}>{title || (platform === "android" ? "Track your orders in the app" : "Get the TheBookX app")}</h3>
          <p className={st.cardSub}>{platform === "android" ? "Free Android app · about 35 MB" : "Free · installs in seconds"}</p>
        </div>
      </div>
      <ul className={st.benefits}>
        {list.map(({ icon: Icon, title: t, text }) => (
          <li key={t}>
            <Icon size={15} className={st.bIc} />
            <span>
              <b>{t}</b> {text}
            </span>
          </li>
        ))}
      </ul>
      {iosSteps ? <IosSteps /> : null}
      <button
        type="button"
        className={st.cta}
        data-no-busy
        onClick={async () => {
          const r = await install(source);
          if (r === "ios" || r === "manual") setIosSteps(true);
        }}
      >
        <Download size={16} /> {ctaLabel(platform)}
      </button>
    </section>
  );
}

function IosSteps() {
  return (
    <ol className={st.steps}>
      <li>
        Tap the <b>Share</b> button in Safari’s toolbar.
      </li>
      <li>
        Choose <b>Add to Home Screen</b>, then tap <b>Add</b>.
      </li>
    </ol>
  );
}

/** Bottom sheet opened by GetAppButton / openAppSheet(). Mount once. */
export default function AppInstallSheet() {
  const [open, setOpen] = useState(null); // source string when open
  const [iosSteps, setIosSteps] = useState(false);
  const { platform, install } = useAppInstall();
  useEffect(() => {
    const on = (e) => {
      setIosSteps(false);
      setOpen(e.detail?.source || "sheet");
    };
    window.addEventListener("tbx:app-sheet", on);
    return () => window.removeEventListener("tbx:app-sheet", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  if (!open) return null;
  return (
    <div className={st.backdrop} role="dialog" aria-modal="true" aria-labelledby="app-sheet-title" onClick={() => setOpen(null)}>
      <div className={st.sheet} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={st.close} onClick={() => setOpen(null)} aria-label="Close">
          <X size={18} />
        </button>
        <span className={st.logoLg} aria-hidden="true">
          <Smartphone size={24} />
        </span>
        <h2 id="app-sheet-title" className={st.sheetTitle}>
          Get the TheBookX app
        </h2>
        <p className={st.sheetSub}>Everything on the website, plus:</p>
        <ul className={st.benefits}>
          {benefitsFor(platform).map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={16} className={st.bIc} />
              <span>
                <b>{title}</b> {text}
              </span>
            </li>
          ))}
        </ul>
        {iosSteps ? <IosSteps /> : null}
        <button
          type="button"
          className={st.cta}
          data-no-busy
          onClick={async () => {
            const r = await install(open);
            if (r === "ios" || r === "manual") setIosSteps(true);
            else setOpen(null);
          }}
        >
          <Download size={16} /> {ctaLabel(platform)}
        </button>
        {platform === "android" ? <p className={st.fine}>Free · about 35 MB · no Play Store needed</p> : null}
      </div>
    </div>
  );
}
