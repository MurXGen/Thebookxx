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
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const VERIFY_SECONDS = 300; // 5 minutes
const SAVING_MS = 1700;

// Mobile hand-off modal (Bill-modal UI). Flow:
//  saving  → animated "QR flying & saving + UPI ID copied" splash
//  ready   → 2×2 how-to-pay steps + CTA that opens the app
//  verifying → 5-minute verify countdown
// Open state is mirrored to a ?upipay= URL param so an app-switch keeps it open.
export default function UpiAppPayModal({
  open,
  appLabel = "your UPI app",
  amount = 0,
  advance = false,
  initialStage = "saving",
  onClose,
  onLaunch,
  onWhatsApp,
}) {
  const [stage, setStage] = useState(initialStage);
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
    setStage(initialStage);
    setParam(initialStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-advance the saving splash → ready.
  useEffect(() => {
    if (!open || stage !== "saving") return;
    const t = setTimeout(() => {
      setStage("ready");
      setParam("ready");
    }, SAVING_MS);
    return () => clearTimeout(t);
  }, [open, stage]);

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
              <span className="upm-check">
                <span className="upm-check-ic">
                  <Download size={14} />
                </span>
                QR code saved to your device
              </span>
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
            <h3 className="upm-title">Verifying your payment…</h3>
            <div className="upm-timer">
              {mm}:{ss}
            </div>
            <p className="upm-text">
              Hang tight — this can take a few minutes. Keep this screen open; it
              stays open even if you switch apps.
            </p>
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
