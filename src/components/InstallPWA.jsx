"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/ga";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);

      // 👀 Prompt shown
      trackEvent("pwa_install_prompt_shown");
    };

    const installedHandler = () => {
      // ✅ ACTUAL install completed
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
    if (!deferredPrompt) return;

    // 👆 Button clicked
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
    <div
      className="mobile-offer-strip flex flex-row gap-32"
      style={{ borderBlock: "1px solid grey", position: "sticky", top: "0px" }}
      onClick={handleInstall}
    >
      <span className="font-14">Install TheBookX App</span>

      <div
        className="flex flex-row gap-4 items-center"
        style={{ textDecoration: "underline" }}
      >
        <span className="shinny-icon weight-600">
          Install & Get upto Rs.100 off
        </span>
      </div>
    </div>
  );
}
