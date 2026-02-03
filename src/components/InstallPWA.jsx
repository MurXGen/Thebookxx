"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowInstall(false);
    }
  };

  if (!showInstall) return null;

  return (
    <div className="pwa-install">
      <span className="font-14 ">Install TheBookX App</span>
      <button
        onClick={handleInstall}
        className="pri-big-btn flex flex-row gap-12"
      >
        <Download size={16} /> Download
      </button>
    </div>
  );
}
