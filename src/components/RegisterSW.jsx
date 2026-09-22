"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .catch((err) => console.log("SW registration failed:", err));
      });
    }
    // Capture the install prompt globally the moment Chrome offers it — it can
    // fire before any install button mounts, so stash it on window and notify
    // listeners. The install UI then uses window.__bipEvent directly.
    const onBip = (e) => {
      e.preventDefault();
      window.__bipEvent = e;
      window.dispatchEvent(new Event("bip-ready"));
    };
    const onInstalled = () => {
      window.__bipEvent = null;
      window.dispatchEvent(new Event("bip-installed"));
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
