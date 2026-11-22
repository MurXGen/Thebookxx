"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/ga";
import { openAppSheet } from "@/components/AppInstall";

/**
 * Minimal, fixed-to-bottom "Install app" bar for the profile page.
 * Install opens the shared install sheet (AppInstall.jsx), which fires the
 * browser's install prompt or shows short steps (iPhone / other browsers).
 * Hidden when the app is already installed / running standalone, or dismissed.
 */
export default function InstallAppBar({ inline = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed / launched from home screen → never show.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    if (sessionStorage.getItem("installBarDismissed") === "1") return;

    const ua = window.navigator.userAgent || "";
    const ios = /iphone|ipad|ipod/i.test(ua);

    const beforeInstallHandler = (e) => {
      e.preventDefault();
      window.__bipEvent = e;
      setVisible(true);
      trackEvent?.("pwa_install_prompt_shown");
    };
    const installedHandler = () => {
      trackEvent?.("pwa_installed");
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    // Prompt already captured, or iOS (no prompt — the sheet shows steps).
    const t = (window.__bipEvent || ios) ? setTimeout(() => setVisible(true), 0) : null;

    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  // Opens the shared install sheet (it fires the browser prompt or shows steps).
  const handleInstall = () => {
    trackEvent?.("app_sheet_opened", { source: "install_bar" });
    openAppSheet("install_bar");
  };

  const dismiss = () => {
    sessionStorage.setItem("installBarDismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`install-app-wrap${inline ? " inline" : ""}`}
        initial={{ opacity: 0, y: inline ? 8 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: inline ? 8 : 24 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="install-app-bar">
          <span className="install-app-icon" aria-hidden="true">
            <Download size={18} />
          </span>
          <div className="install-app-text">
            <span className="install-app-title">
              {inline ? "Install app" : "Install the TheBookX app"}
            </span>
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
            Install
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

      </motion.div>
    </AnimatePresence>
  );
}
