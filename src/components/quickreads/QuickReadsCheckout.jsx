"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
  X,
  QrCode,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Zap,
  User,
  Phone,
  Copy,
  Download,
  Check,
} from "lucide-react";
import { QUICKREAD_PRICE } from "@/data/quickreads";
import {
  submitQuickReadOrder,
  notifyQuickReadTelegram,
  setSavedPhone,
  checkApproval,
  grantBookAccess,
} from "@/lib/quickreads";
import { showToast } from "@/context/ToastContext";

const UPI_ID = "7977960242-1@okbizaxis";
const QR_IMAGE = "/books/uskillbook.png";

export default function QuickReadsCheckout({
  items = [],
  onClose,
  onPaid,
  variant = "sheet", // "sheet" = bottom bill-modal · "center" = centered dialog
}) {
  const isCenter = variant === "center";
  const [step, setStep] = useState("details"); // details | pay | processing | success
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false); // order written to sheet
  const [timer, setTimer] = useState(0); // seconds left before Verify enables
  const [checking, setChecking] = useState(false); // approval read in flight
  const [nextIn, setNextIn] = useState(30); // seconds to next auto-check
  const checkingRef = useRef(false);
  useEffect(() => setMounted(true), []);

  // 30s countdown starts once the order is confirmed (written to the sheet) —
  // gives you time to actually pay before the Verify (read) button enables.
  useEffect(() => {
    if (!confirmed) return;
    setTimer(30);
    const iv = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [confirmed]);
  const canVerify = timer === 0;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Couldn't copy — long-press the UPI ID.", "info");
    }
  };

  const handleDownloadQr = () => {
    const a = document.createElement("a");
    a.href = QR_IMAGE;
    a.download = "thebookx-quickreads-upi-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const amount = items.length * QUICKREAD_PRICE;
  const mobileValid = mobile.replace(/\D/g, "").length === 10;
  const canContinue = name.trim() && mobileValid;

  // CONFIRM = write the order to the sheet as "Paid (unverified)".
  // This is what "reaches the sheet" — it does not read anything back.
  const handleConfirm = async () => {
    if (busy || confirmed) return;
    setBusy(true);
    const phone = mobile.replace(/\D/g, "");
    setSavedPhone(phone);
    try {
      for (const book of items) {
        const order = {
          name: name.trim(),
          mobile: phone,
          bookId: book.id,
          bookName: book.name,
          amount: QUICKREAD_PRICE,
          paymentMethod: "UPI Payment",
          paymentStatus: "Paid (unverified)",
          approvalStatus: "Pending",
        };
        // eslint-disable-next-line no-await-in-loop
        await submitQuickReadOrder(order);
        notifyQuickReadTelegram(order);
      }
      setConfirmed(true); // starts the 30s countdown before Verify enables
    } catch (e) {
      console.error("QuickReads confirm failed", e);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  // VERIFY = read the sheet only. If "unverified" has been removed → success;
  // otherwise move to the processing screen (which keeps polling).
  const handleVerifyRead = async () => {
    const ok = await runCheck();
    if (!ok) setStep("processing");
  };

  // Read the sheet: if every item's payment is verified → success + unlock.
  const runCheck = async () => {
    if (checkingRef.current) return false;
    const phone = mobile.replace(/\D/g, "");
    if (phone.length !== 10) return false;
    checkingRef.current = true;
    setChecking(true);
    try {
      const results = await Promise.all(
        items.map((b) => checkApproval(phone, b.id)),
      );
      const allApproved =
        results.length > 0 && results.every((r) => r === "approved");
      if (allApproved) {
        items.forEach((b) => grantBookAccess(b.id, phone));
        onPaid?.({ name: name.trim(), mobile: phone });
        setStep("success");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  };

  // While processing: first read after 30s, then re-read every 30s.
  useEffect(() => {
    if (step !== "processing") return;
    setNextIn(30);
    let active = true;
    const iv = setInterval(() => {
      setNextIn((n) => {
        if (n <= 1) {
          if (active) runCheck();
          return 30;
        }
        return n - 1;
      });
    }, 1000);
    return () => {
      active = false;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className={`bill-modal-overlay qrc-overlay${isCenter ? " qrc-overlay-center" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bill-modal qrc-modal${isCenter ? " qrc-modal-center" : " qrc-modal-sheet"}`}
        initial={
          isCenter ? { scale: 0.92, y: 24, opacity: 0 } : { y: "100%", opacity: 0 }
        }
        animate={isCenter ? { scale: 1, y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
        exit={
          isCenter ? { scale: 0.94, y: 16, opacity: 0 } : { y: "100%", opacity: 0 }
        }
        transition={
          isCenter
            ? { type: "spring", stiffness: 260, damping: 26 }
            : { duration: 0.38, ease: "easeOut" }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-600 font-16 flex flex-col">
            <span className="flex flex-row gap-8 items-center">
              <Zap size={16} />{" "}
              {step === "processing"
                ? "Payment processing"
                : step === "success"
                  ? "Payment successful"
                  : "Unlock QuickReads"}
            </span>
            {(step === "details" || step === "pay") && (
              <span className="font-12 dark-50">
                {items.length} book{items.length > 1 ? "s" : ""} · ₹{amount}
              </span>
            )}
          </span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>

        {step === "details" && (
          <div className="flex flex-col gap-12">
            <div className="qrc-items">
              {items.map((b) => (
                <div key={b.id} className="qrc-item">
                  <span className="qrc-item-name">{b.name}</span>
                  <span className="qrc-item-price">₹{QUICKREAD_PRICE}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-row justify-between gap-12">
              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <User size={14} />
                  Name <span className="red">*</span>
                </label>
                <input
                  className="sec-mid-btn width100"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <Phone size={14} />
                  Mobile Number <span className="red">*</span>
                </label>
                <input
                  className="sec-mid-btn width100"
                  placeholder="10-digit mobile number"
                  inputMode="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
              </div>
            </div>

            <p className="font-12 dark-50">
              Your mobile number unlocks your QuickReads after payment is
              verified.
            </p>

            <button
              type="button"
              className="pri-big-btn width100"
              disabled={!canContinue}
              onClick={() => setStep("pay")}
              style={!canContinue ? { opacity: 0.55 } : undefined}
            >
              Continue to Pay ₹{amount}
            </button>
          </div>
        )}

        {step === "pay" && (
          <div className="flex flex-col gap-12">
            <div className="bill-row total">
              <span className="font-16 weight-600">Total to Pay</span>
              <span className="font-20 weight-700 green">₹{amount}</span>
            </div>

            {!qrOpen ? (
              <div className="qrc-pay-card">
                <div className="qrc-qr-ic">
                  <QrCode size={26} />
                </div>
                <p className="qrc-pay-title">Ready to pay ₹{amount}?</p>
                <p className="qrc-pay-sub">Tap below to reveal the UPI QR code</p>
                <button
                  type="button"
                  className="pri-big-btn width100"
                  onClick={() => setQrOpen(true)}
                >
                  Reveal QR Code to Pay
                </button>
              </div>
            ) : (
              <div className="qrc-pay-card">
                <img src={QR_IMAGE} alt="UPI QR" className="qrc-qr-img" />
                <p className="qrc-upi-id">{UPI_ID}</p>
                <div className="qrc-upi-actions">
                  <button
                    type="button"
                    className="qrc-upi-action"
                    onClick={handleCopyUpi}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy UPI ID"}
                  </button>
                  <button
                    type="button"
                    className="qrc-upi-action"
                    onClick={handleDownloadQr}
                  >
                    <Download size={15} /> Download QR
                  </button>
                </div>
                <p className="qrc-pay-sub">
                  {confirmed
                    ? "Paid? Tap Verify — we'll check the payment status."
                    : `Scan & pay ₹${amount}, then tap Confirm.`}
                </p>
                {!confirmed ? (
                  <button
                    type="button"
                    className="pri-big-btn width100"
                    onClick={handleConfirm}
                    disabled={busy}
                    style={busy ? { opacity: 0.6 } : undefined}
                  >
                    {busy ? "Confirming…" : "I've Paid — Confirm"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pri-big-btn width100"
                    onClick={handleVerifyRead}
                    disabled={!canVerify || checking}
                    style={!canVerify || checking ? { opacity: 0.6 } : undefined}
                  >
                    {checking
                      ? "Checking…"
                      : !canVerify
                        ? `Verify in ${timer}s`
                        : "Verify Payment"}
                  </button>
                )}
              </div>
            )}
            <div className="qrc-trust">
              <ShieldCheck size={14} /> Secure · access unlocks after quick
              verification
            </div>
            <a
              href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20QuickReads%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="qrc-help"
            >
              <FaWhatsapp size={15} color="#25D366" /> Need help? Chat on
              WhatsApp
            </a>
          </div>
        )}

        {step === "processing" && (
          <div className="qrc-done">
            <div className="qrc-processing-spin" aria-hidden />
            <h3 className="qrc-done-title">Payment processing…</h3>
            <p className="qrc-done-sub">
              We&apos;re confirming your payment for <b>{mobile}</b>. This
              usually takes under a minute — keep this open and it&apos;ll unlock
              automatically.
            </p>
            <button
              type="button"
              className="pri-big-btn width100"
              onClick={runCheck}
              disabled={checking}
              style={checking ? { opacity: 0.6 } : undefined}
            >
              {checking ? "Checking…" : `Check status now · auto in ${nextIn}s`}
            </button>
            <a
              href="https://wa.me/917710892108?text=Hi%2C%20I%20just%20paid%20for%20QuickReads%20and%20need%20help"
              target="_blank"
              rel="noopener noreferrer"
              className="qrc-help"
            >
              <FaWhatsapp size={15} color="#25D366" /> Need help? Chat on
              WhatsApp
            </a>
          </div>
        )}

        {step === "success" && (
          <div className="qrc-done">
            <div className="qrc-done-ic">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="qrc-done-title">Payment successful 🎉</h3>
            <p className="qrc-done-sub">
              Your QuickReads are unlocked on this device. Enjoy every insight!
            </p>
            <button
              type="button"
              className="pri-big-btn width100"
              onClick={onClose}
            >
              <Sparkles size={16} /> Start reading
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
