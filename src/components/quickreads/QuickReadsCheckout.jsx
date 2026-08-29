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
import {
  QUICKREAD_PRICE,
  QUICKREAD_MRP,
  SUB_MONTHLY_PRICE,
  SUB_YEARLY_PRICE,
} from "@/data/quickreads";
import {
  submitQuickReadOrder,
  notifyQuickReadTelegram,
  setSavedPhone,
  checkApproval,
  grantBookAccess,
  submitSubscriptionOrder,
  checkSubscription,
} from "@/lib/quickreads";
import { showToast } from "@/context/ToastContext";
import OrderPlacedSuccess from "@/components/UI/OrderPlacedSuccess";

const UPI_ID = "7977960242-1@okbizaxis";
const QR_IMAGE = "/books/uskillbook.png";

export default function QuickReadsCheckout({
  items = [],
  onClose,
  onPaid,
  plan = "single", // "single" (per-book) · "monthly" · "yearly"
  variant = "sheet", // "sheet" = bottom bill-modal · "center" = centered dialog
}) {
  const isCenter = variant === "center";
  const isSub = plan === "monthly" || plan === "yearly";
  const planLabel = plan === "yearly" ? "Unlimited — Yearly" : "Unlimited — Monthly";
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

  // Once the order is written to the sheet (unconfirmed), poll the sheet every
  // 3 seconds until an admin verifies the payment — then jump to success.
  useEffect(() => {
    if (!confirmed || step === "success") return;
    const iv = setInterval(() => {
      runCheck();
    }, 3000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, step]);
  const canVerify = true;

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

  const amount = isSub
    ? plan === "yearly"
      ? SUB_YEARLY_PRICE
      : SUB_MONTHLY_PRICE
    : items.length * QUICKREAD_PRICE;
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
      if (isSub) {
        await submitSubscriptionOrder({ name: name.trim(), mobile: phone, plan });
        notifyQuickReadTelegram({
          name: name.trim(),
          mobile: phone,
          bookId: plan === "yearly" ? "SUB-YEARLY" : "SUB-MONTHLY",
          bookName: planLabel,
          amount,
          paymentMethod: "UPI Payment",
          paymentStatus: "Paid (unverified)",
        });
      } else {
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
      }
      setConfirmed(true); // starts the 30s countdown before Verify enables
    } catch (e) {
      console.error("QuickReads confirm failed", e);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  // Continue → immediately write the (unconfirmed) order to the sheet, reveal
  // the QR and begin auto-verifying every 3s.
  const startPayment = async () => {
    if (busy || confirmed) return;
    setStep("pay");
    setQrOpen(true);
    await handleConfirm();
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
      if (isSub) {
        const sub = await checkSubscription(phone);
        if (sub.active) {
          onPaid?.({ name: name.trim(), mobile: phone, plan, subscription: sub });
          setStep("success");
          return true;
        }
        return false;
      }
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
                  : isSub
                    ? planLabel
                    : "Unlock QuickReads"}
            </span>
            {(step === "details" || step === "pay") && (
              <span className="font-12 dark-50">
                {isSub
                  ? `Every QuickRead · ₹${amount}`
                  : `${items.length} book${items.length > 1 ? "s" : ""} · ₹${amount}`}
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
              {isSub ? (
                <div className="qrc-item">
                  <span className="qrc-item-name">
                    {planLabel} · unlimited access to every QuickRead
                  </span>
                  <span className="qrc-item-price">₹{amount}</span>
                </div>
              ) : (
                items.map((b) => (
                  <div key={b.id} className="qrc-item">
                    <span className="qrc-item-name">{b.name}</span>
                    <span className="qrc-item-price">
                      <s className="qrc-item-mrp">₹{QUICKREAD_MRP}</s> ₹
                      {QUICKREAD_PRICE}
                    </span>
                  </div>
                ))
              )}
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
              disabled={!canContinue || busy}
              onClick={startPayment}
              style={!canContinue || busy ? { opacity: 0.55 } : undefined}
            >
              {busy ? "Please wait…" : `Continue to Pay ₹${amount}`}
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
                  Scan &amp; pay ₹{amount} with any UPI app. We&apos;ll verify it
                  automatically.
                </p>
                <div className="qrc-verify-row">
                  <span className="qrc-processing-spin sm" aria-hidden />
                  <span>
                    {checking ? "Checking payment…" : "Verifying your payment…"}
                  </span>
                </div>
                <button
                  type="button"
                  className="sec-big-btn width100"
                  onClick={runCheck}
                  disabled={checking}
                  style={checking ? { opacity: 0.6 } : undefined}
                >
                  {checking ? "Checking…" : "I've paid — check now"}
                </button>
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
          <OrderPlacedSuccess
            title="Payment successful"
            subtitle="Unlocking your QuickReads…"
            onDone={() => {
              if (typeof window !== "undefined")
                window.location.assign("/profile");
            }}
          />
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
