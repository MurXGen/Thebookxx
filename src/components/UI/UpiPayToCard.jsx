"use client";

// Compact "Pay to TheBookX" card: a small QR (tap → large QR with the amount,
// Download and Copy UPI ID), the amount, who the app will show as the payee,
// and the UPI ID with Copy. Used on the phone QR screen so it fits on screen.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Copy, Download, Maximize2, BadgeCheck } from "lucide-react";
import { copyUpiId, downloadUpiQr } from "@/utils/upiApps";
import { showToast } from "@/context/ToastContext";

const QR_SRC = "/books/uskillbook.png";
const PAYEE_TXT = "Uskillbook or Murthy";

export default function UpiPayToCard({
  amount = 0,
  upiId = "",
  advance = false,
  className = "",
  hero = false, // QR screen: big QR (fades in) + how-to-pay hint
}) {
  // QR screen: the UPI ID was copied when they picked the app (and again here,
  // best effort) so it shows as copied straight away.
  const [copied, setCopied] = useState(hero);
  useEffect(() => {
    if (!hero || !upiId) return;
    copyUpiId(upiId);
    const t = setTimeout(() => setCopied(false), 6000);
    return () => clearTimeout(t);
  }, [hero, upiId]);
  const [preview, setPreview] = useState(false);
  const [qrState, setQrState] = useState("idle"); // idle | pending | ok | failed
  useEffect(() => {
    const on = (e) => setQrState(e.detail?.ok ? "ok" : "failed");
    window.addEventListener("tbx:qr-download", on);
    return () => window.removeEventListener("tbx:qr-download", on);
  }, []);

  const copy = () => {
    copyUpiId(upiId);
    showToast(`Paste it in your UPI app and pay ₹${amount}.`, "success", { title: "UPI ID copied" });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const download = () => {
    setQrState("pending");
    downloadUpiQr({ amount, upiId, advance });
    setTimeout(() => setQrState((q) => (q === "pending" ? "ok" : q)), 3000);
  };

  // Animated "download" arrow (drops into the tray).
  const dlIcon = (
    <svg className="upg-dlarrow" viewBox="0 0 24 24" aria-hidden="true">
      <g className="upg-dlarrow-a">
        <path d="M12 3v11" />
        <path d="M7 10l5 5 5-5" />
      </g>
      <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
    </svg>
  );

  const card = hero ? (
    // QR screen (phones): big QR in the centre, then Copy UPI ID + Download QR.
    <section className={`upg-card upg-payto hero2 ${className}`}>
      <div className="upg-h2-top">
        <span className="upg-payto-k">Pay to TheBookX</span>
        <b className="upg-payto-amt">₹{amount}</b>
      </div>
      <button
        type="button"
        className="upg-h2-qr"
        onClick={() => setPreview(true)}
        aria-label="View the QR code larger"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={QR_SRC} alt="TheBookX UPI QR code" />
      </button>
      <span className="upg-payto-name">
        <BadgeCheck size={13} /> Shows as <b>Uskillbook</b> or <b>Murthy</b>
      </span>
      <div className="upg-h2-actions">
        <button
          type="button"
          className={`upg-h2-btn${copied ? " ok" : ""}`}
          onClick={copy}
          data-no-busy
        >
          {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
          {copied ? "UPI ID copied" : "Copy UPI ID"}
        </button>
        <button
          type="button"
          className={`upg-h2-btn dl${qrState === "ok" ? " ok" : ""}`}
          onClick={download}
          disabled={qrState === "pending"}
          data-no-busy
        >
          {qrState === "pending" ? (
            <span className="upiv3-spin dark" />
          ) : qrState === "ok" ? (
            <Check size={16} strokeWidth={3} />
          ) : (
            dlIcon
          )}
          {qrState === "pending" ? "Saving…" : qrState === "ok" ? "QR saved" : "Download QR"}
        </button>
      </div>
      <code className="upg-h2-id">{upiId}</code>
      <p className="upg-payto-how">
        Open the app, then upload this QR or paste the UPI ID and pay ₹{amount}.
      </p>
    </section>
  ) : null;

  return (
    <>
      {card || <section className={`upg-card upg-payto ${className}`}>
        <button
          type="button"
          className="upg-qrthumb"
          onClick={() => setPreview(true)}
          aria-label="View the QR code larger"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={QR_SRC} alt="TheBookX UPI QR code" />
          <span className="upg-qrthumb-zoom">
            <Maximize2 size={11} /> View
          </span>
        </button>
        <div className="upg-payto-tx">
          <span className="upg-payto-k">Pay to TheBookX</span>
          <b className="upg-payto-amt">₹{amount}</b>
          <span className="upg-payto-name">
            <BadgeCheck size={13} /> Shows as <b>Uskillbook</b> or <b>Murthy</b>
          </span>
          <div className="upg-idrow">
            <code>{upiId}</code>
            <button type="button" onClick={copy} data-no-busy>
              {copied ? <><Check size={13} strokeWidth={3} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
        </div>
      </section>}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {preview && (
              <motion.div
                className="upg-qrprev-back"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreview(false)}
              >
                <motion.div
                  className="upg-qrprev"
                  role="dialog"
                  aria-modal="true"
                  aria-label="TheBookX UPI QR code"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button" className="upg-qrprev-x" onClick={() => setPreview(false)} aria-label="Close">
                    <X size={18} />
                  </button>
                  <span className="upg-qrprev-k">Scan to pay</span>
                  <b className="upg-qrprev-amt">₹{amount}</b>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={QR_SRC} alt="TheBookX UPI QR code" className="upg-qrprev-img" />
                  <span className="upg-qrprev-name">
                    <BadgeCheck size={14} /> Shows as {PAYEE_TXT}
                  </span>
                  <div className="upg-idrow upg-qrprev-id">
                    <code>{upiId}</code>
                    <button type="button" onClick={copy} data-no-busy>
                      {copied ? <><Check size={13} strokeWidth={3} /> Copied</> : <><Copy size={13} /> Copy UPI ID</>}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`upg-dlbtn${qrState === "ok" ? " ok" : ""}`}
                    onClick={download}
                    disabled={qrState === "pending"}
                    data-no-busy
                  >
                    {qrState === "pending" ? (
                      <>
                        <span className="upiv3-spin dark" /> Saving QR…
                      </>
                    ) : qrState === "ok" ? (
                      <>
                        <Check size={16} strokeWidth={3} /> QR saved · download again
                      </>
                    ) : (
                      <>
                        <Download size={16} /> Download QR
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
