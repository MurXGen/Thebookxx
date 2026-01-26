"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="pwa-install">
      <span>📚 Install TheBookX for faster shopping</span>
      <button onClick={installApp} className="pri-small-btn">
        <Download size={16} /> Install
      </button>
    </div>
  );
}
