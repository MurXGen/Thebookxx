"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crown, Tag, Truck, ShieldCheck, Loader2 } from "lucide-react";
import {
  PRO_PRICE,
  fetchProStatus,
  startProPayment,
} from "@/utils/proPlan";
import { showToast } from "@/context/ToastContext";

const BENEFITS = [
  { icon: Tag, text: "Flat 20% off every order (best price applied)" },
  { icon: ShieldCheck, text: "Zero COD handling fee" },
  { icon: Truck, text: "Free delivery on orders above ₹400" },
  { icon: Crown, text: "50% off packing & care charges" },
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

  const pay = async () => {
    const p = norm(num);
    if (p.length !== 10) return;
    setBusy(true);
    const r = await startProPayment(p);
    setBusy(false);
    if (r && r.active) {
      setStatusInfo(r);
      setStep("active");
      onActivated && onActivated(r);
      return;
    }
    setStep("paying");
    // Poll every 3s until an admin marks the payment Paid.
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="bill-modal-overlay"
          style={{ zIndex: 100001 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bill-modal pro-modal"
            style={{ maxWidth: "460px" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-head">
              <span className="pro-badge">
                <Crown size={15} /> TheBookX Exclusive
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
                      <Crown size={16} /> Pay ₹{PRO_PRICE} &amp; activate
                    </>
                  )}
                </button>
                <p className="pro-fine">
                  Valid 30 days · pay by UPI, we activate within minutes.
                </p>
              </div>
            )}

            {/* Paying / awaiting confirmation */}
            {step === "paying" && (
              <div className="pro-body pro-center">
                <span className="pro-loader" />
                <h3 className="pro-title">Confirming your payment…</h3>
                <p className="pro-sub">
                  Pay ₹{PRO_PRICE} by UPI if you haven&apos;t already. This
                  activates the moment we confirm — keep this open.
                </p>
                <button
                  type="button"
                  className="pro-ghost"
                  onClick={onClose}
                >
                  I&apos;ll check later
                </button>
              </div>
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
