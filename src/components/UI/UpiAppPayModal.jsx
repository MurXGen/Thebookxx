"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Download,
  ClipboardCheck,
  ShieldCheck,
  ArrowRight,
  QrCode,
  Smartphone,
  IndianRupee,
  X,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { copyUpiId, downloadUpiQr } from "@/utils/upiApps";
import UpiPayGuide from "./UpiPayGuide";
import { FaWhatsapp } from "react-icons/fa";

const VERIFY_SECONDS = 300; // 5 minutes

// Mobile hand-off after "Open <app>" (the UPI ID is already copied). Flow:
//  ready     → full-page guide: paste the UPI ID, OR download the QR and
//              upload it in the app (animated demos) + sticky "Open app" bar
//  verifying → 5-minute verify countdown (Bill-modal UI)
// Open state is mirrored to a ?upipay= URL param so an app-switch keeps it open.
export default function UpiAppPayModal({
  open,
  appLabel = "your UPI app",
  amount = 0,
  advance = false,
  initialStage = "ready",
  onClose,
  onLaunch,
  onWhatsApp,
  upiId = "",
}) {
  const [stage, setStage] = useState(initialStage);
  const [copied, setCopied] = useState(false);
  // The QR is only downloaded when the shopper asks for it (Option 2).
  const [qrState, setQrState] = useState("idle"); // idle | pending | ok | failed
  useEffect(() => {
    const on = (e) => setQrState(e.detail?.ok ? "ok" : "failed");
    window.addEventListener("tbx:qr-download", on);
    return () => window.removeEventListener("tbx:qr-download", on);
  }, []);
  const saveQrAgain = () => {
    setQrState("pending");
    downloadUpiQr({ amount, upiId, advance });
    setTimeout(() => setQrState((q) => (q === "pending" ? "ok" : q)), 3000);
  };
  const [left, setLeft] = useState(VERIFY_SECONDS);
  const timerRef = useRef(null);

  const setParam = (val) => {
    try {
      const u = new URL(window.location.href);
      if (val) u.searchParams.set("upipay", val);
      else u.searchParams.delete("upipay");
      window.history.replaceState({}, "", u.toString());
    } catch {}
  };

  useEffect(() => {
    if (!open) {
      setParam("");
      return;
    }
    const st = initialStage === "saving" ? "ready" : initialStage;
    setStage(st);
    setParam(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 5-minute verify countdown.
  useEffect(() => {
    if (!open || stage !== "verifying") return;
    setLeft(VERIFY_SECONDS);
    timerRef.current = setInterval(() => {
      setLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [open, stage]);

  if (!open || typeof document === "undefined") return null;

  const openApp = () => {
    onLaunch?.();
    setStage("verifying");
    setParam("verifying");
  };
  const close = () => {
    setParam("");
    onClose?.();
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const STEPS = [
    { n: 1, type: "phone", Icon: Smartphone, label: `Open ${appLabel}` },
    { n: 2, type: "scan", label: "Scan saved QR or paste UPI ID" },
    { n: 3, type: "pay", Icon: IndianRupee, label: `Enter ₹${amount} & pay` },
    { n: 4, type: "verify", Icon: ShieldCheck, label: "Come back — we verify it" },
  ];

  const header =
    stage === "verifying"
      ? "Verifying payment"
      : stage === "ready"
        ? `Pay with ${appLabel}`
        : "Getting things ready…";

  if (stage !== "verifying") {
    return createPortal(
      <UpiPayGuide
        appLabel={appLabel}
        amount={amount}
        upiId={upiId}
        qrState={qrState}
        onCopy={() => copyUpiId(upiId)}
        onDownloadQr={saveQrAgain}
        onLaunch={openApp}
        onClose={close}
      />,
      document.body,
    );
  }

  return createPortal(
    <motion.div
      className="bill-modal-overlay upm-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ maxWidth: "980px", margin: "0 auto" }}
    >
      <motion.div
        className="bill-modal upm-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="bill-header">
          <span className="weight-600 font-16">{header}</span>
          {stage !== "saving" && (
            <span className="cursor-pointer" onClick={close}>
              <X size={18} />
            </span>
          )}
        </div>

        {/* ── Saving splash ── */}
        {stage === "saving" && (
          <div className="upm-body upm-saving">
            <div className="upm-save-scene">
              <span className="upm-fly-qr">
                <QrCode size={30} />
              </span>
              <span className="upm-device">
                <Smartphone size={40} />
                <span className="upm-device-check">
                  <ClipboardCheck size={14} />
                </span>
              </span>
            </div>
            <h3 className="upm-title">Saving your QR…</h3>
            <p className="upm-text">
              Downloading the QR to your device and copying the UPI ID — one
              moment.
            </p>
          </div>
        )}

        {/* ── Ready: how to pay ── */}
        {stage === "ready" && (
          <div className="upm-body">
            <div className="upm-checks">
              {qrState === "failed" ? (
                <span className="upm-check fail" role="alert">
                  <span className="upm-check-ic">
                    <AlertCircle size={14} />
                  </span>
                  <span className="upm-check-txt">QR download failed</span>
                  <button type="button" className="upm-check-btn" onClick={saveQrAgain} data-no-busy>
                    <Download size={14} /> Download QR
                  </button>
                </span>
              ) : (
                <span className="upm-check">
                  <span className="upm-check-ic">
                    <Download size={14} />
                  </span>
                  <span className="upm-check-txt">
                    {qrState === "pending" ? "Saving QR to your device…" : "QR code saved to your device"}
                  </span>
                  <button
                    type="button"
                    className="upm-check-icbtn"
                    onClick={saveQrAgain}
                    aria-label="Download QR again"
                    title="Didn't get it? Download again"
                    data-no-busy
                  >
                    <Download size={15} />
                  </button>
                </span>
              )}
              <span className="upm-check">
                <span className="upm-check-ic">
                  <ClipboardCheck size={14} />
                </span>
                UPI ID copied to your clipboard
              </span>
            </div>

            <span className="upm-steps-lbl">How to pay in 4 quick steps</span>
            <div className="upm-steps">
              {STEPS.map((s) => (
                <div key={s.n} className={`upm-step s${s.n}`}>
                  <span className="upm-step-n">{s.n}</span>
                  <span className="upm-step-icon">
                    {s.type === "scan" ? (
                      <span className="upm-scan">
                        <span className="upm-scan-c tl" />
                        <span className="upm-scan-c tr" />
                        <span className="upm-scan-c bl" />
                        <span className="upm-scan-c br" />
                        <span className="upm-scan-line" />
                      </span>
                    ) : (
                      <s.Icon size={20} strokeWidth={2} />
                    )}
                  </span>
                  <span className="upm-step-tx">{s.label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="pri-big-btn upm-cta"
              onClick={openApp}
            >
              Open {appLabel} &amp; pay ₹{amount} <ArrowRight size={16} />
            </button>
            <button type="button" className="upm-cancel" onClick={close}>
              Cancel
            </button>
          </div>
        )}

        {/* ── Verifying ── */}
        {stage === "verifying" && (
          <div className="upm-body upm-verifying">
            <div className="upm-verify-graphic">
              <span className="upm-radar" />
              <span className="upm-radar two" />
              <span className="upm-verify-badge">
                <ShieldCheck size={30} />
              </span>
            </div>
            <p className="upg-busy upg-busy-sm" role="status">
              <AlertCircle size={14} /> Payment server busy. Paid in your UPI app? We&apos;ll verify it here.
            </p>
            <h3 className="upm-title">Verifying your payment…</h3>
            <div className="upm-timer">
              {mm}:{ss}
            </div>
            <p className="upm-text">
              Hang tight — this can take a few minutes. Keep this screen open; it
              stays open even if you switch apps.
            </p>
            {/* Not paid yet? Pay from here: QR + UPI ID + download. */}
            <div className="upm-qrpay">
              <span className="upm-qrpay-cap">Haven&apos;t paid yet? Scan &amp; pay ₹{amount}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/books/uskillbook.png" alt="TheBookX UPI QR code" className="upm-qrpay-img" />
              {upiId && (
                <div className="upm-qrpay-id">
                  <span>{upiId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      copyUpiId(upiId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    }}
                    data-no-busy
                  >
                    {copied ? (
                      <>
                        <Check size={13} strokeWidth={3} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy ID
                      </>
                    )}
                  </button>
                </div>
              )}
              <button
                type="button"
                className="upm-qrpay-dl"
                onClick={saveQrAgain}
                data-no-busy
              >
                <Download size={15} /> Download QR
              </button>
            </div>
            <button type="button" className="upm-ghost" onClick={onLaunch}>
              Open {appLabel} again
            </button>
            {onWhatsApp && (
              <button type="button" className="upm-wa" onClick={onWhatsApp}>
                <FaWhatsapp size={16} /> Confirm faster on WhatsApp
              </button>
            )}
            {left === 0 && (
              <p className="upm-slow">
                Taking longer than usual? Tap the WhatsApp button above and
                we&apos;ll confirm it right away.
              </p>
            )}
            <button type="button" className="upm-cancel" onClick={close}>
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
