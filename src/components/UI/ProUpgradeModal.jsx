"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Check,
  Zap,
  Tag,
  Truck,
  ShieldCheck,
  Loader2,
  Copy,
  Package,
} from "lucide-react";
import {
  PRO_PRICE,
  fetchProStatus,
  startProPayment,
} from "@/utils/proPlan";
import { showToast } from "@/context/ToastContext";

const UPI_ID = "7977960242-1@okbizaxis";
const TELEGRAM_URL = "https://api.journalx.app/api/bookxTelegram/order";

// Fire a Telegram notification so the team can verify & mark this ₹99 payment
// Paid in the "Pro Plan" sheet tab.
function notifyProTelegram(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  const msg = `👑 *TheBookX Exclusive — membership payment*\n\n📞 ${digits}\n💳 ₹${PRO_PRICE} / month\n\n➡️ Verify the UPI payment, then set *Status → Paid* for this number in the *Pro Plan* tab to activate.`;
  const payload = JSON.stringify({
    orderDetails: msg,
    customerName: "Pro membership",
    customerPhone: digits,
    totalAmount: PRO_PRICE,
    paymentMethod: "PRO_MEMBERSHIP",
    codHandlingFee: 0,
  });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(TELEGRAM_URL, blob)) return;
    }
  } catch {}
  fetch(TELEGRAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: payload,
  }).catch(() => {});
}

const BENEFITS = [
  { icon: Tag, text: "Flat 20% off every order (best price applied)" },
  { icon: ShieldCheck, text: "Zero COD handling fee" },
  { icon: Truck, text: "Free delivery on orders above ₹400" },
  { icon: Zap, text: "50% off packing & care charges" },
];

const norm = (p) => String(p || "").replace(/\D/g, "").slice(-10);

