"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { showToast } from "@/context/ToastContext";
import {
  UPI_APPS,
  upiAppByName,
  launchUpiApp,
  downloadUpiQr,
  copyUpiId,
} from "@/utils/upiApps";
import UpiAppPayModal from "./UpiAppPayModal";

// A single "Open <app>" button shown directly below the Verify button on the
// UPI QR screen. Copies the real UPI ID + auto-downloads the branded QR, then
// (on mobile) shows a pay-handoff modal that survives app switching.
export default function UpiAppLaunchRow({
  upiId,
  amount = 0,
  chosenApp = "",
  advance = false,
  onWhatsApp,
}) {
  const primary = chosenApp ? upiAppByName(chosenApp) : null;

  const [isMobile, setIsMobile] = useState(false);
  const [activeApp, setActiveApp] = useState(primary || null);
  const [payOpen, setPayOpen] = useState(false);
  const [payStage, setPayStage] = useState("ready");

  useEffect(() => {
    const check = () => {
      const narrow =
        typeof window !== "undefined" && window.innerWidth < 600;
      const touch =
        typeof navigator !== "undefined" &&
        /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");
      setIsMobile(narrow || touch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Re-open the hand-off modal if we returned from the UPI app (URL param).
  useEffect(() => {
    try {
      const v = new URL(window.location.href).searchParams.get("upipay");
      if (v === "saving" || v === "ready" || v === "verifying") {
        setActiveApp(primary || null);
        setPayStage(v === "saving" ? "ready" : v);
        setPayOpen(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle = (app) => {
    // Auto-download the branded QR + copy the UPI ID.
    downloadUpiQr({ amount, upiId, advance });

    if (isMobile) {
      // Mobile: DON'T launch the app yet. Play the saving animation, show the
      // how-to modal, and only open the app from the modal's CTA.
      copyUpiId(upiId);
      setActiveApp(app || null);
      setPayStage("saving");
      setPayOpen(true);
    } else {
      // Desktop: copy + open the store page + toast (no app to deep-link to).
      launchUpiApp(app, upiId);
      showToast(
        `UPI ID copied & QR saved — open ${app ? app.label : "your UPI app"}, paste the ID and pay ₹${amount}`,
        "success",
        { title: "Ready to pay", icon: "cart" },
      );
    }
  };

  const modal = (
    <UpiAppPayModal
      open={payOpen}
      appLabel={activeApp ? activeApp.label : "your UPI app"}
      amount={amount}
      advance={advance}
      initialStage={payStage}
      onClose={() => setPayOpen(false)}
      onLaunch={() => launchUpiApp(activeApp, upiId)}
      onWhatsApp={onWhatsApp}
    />
  );

  if (primary) {
    return (
      <>
        <button
          type="button"
          className={`upiopen-btn ${primary.key}`}
          onClick={() => handle(primary)}
        >
          <span>Open {primary.label}</span>
          <ArrowRight size={17} className="upiopen-arrow" />
        </button>
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="upiopen-row">
        {UPI_APPS.map((a) => (
          <button
            key={a.key}
            type="button"
            className={`upiopen-chip ${a.key}`}
            onClick={() => handle(a)}
          >
            {a.label}
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
      {modal}
    </>
  );
}
