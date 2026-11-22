"use client";

import { Download, DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/ga";
import { motion } from "framer-motion";
import { ANDROID_APK_URL, isAndroidUA, isInAndroidApp } from "@/lib/appDownload";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Android → offer the native app (APK) instead of the PWA.
    if (isInAndroidApp()) return;
    if (isAndroidUA()) {
      const t = setTimeout(() => setShowInstall(true), 0);
      return () => clearTimeout(t);
    }
    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);

      // Prompt shown
      trackEvent("pwa_install_prompt_shown");
    };

    const installedHandler = () => {
      // ACTUAL install completed
      trackEvent("pwa_installed");
      setShowInstall(false);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (isAndroidUA()) {
      trackEvent("apk_download_clicked", { source: "install_strip" });
      window.location.href = ANDROID_APK_URL;
      return;
    }
    if (!deferredPrompt) return;

    // Button clicked
    trackEvent("pwa_install_clicked");

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      trackEvent("pwa_install_accepted");
    } else {
      trackEvent("pwa_install_dismissed");
    }

    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <motion.div
      className="mobile-offer-strip flex flex-row gap-32"
      style={{
        cursor: "pointer",
        zIndex: "9999",
        boxShadow: "4px 0 12px #000000",
      }}
      onClick={handleInstall}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <DownloadIcon size={14} />
      <span className="font-14">Download app - </span>

      <div className="flex flex-row gap-4 items-center">
        <span className="shinny-icon weight-600">Get upto Rs.100 off</span>
      </div>
    </motion.div>
  );
}
