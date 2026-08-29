"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Copy, Check, ShieldCheck, Wallet } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { appendWalletTx } from "@/utils/googleFormOrder";
import { showToast } from "@/context/ToastContext";
import OrderPlacedSuccess from "./OrderPlacedSuccess";

const UPI_ID = "7977960242-1@okbizaxis";
const SUPPORT_WHATSAPP = "917710892108";
const AMOUNT_CHIPS = [100, 200, 500, 1000];
const MIN_AMOUNT = 20;

export default function RechargeModal({ isOpen, onClose, phone }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState("amount"); // amount | pay | done
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rechargeId, setRechargeId] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  const amt = parseInt(amount, 10) || 0;

  // Reset when reopened.
  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setAmount("");
      setSubmitting(false);
      setRechargeId("");
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen]);

  // Poll the Wallet sheet every 3s. The pending recharge row is hidden until an
  // admin removes its "unconfirmed" marker; once it appears, it's confirmed.
  useEffect(() => {
    if (step !== "pay" || !rechargeId || digits.length !== 10) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/wallet?phone=${digits}`, {
          cache: "no-store",
        });
        const json = await res.json();
        const entries = Array.isArray(json.entries) ? json.entries : [];
        const confirmed = entries.some(
          (e) => String(e.orderId || "").trim() === rechargeId,
        );
        if (confirmed) {
          clearInterval(pollRef.current);
          try {
            navigator.vibrate && navigator.vibrate([30, 40, 60]);
          } catch (_) {}
          setStep("done");
        }
      } catch (_) {}
    }, 3000);
    return () => pollRef.current && clearInterval(pollRef.current);
  }, [step, rechargeId, digits]);

  const submitAmount = async () => {
    if (digits.length !== 10) {
      showToast("Please sign in with your number first.", "warning");
      return;
    }
    if (amt < MIN_AMOUNT) {
      showToast(`Minimum recharge is ₹${MIN_AMOUNT}.`, "warning");
      return;
    }
    setSubmitting(true);
    const id = `RCG${Date.now()}`;
    // Write a PENDING recharge row (won't count toward balance until confirmed).
    await appendWalletTx(digits, {
      amount: amt,
      type: "Recharge (unconfirmed)",
      reason: "Recharge",
      orderId: id,
    });
    setRechargeId(id);
    setSubmitting(false);
    setStep("pay");
  };

  const copyUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (_) {}
  };

  const verifyOnWhatsApp = () => {
    const msg = [
      "Hi TheBookX,",
      "",
      `I've *paid ₹${amt}* to recharge my wallet. Please confirm it.`,
      `*Recharge ID:* ${rechargeId}`,
      `*Phone:* ${digits}`,
      "",
      "Thank you!",
    ].join("\n");
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && step === "done" && (
        <OrderPlacedSuccess
          key="rcg-done"
          title="Wallet recharged"
          subtitle="Taking you to your wallet…"
          onDone={() => {
            if (typeof window !== "undefined")
              window.location.assign("/profile");
          }}
        />
      )}

      {isOpen && step !== "done" && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bill-modal rcg-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="bill-header">
              <span className="weight-600 font-16 flex items-center gap-8">
                <Wallet size={16} />
                {step === "amount" ? "Recharge wallet" : `Pay ₹${amt}`}
              </span>
              <span className="cursor-pointer" onClick={onClose}>
                <X size={18} />
              </span>
            </div>

            {step === "amount" ? (
              <div className="rcg-body">
                <p className="rcg-hint">
                  Add money to your TheBookX wallet and use it on any order.
                </p>
                <div className="rcg-chips">
                  {AMOUNT_CHIPS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`rcg-chip${amt === v ? " on" : ""}`}
                      onClick={() => setAmount(String(v))}
                    >
                      ₹{v}
                    </button>
                  ))}
                </div>
                <div className="rcg-input-wrap">
                  <span className="rcg-cc">₹</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="rcg-input"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/\D/g, "").slice(0, 5))
                    }
                  />
                </div>
                <button
                  type="button"
                  className="pri-big-btn width100 rcg-submit"
                  onClick={submitAmount}
                  disabled={submitting || amt < MIN_AMOUNT}
                >
                  {submitting ? "Please wait…" : `Recharge ₹${amt || 0}`}
                </button>
              </div>
            ) : (
              <div className="rcg-body">
                <div className="rcg-qr-card">
                  <div className="rcg-qr-top">
                    <span className="rcg-qr-payee">Paying to TheBookX</span>
                    <span className="rcg-qr-amt">₹{amt}</span>
                  </div>
                  <div className="rcg-qr-img">
                    <Image
                      src="/books/uskillbook.png"
                      alt="UPI QR code"
                      width={260}
                      height={312}
                    />
                  </div>
                  <span className="rcg-qr-scan">
                    Scan with any UPI app and pay ₹{amt}
                  </span>
                  <button type="button" className="rcg-upi" onClick={copyUpi}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : `Copy UPI ID · ${UPI_ID}`}
                  </button>
                </div>

                <div className="rcg-verify">
                  <span className="rcg-spin" />
                  <div className="rcg-verify-txt">
                    <strong>Verifying your recharge…</strong>
                    <span>
                      We&apos;ll confirm automatically once your payment lands.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="sec-big-btn width100 rcg-wa"
                  onClick={verifyOnWhatsApp}
                >
                  <FaWhatsapp size={18} color="#25D366" />
                  Verify on WhatsApp
                </button>

                <span className="rcg-trust">
                  <ShieldCheck size={13} /> Secure UPI · added to your wallet
                  after confirmation
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
