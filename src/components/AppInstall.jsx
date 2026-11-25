"use client";
import "./AppInstall.styles.css";

// "Install TheBookX" — the website installed as an app (PWA), everywhere:
//   Chrome / Edge (Android + desktop) → the browser's own install prompt
//   iPhone / iPad                     → Add to Home Screen steps
//   browsers with no prompt           → short menu steps
// Every install button opens ONE sheet (<AppInstallSheet/>, mounted once in the
// root layout) via openAppSheet(source); it uses the same slide-up sheet look
// as the notification sheets (cdp / psh classes in globals.css).
// Pieces: <GetAppButton/> for navbars, <AppPromoCard/> for bag / order pages.

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Download, MapPin, Zap, X, CheckCircle2, Smartphone } from "lucide-react";
import { trackEvent } from "@/lib/ga";
import st from "./AppInstall.module.css";

const noopSub = () => () => {};

export const APP_BENEFITS = [
  { icon: Zap, title: "Opens instantly", text: "One tap from your home screen" },
  { icon: Bell, title: "Tracking alerts", text: "Live parcel updates with a link" },
  { icon: MapPin, title: "Orders in one place", text: "Dates and tracking at a glance" },
  { icon: Download, title: "Tiny install", text: "No store, updates on its own" },
];

export const openAppSheet = (source = "unknown") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tbx:app-sheet", { detail: { source } }));
};

const platformOf = () => {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
};

