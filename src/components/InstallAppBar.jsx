"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/ga";

/**
 * Minimal, fixed-to-bottom "Install app" bar for the profile page.
 * - Android / desktop Chrome: fires the native install prompt (beforeinstallprompt).
 * - iOS Safari (no beforeinstallprompt): reveals a short "Add to Home Screen" hint.
 * Hidden when the app is already installed / running standalone, or dismissed.
 */
export default function InstallAppBar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Already installed / launched from home screen → never show.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    if (sessionStorage.getItem("installBarDismissed") === "1") return;

    const ua = window.navigator.userAgent || "";
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
      trackEvent?.("pwa_install_prompt_shown");
    };
    const installedHandler = () => {
      trackEvent?.("pwa_installed");
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    // iOS can't use beforeinstallprompt — show the bar so we can guide them.
    if (ios) setVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    trackEvent?.("pwa_install_clicked");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      trackEvent?.(
        choice.outcome === "accepted"
          ? "pwa_install_accepted"
          : "pwa_install_dismissed",
      );
      setDeferredPrompt(null);
      if (choice.outcome === "accepted") setVisible(false);
      return;
    }
    if (isIOS) setShowIosHint((v) => !v);
  };

  const dismiss = () => {
    sessionStorage.setItem("installBarDismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="install-app-wrap"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="install-app-bar">
          <span className="install-app-icon" aria-hidden="true">
            <Download size={18} />
          </span>
          <div className="install-app-text">
            <span className="install-app-title">Install the TheBookX app</span>
            <span className="install-app-sub">
              Faster shopping, order tracking &amp; offers
            </span>
          </div>
          <button
            type="button"
            className="install-app-cta"
            onClick={handleInstall}
          >
            <Download size={15} />
            Download
          </button>
          <button
            type="button"
            className="install-app-close"
            onClick={dismiss}
            aria-label="Dismiss install banner"
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence>
          {showIosHint && (
            <motion.div
              className="install-app-ioshint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              Tap <Share size={13} /> Share, then{" "}
              <strong>Add to Home Screen</strong>.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
