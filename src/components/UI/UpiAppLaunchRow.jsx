"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Smartphone } from "lucide-react";
import { showToast } from "@/context/ToastContext";
import {
  UPI_APPS,
  upiAppByName,
  launchUpiApp,
  copyUpiId,
} from "@/utils/upiApps";
import UpiAppPayModal from "./UpiAppPayModal";

// A single "Open <app>" button shown directly below the Verify button on the
// UPI QR screen. Copies the real UPI ID, then (on mobile) shows a full-page
// pay guide (paste the ID, or download + upload the QR) that survives app
// switching.
export default function UpiAppLaunchRow({
  upiId,
  amount = 0,
  chosenApp = "",
  advance = false,
  onWhatsApp,
  onAutoConfirm,
  onSwitchToCOD,
  onPollStatus,
  codAmount = 0,
  onModalClose,
  autoOpen = false,
}) {
  const primary = chosenApp ? upiAppByName(chosenApp) : null;

  const [isMobile, setIsMobile] = useState(false);
  const [activeApp, setActiveApp] = useState(primary || null);
  const [payOpen, setPayOpen] = useState(false);
  const [payStage, setPayStage] = useState("ready");
  const [showMore, setShowMore] = useState(false);

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

  // Opened straight from the checkout app picker: show the pay guide now (the
  // UPI ID was copied in that tap) and render no button of our own.
  useEffect(() => {
    if (!autoOpen) return;
    setActiveApp(primary || null);
    setPayStage((st) => (st === "verifying" ? st : "ready"));
    setPayOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const handle = (app) => {
    // Only the UPI ID is copied here; the QR downloads from the guide's
    // "Option 2" when the shopper wants it.
    copyUpiId(upiId);

    if (isMobile) {
      // Mobile: DON'T launch the app yet. Show the full-page "UPI ID copied"
      // guide and only open the app from its CTA.
      setActiveApp(app || null);
      setPayStage("ready");
      setPayOpen(true);
    } else {
      // Desktop: copy + open the store page + toast (no app to deep-link to).
      launchUpiApp(app, upiId);
      showToast(
        `UPI ID copied: open ${app ? app.label : "your UPI app"}, paste it and pay ₹${amount}`,
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
      onClose={() => {
        setPayOpen(false);
        onModalClose?.();
      }}
      onLaunch={() => launchUpiApp(activeApp, upiId)}
      onWhatsApp={onWhatsApp}
      onAutoConfirm={() => {
        setPayOpen(false);
        onAutoConfirm?.();
      }}
      onSwitchToCOD={
        onSwitchToCOD
          ? () => {
              setPayOpen(false);
              onSwitchToCOD();
            }
          : undefined
      }
      codAmount={codAmount}
      onPollStatus={onPollStatus}
      upiId={upiId}
    />
  );

  if (autoOpen) return modal;

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
        {UPI_APPS.filter((a) => !a.more).map((a) => (
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
      {/* Other UPI apps: BHIM, CRED, or any app via UPI ID + saved QR */}
      <button
        type="button"
        className={`upiopen-more-toggle${showMore ? " open" : ""}`}
        onClick={() => setShowMore((v) => !v)}
        aria-expanded={showMore}
      >
        More UPI apps <ChevronDown size={14} />
      </button>
      {showMore && (
        <div className="upiopen-row upiopen-more">
          {UPI_APPS.filter((a) => a.more).map((a) => (
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
          <button type="button" className="upiopen-chip other" onClick={() => handle(null)}>
            <Smartphone size={14} /> Any other UPI app
          </button>
        </div>
      )}
      {modal}
    </>
  );
}