export default function ProUpgradeModal({
  open,
  onClose,
  phone = "",
  onActivated,
}) {
  // step: phone | offer | paying | active
  const [step, setStep] = useState("offer");
  const [num, setNum] = useState(norm(phone));
  const [busy, setBusy] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);
  const pollRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const clearPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  // On open, decide the starting step: need a number first, else check status.
  useEffect(() => {
    if (!open) {
      clearPoll();
      return;
    }
    const p = norm(phone);
    setNum(p);
    if (p.length === 10) runCheck(p);
    else setStep("phone");
    return clearPoll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phone]);

  const runCheck = async (p) => {
    setBusy(true);
    const s = await fetchProStatus(p);
    setBusy(false);
    setStatusInfo(s);
    if (s.active) {
      setStep("active");
      onActivated && onActivated(s);
    } else {
      setStep("offer");
    }
  };

  const submitNumber = () => {
    const p = norm(num);
    if (p.length !== 10) {
      showToast("Enter a valid 10-digit number", "error");
      return;
    }
    runCheck(p);
  };

  const startPoll = (p) => {
    clearPoll();
    pollRef.current = setInterval(async () => {
      const s = await fetchProStatus(p);
      if (s.active) {
        clearPoll();
        setStatusInfo(s);
        setStep("active");
        try {
          if (navigator.vibrate) navigator.vibrate([18, 40, 60, 30, 90]);
        } catch {}
        showToast("TheBookX Exclusive activated 🎉", "success");
        onActivated && onActivated(s);
      }
    }, 3000);
  };

  // "Pay ₹99" → show the UPI QR right away (brief "preparing" loader), and write
  // the Unconfirmed row + start polling in the background so the button never
  // hangs on a slow sheet write.
  const pay = () => {
    const p = norm(num);
    if (p.length !== 10) return;
    setStep("qr");
    setQrLoading(true);
    setTimeout(() => setQrLoading(false), 1500);
    startPoll(p);
    startProPayment(p)
      .then((r) => {
        if (r && r.active) {
          clearPoll();
          setStatusInfo(r);
          setStep("active");
          onActivated && onActivated(r);
        }
      })
      .catch(() => {});
  };

  // Shopper taps "I've paid" → notify the team on Telegram to verify + mark Paid.
  const confirmPaid = () => {
    notifyProTelegram(norm(num));
    showToast("Thanks! We're verifying your payment 🔎", "success");
  };

  const copyUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
      showToast("UPI ID copied", "success");
    } catch {}
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`bill-modal-overlay${step === "qr" ? " upiv3-overlay" : ""}`}
          style={{ zIndex: 100001 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`bill-modal pro-modal${step === "qr" ? " upiv3-modal" : ""}`}
            style={{ maxWidth: "980px", margin: "0 auto" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-head">
              <span className="pro-badge">
                <Zap size={15} /> TheBookX Exclusive
              </span>
              <button
                type="button"
                className="pro-x"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Number step */}
            {step === "phone" && (
              <div className="pro-body">
                <h3 className="pro-title">Unlock members-only pricing</h3>
                <p className="pro-sub">
                  Enter your mobile number to check your membership.
                </p>
                <input
                  className="pro-input"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={num}
                  maxLength={10}
                  onChange={(e) => setNum(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  type="button"
                  className="pro-cta"
                  disabled={busy || norm(num).length !== 10}
                  onClick={submitNumber}
                >
                  {busy ? <Loader2 size={16} className="pro-spin" /> : "Continue"}
                </button>
              </div>
            )}

            {/* Offer step */}
            {step === "offer" && (
              <div className="pro-body">
                <div className="pro-price-row">
                  <span className="pro-price">₹{PRO_PRICE}</span>
                  <span className="pro-per">/ month</span>
                </div>
                <p className="pro-sub">
                  Join TheBookX Exclusive and save on every order.
                </p>
                <ul className="pro-benefits">
                  {BENEFITS.map((b, i) => (
                    <li key={i}>
                      <span className="pro-benefit-ic">
                        <b.icon size={15} />
                      </span>
                      {b.text}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="pro-cta"
                  disabled={busy}
                  onClick={pay}
                >
                  {busy ? (
                    <Loader2 size={16} className="pro-spin" />
                  ) : (
                    <>
                      <Zap size={16} /> Pay ₹{PRO_PRICE} &amp; activate
                    </>
                  )}
                </button>
                <p className="pro-fine">
                  Valid 30 days · pay by UPI, we activate within minutes.
                </p>
              </div>
            )}

            {/* QR payment — mirrors the order UPI flow (upiv3) UI */}
            {step === "qr" && (
              <>
                <div className="upiv3 upiv3-scroll">
                  <div className="upiv3-payee">
                    <span className="upiv3-payee-logo">TB</span>
                    <div className="upiv3-payee-info">
                      <span className="upiv3-payee-name">TheBookX</span>
                      <span className="upiv3-payee-upi">{UPI_ID}</span>
                    </div>
                    <span className="upiv3-verified">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </div>

                  <div className="upiv3-qr">
                    <div className="upiv3-qr-card">
                      <div className="upiv3-qr-top">
                        <div className="upiv3-qr-top-l">
                          <span className="upiv3-qr-payee-lbl">Paying to</span>
                          <span className="upiv3-qr-payee">
                            TheBookX Exclusive
                          </span>
                        </div>
                        <span className="upiv3-qr-amt">₹{PRO_PRICE}</span>
                      </div>

                      <div
                        className={`upiv3-qr-img${qrLoading ? " loading" : " ready"}`}
                      >
                        <span className="upiv3-corner tl" aria-hidden="true" />
                        <span className="upiv3-corner tr" aria-hidden="true" />
                        <span className="upiv3-corner bl" aria-hidden="true" />
                        <span className="upiv3-corner br" aria-hidden="true" />
                        <Image
                          src="/books/uskillbook.png"
                          alt="UPI QR to pay ₹99"
                          width={300}
                          height={360}
                        />
                        {!qrLoading && (
                          <span className="upiv3-scanline" aria-hidden="true" />
                        )}
                        {qrLoading && (
                          <div className="upiv3-qr-loader">
                            <span className="upiv3-spin lg" />
                            <span>Generating secure QR…</span>
                          </div>
                        )}
                      </div>

                      <span className="upiv3-qr-scan">
                        {qrLoading
                          ? "Hang tight — preparing your QR"
                          : `Scan with any UPI app to pay ₹${PRO_PRICE}`}
                      </span>
                      {!qrLoading && (
                        <span className="upiv3-status">
                          <span className="upiv3-status-dot" />
                          Waiting for your payment…
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="upiv3-apps" aria-hidden="true">
                    <span className="upiv3-apps-lbl">Works with</span>
                    <span className="upiv3-app-chip gpay">GPay</span>
                    <span className="upiv3-app-chip phonepe">PhonePe</span>
                    <span className="upiv3-app-chip paytm">Paytm</span>
                    <span className="upiv3-app-chip bhim">BHIM</span>
                    <span className="upiv3-apps-more">+ all UPI</span>
                  </div>

                  <div className="upiv3-trust">
                    <span>
                      <ShieldCheck size={13} /> 256-bit encrypted
                    </span>
                    <span>
                      <Package size={13} /> Instant activation
                    </span>
                  </div>
                </div>

                <div className="upiv3-footer">
                  <div className="upiv3-id-row">
                    <button
                      type="button"
                      className="upiv3-link"
                      onClick={copyUpi}
                    >
                      <Copy size={14} /> Copy UPI ID
                    </button>
                  </div>
                  <button
                    type="button"
                    className="pro-cta"
                    onClick={confirmPaid}
                  >
                    <Check size={16} /> I&apos;ve paid ₹{PRO_PRICE}
                  </button>
                  <p className="pro-fine">
                    Activates the moment we confirm your payment — keep this
                    open.
                  </p>
                  <button
                    type="button"
                    className="pro-ghost"
                    onClick={onClose}
                  >
                    I&apos;ll check later
                  </button>
                </div>
              </>
            )}

            {/* Active */}
            {step === "active" && (
              <div className="pro-body pro-center">
                <span className="pro-tick">
                  <Check size={26} strokeWidth={3} />
                </span>
                <h3 className="pro-title">You&apos;re a member 🎉</h3>
                <p className="pro-sub">
                  TheBookX Exclusive is active
                  {statusInfo?.daysLeft
                    ? ` · ${statusInfo.daysLeft} days left`
                    : ""}
                  . Your member pricing is now applied.
                </p>
                <button type="button" className="pro-cta" onClick={onClose}>
                  Continue with member pricing
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