const isInstalled = () => {
  if (typeof window === "undefined") return false;
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
      setS((x) => ({ ...x, ready: true, platform: platformOf(), installed: x.installed || isInstalled(), canPrompt: !!window.__bipEvent }));
    const t = setTimeout(sync, 0);
    const onInstalled = () => setS((x) => ({ ...x, installed: true, canPrompt: false }));
    window.addEventListener("bip-ready", sync);
    window.addEventListener("bip-installed", onInstalled);
    window.addEventListener("appinstalled", onInstalled);
    try {
      navigator.getInstalledRelatedApps?.().then((apps) => {
        if (Array.isArray(apps) && apps.length) onInstalled();
      });
    } catch {}
    return () => {
      clearTimeout(t);
      window.removeEventListener("bip-ready", sync);
      window.removeEventListener("bip-installed", onInstalled);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // → "installed" | "dismissed" | "steps" (show the manual steps)
  const install = async (source) => {
    const bip = window.__bipEvent;
    if (!bip) return "steps";
    trackEvent("pwa_install_clicked", { source });
    bip.prompt();
    let outcome = "dismissed";
    try {
      outcome = (await bip.userChoice)?.outcome || "dismissed";
    } catch {}
    window.__bipEvent = null;
    trackEvent(outcome === "accepted" ? "pwa_install_accepted" : "pwa_install_dismissed", { source });
    if (outcome === "accepted") {
      setS((x) => ({ ...x, installed: true, canPrompt: false }));
      return "installed";
    }
    setS((x) => ({ ...x, canPrompt: false }));
    return "dismissed";
  };
  return { ...s, install };
}

// Show install entry points? Phones always (prompt or steps); desktop only
// when the browser can actually install.
const offerInstall = ({ ready, installed, platform, canPrompt }) =>
  ready && !installed && (platform !== "desktop" || canPrompt);

/** Compact pill for navbars. Hidden once installed. */
export function GetAppButton({ source = "navbar", className = "", compact = false }) {
  const state = useAppInstall();
  if (!offerInstall(state)) return null;
  return (
    <button
      type="button"
      className={`${st.pill}${compact ? ` ${st.pillSm}` : ""} ${className}`}
      onClick={() => {
        trackEvent("app_sheet_opened", { source });
        openAppSheet(source);
      }}
      data-no-busy
      aria-label="Install the TheBookX app"
    >
      <Download size={14} strokeWidth={2.4} />
      <span>{compact ? "App" : "Get app"}</span>
    </button>
  );
}

/** One-line card for bag / order pages → opens the install sheet. */
export function AppPromoCard({ source = "card", title }) {
  const state = useAppInstall();
  if (!offerInstall(state)) return null;
  return (
    <button type="button" className="psh-card" onClick={() => openAppSheet(source)} data-no-busy>
      <Smartphone size={18} aria-hidden="true" />
      <span className="psh-tx">
        <b>{title || "Install the TheBookX app"}</b>
        <small>Opens in one tap · tracking alerts · free</small>
      </span>
      <span className="psh-card-cta">Install</span>
    </button>
  );
}

const STEPS = {
  ios: [
    <>Tap <b>Share</b> (the square with an arrow) at the bottom of Safari.</>,
    <>Scroll and choose <b>Add to Home Screen</b>.</>,
    <>Tap <b>Add</b> — TheBookX is now on your Home Screen.</>,
  ],
  android: [
    <>Tap the <b>⋮ menu</b> at the top-right of your browser.</>,
    <>Choose <b>Install app</b> or <b>Add to Home screen</b>.</>,
    <>Tap <b>Install</b> — find TheBookX with your apps.</>,
  ],
  desktop: [
    <>Click the <b>install icon</b> at the right end of the address bar.</>,
    <>Or open the browser <b>menu</b> → <b>Install TheBookX</b>.</>,
    <>Click <b>Install</b> — it opens in its own window.</>,
  ],
};

/** The install sheet. Mount once (root layout); open with openAppSheet(). */
export default function AppInstallSheet() {
  const [open, setOpen] = useState(null); // source string when open
  const [view, setView] = useState("main"); // main | steps | done
  const [busy, setBusy] = useState(false);
  const { platform, canPrompt, install } = useAppInstall();
  const mounted = useSyncExternalStore(noopSub, () => true, () => false);

  useEffect(() => {
    const on = (e) => {
      setView("main");
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

  if (!mounted) return null;
  const close = () => !busy && setOpen(null);
  const showSteps = platform === "ios" || !canPrompt;

  const onInstall = async () => {
    if (showSteps) return setView("steps");
    setBusy(true);
    const r = await install(open);
    setBusy(false);
    if (r === "installed") setView("done");
    else if (r === "steps") setView("steps");
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="cdp-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            className="cdp psh"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-sheet-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cdp-x" onClick={close} aria-label="Close" disabled={busy}>
              <X size={18} />
            </button>

            {view === "main" && (
              <>
                <div className="psh-head">
                  <img src="/icon-192.png" alt="" />
                  <h3 id="app-sheet-title">Install TheBookX</h3>
                </div>
                <p>Get the app on your {platform === "desktop" ? "computer" : "phone"} — free, no app store needed.</p>
                <ul className="psh-grid is-2">
                  {APP_BENEFITS.map(({ icon: Icon, title, text }) => (
                    <li key={title}>
                      <Icon size={20} />
                      <b>{title}</b>
                      <small>{text}</small>
                    </li>
                  ))}
                </ul>
                <button type="button" className="cdp-save" onClick={onInstall} disabled={busy} data-no-busy>
                  {busy ? <span className="cdp-spin" aria-hidden="true" /> : <Download size={16} strokeWidth={2.6} />}
                  {busy ? "Installing…" : platform === "ios" ? "Add to Home Screen" : "Install app"}
                </button>
                <button type="button" className="cdp-skip" onClick={close} disabled={busy}>
                  Not now
                </button>
              </>
            )}

            {view === "steps" && (
              <>
                <div className="psh-head">
                  <img src="/icon-192.png" alt="" />
                  <h3 id="app-sheet-title">{platform === "ios" ? "Add to your Home Screen" : "Install in 3 steps"}</h3>
                </div>
                <p>
                  {platform === "ios"
                    ? "Safari installs apps from the Share menu. It takes 10 seconds:"
                    : "Your browser installs apps from its menu:"}
                </p>
                <ol className="psh-steps">
                  {STEPS[platform].map((s, i) => (
                    <li key={i}>
                      <span className="psh-n">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <button type="button" className="cdp-save" onClick={() => setOpen(null)} data-no-busy>
                  Got it
                </button>
              </>
            )}

            {view === "done" && (
              <div className="psh-done">
                <CheckCircle2 size={34} aria-hidden="true" />
                <h3 id="app-sheet-title" style={{ margin: 0 }}>TheBookX is installed</h3>
                <p>Open it from your {platform === "desktop" ? "apps" : "home screen"} any time.</p>
                <button type="button" className="cdp-save" onClick={() => setOpen(null)} data-no-busy>
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
