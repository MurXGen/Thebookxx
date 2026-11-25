"use client";
import "./UpiAppPayModal.styles.css";

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
  ChevronDown,
} from "lucide-react";
import { copyUpiId, downloadUpiQr } from "@/utils/upiApps";
import UpiPayGuide from "./UpiPayGuide";
import { FaWhatsapp } from "react-icons/fa";
import CodSwitchBtn from "./CodSwitchBtn";
import { showToast } from "@/context/ToastContext";

const VERIFY_SECONDS = 300; // 5 minutes
// At 4 minutes into the countdown (1:00 left) the order is confirmed for the
// shopper (status → Processing + confirmation email, store CC'd).
const AUTO_CONFIRM_LEFT = 60;

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
  onAutoConfirm,
  onSwitchToCOD,
  onPollStatus,
  codAmount = 0,
  upiId = "",
}) {
  const [stage, setStage] = useState(initialStage);
  const [copied, setCopied] = useState(false);
  // The QR is only downloaded when the shopper asks for it (Option 2).
  const [qrState, setQrState] = useState("idle"); // idle | pending | ok | failed
  useEffect(() => {
    const on = (e) => {
      const ok = !!e.detail?.ok;
      setQrState(ok ? "ok" : "failed");
      // Toast (with a haptic buzz from the toast itself) for the download.
      if (ok)
        showToast(`Open ${appLabel} → Scan → upload the saved QR and pay ₹${amount}`, "success", {
          title: "QR saved to your device",
        });
      else showToast("Couldn't save the QR. Tap Download again or paste the UPI ID.", "error", { title: "Download failed" });
    };
    window.addEventListener("tbx:qr-download", on);
    return () => window.removeEventListener("tbx:qr-download", on);
  }, [appLabel, amount]);
  const saveQrAgain = () => {
    setQrState("pending");
    downloadUpiQr({ amount, upiId, advance });
    setTimeout(() => setQrState((q) => (q === "pending" ? "ok" : q)), 3000);
  };
  const [left, setLeft] = useState(VERIFY_SECONDS);
  // Desktop: no UPI app to open, so the verifying screen offers the QR instead.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(
      !/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "") && window.innerWidth >= 768,
    );
  }, []);
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

  // While verifying: check the order every 5s, so a confirmation from our
  // team lands right away (the parent switches to the success screen).
  const pollRef = useRef(onPollStatus);
  useEffect(() => {
    pollRef.current = onPollStatus;
  });
  useEffect(() => {
    if (!open || stage !== "verifying" || !pollRef.current) return;
    pollRef.current();
    const id = setInterval(() => pollRef.current?.(), 5000);
    return () => clearInterval(id);
  }, [open, stage]);

  // 30s into verifying (e.g. they came back without paying) → show the QR.
  const qrRef = useRef(null);
  useEffect(() => {
    if (!open || stage !== "verifying") return;
    if (left === VERIFY_SECONDS - 30 && qrRef.current) qrRef.current.open = true;
  }, [left, open, stage]);

  // Reached 4:00 of verifying → confirm the order (once).
  const autoDoneRef = useRef(false);
  useEffect(() => {
    if (!open || stage !== "verifying" || autoDoneRef.current) return;
    if (left > AUTO_CONFIRM_LEFT) return;
    autoDoneRef.current = true;
    clearInterval(timerRef.current);
    setParam("");
    onAutoConfirm?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, open, stage]);

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
  const toCod = () => {
    clearInterval(timerRef.current);
    autoDoneRef.current = true; // no auto-confirm of the UPI order after this
    setParam("");
    onSwitchToCOD?.();
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
        onPaid={() => {
          // Desktop: paid by scanning with their phone → straight to verifying.
          setStage("verifying");
          setParam("verifying");
        }}
        onClose={close}
        onSwitchToCOD={onSwitchToCOD ? toCod : undefined}
        codAmount={codAmount}
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

        {/* ── Verifying: compact ring timer, steps, QR on demand ── */}
        {stage === "verifying" && (
          <div className="upm-body upv">
            <div className="upv-ring" role="timer" aria-label={`${mm}:${ss} left`}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle className="upv-track" cx="60" cy="60" r="52" />
                <circle
                  className="upv-prog"
                  cx="60"
                  cy="60"
                  r="52"
                  style={{ strokeDashoffset: 326.7 * (1 - left / VERIFY_SECONDS) }}
                />
              </svg>
              <span className="upv-ring-in">
                <ShieldCheck size={20} className="upv-shield" />
                <b>
                  {mm}:{ss}
                </b>
              </span>
            </div>
            <p className="upv-sub">Keep this open. We&apos;ll confirm ₹{amount} automatically.</p>

            <ol className="upv-steps" aria-label="Progress">
              <li className="done">
                <span><Check size={11} strokeWidth={3.5} /></span>Paid
              </li>
              <li className="on">
                <span />Verifying
              </li>
              <li>
                <span />Confirmed
              </li>
            </ol>

            {/* Not paid yet? QR + UPI ID, tucked away until asked for */}
            <details className="upv-qr" ref={qrRef}>
              <summary>
                <QrCode size={15} /> Haven&apos;t paid yet? Show QR
                <ChevronDown size={15} className="upv-chev" />
              </summary>
              <div className="upv-qr-body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/books/uskillbook.png" alt="TheBookX UPI QR code" />
                <div className="upv-qr-side">
                  {upiId && (
                    <button
                      type="button"
                      className="upv-chip"
                      onClick={() => {
                        copyUpiId(upiId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      }}
                      data-no-busy
                    >
                      {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy UPI ID"}
                    </button>
                  )}
                  <button type="button" className="upv-chip" onClick={saveQrAgain} data-no-busy>
                    <Download size={13} /> Save QR
                  </button>
                  <small>Pay ₹{amount} to {upiId}</small>
                </div>
              </div>
            </details>

            {onWhatsApp && (
              <button type="button" className="upm-wa" onClick={onWhatsApp}>
                <FaWhatsapp size={16} /> Confirm faster on WhatsApp
              </button>
            )}
            {onSwitchToCOD && <CodSwitchBtn onClick={toCod} amount={codAmount} variant="link" />}
            <div className="upv-actions">
              <button type="button" className="upv-btn" onClick={close}>
                Close
              </button>
              {isDesktop ? (
                <button
                  type="button"
                  className="upv-btn pri"
                  onClick={() => {
                    if (qrRef.current) qrRef.current.open = !qrRef.current.open;
                  }}
                >
                  Show QR
                </button>
              ) : (
                <button type="button" className="upv-btn pri" onClick={onLaunch}>
                  Open {appLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
