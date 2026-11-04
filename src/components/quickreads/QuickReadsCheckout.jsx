"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
  X,
  Zap,
  User,
  Phone,
  Check,
  ArrowRight,
  ArrowLeft,
  TrendingDown,
  Smartphone,
  Info,
} from "lucide-react";
import {
  QUICKREAD_PRICE,
  QUICKREAD_MRP,
  SUB_MONTHLY_PRICE,
  SUB_YEARLY_PRICE,
} from "@/data/quickreadsMeta";
import {
  submitQuickReadOrder,
  notifyQuickReadCheckoutTelegram,
  setSavedPhone,
  checkApproval,
  grantBookAccess,
  submitSubscriptionOrder,
  checkSubscription,
  getSavedPhone,
} from "@/lib/quickreads";
import { showToast } from "@/context/ToastContext";
import OrderPlacedSuccess from "@/components/UI/OrderPlacedSuccess";
import dynamic from "next/dynamic";

// The UPI screen is shared with the book checkout; load it only when needed.
const UPIPaymentModal = dynamic(
  () => import("@/components/UI/AddressModal").then((m) => m.UPIPaymentModal),
  { ssr: false },
);

const FastCheckout = () => (
  <span className="fc-badge">
    <Zap size={11} strokeWidth={2.6} /> Faster checkout
  </span>
);

const UPI_ID = "7977960242-1@okbizaxis";
const QR_IMAGE = "/books/uskillbook.png";
const WA_NUMBER = "917710892108";

// QuickReads checkout — same steps as the book checkout (details → payment
// method → UPI), minus delivery and Cash on Delivery since QuickReads are
// digital.
export default function QuickReadsCheckout({
  items = [],
  onClose,
  onPaid,
  plan = "single", // "single" (per-book) · "monthly" · "yearly"
  variant = "sheet", // "sheet" = bottom bill-modal · "center" = centered dialog
}) {
  const isCenter = variant === "center";
  const isSub = plan === "monthly" || plan === "yearly";
  const planLabel = plan === "yearly" ? "Unlimited · Yearly" : "Unlimited · Monthly";
  const [step, setStep] = useState("details"); // details | paysel | upi | success
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false); // order written to sheet
  const [prefilled, setPrefilled] = useState(false); // logged-in details found
  // UPI screen state (mirrors the book checkout's UPI modal).
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiPhase, setUpiPhase] = useState("await"); // await | counting | ready | rechecking | success | failed
  const [countdown, setCountdown] = useState(30);
  const [upiCopied, setUpiCopied] = useState(false);
  const checkingRef = useRef(false);
  const orderedAt = useRef(0); // when this attempt's order was written
  const timers = useRef([]);
  useEffect(() => setMounted(true), []);

  // Prefill from the logged-in profile so returning readers skip the form.
  useEffect(() => {
    try {
      const p = (
        localStorage.getItem("track_orders_phone") ||
        getSavedPhone() ||
        ""
      )
        .replace(/\D/g, "")
        .slice(-10);
      const n = (localStorage.getItem("track_orders_name") || "").trim();
      if (p) setMobile(p);
      if (n) setName(n);
      if (p.length === 10 && n) setPrefilled(true);
    } catch {}
  }, []);

  const clearTimers = () => {
    timers.current.forEach((t) => clearInterval(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const amount = isSub
    ? plan === "yearly"
      ? SUB_YEARLY_PRICE
      : SUB_MONTHLY_PRICE
    : items.length * QUICKREAD_PRICE;
  const mrpTotal = isSub ? 0 : items.length * QUICKREAD_MRP;
  const mrpSaving = Math.max(0, mrpTotal - amount);
  const phoneDigits = mobile.replace(/\D/g, "");
  const nameOk = name.trim().length >= 2;
  const phoneOk = /^[6-9]\d{9}$/.test(phoneDigits);
  const canContinue = nameOk && phoneOk;

  // Write the order to the sheet as "Paid (unverified)".
  const writeOrder = async () => {
    setSavedPhone(phoneDigits);
    orderedAt.current = Date.now();
    // One Telegram message for the whole order, with Passed / Failed buttons.
    notifyQuickReadCheckoutTelegram({
      name: name.trim(),
      mobile: phoneDigits,
      items,
      plan,
      amount,
    });
    if (isSub) {
      await submitSubscriptionOrder({ name: name.trim(), mobile: phoneDigits, plan });
      return;
    }
    for (const book of items) {
      const order = {
        name: name.trim(),
        mobile: phoneDigits,
        bookId: book.id,
        bookName: book.name,
        amount: QUICKREAD_PRICE,
        paymentMethod: "UPI Payment",
        paymentStatus: "Paid (unverified)",
        approvalStatus: "Pending",
      };
      // eslint-disable-next-line no-await-in-loop
      await submitQuickReadOrder(order);
    }
  };

  // Read the sheet: once every item is verified → success + unlock.
  const runCheck = async () => {
    if (checkingRef.current || phoneDigits.length !== 10) return false;
    checkingRef.current = true;
    try {
      if (isSub) {
        const sub = await checkSubscription(phoneDigits);
        if (sub.active) {
          finishPaid({ subscription: sub });
          return true;
        }
        const subId = plan === "yearly" ? "SUB-YEARLY" : "SUB-MONTHLY";
        if ((await checkApproval(phoneDigits, subId, orderedAt.current)) === "failed")
          markFailed();
        return false;
      }
      const results = await Promise.all(
        items.map((b) => checkApproval(phoneDigits, b.id, orderedAt.current)),
      );
      if (results.some((r) => r === "failed")) {
        markFailed();
        return false;
      }
      if (results.length > 0 && results.every((r) => r === "approved")) {
        items.forEach((b) => grantBookAccess(b.id, phoneDigits));
        finishPaid({});
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      checkingRef.current = false;
    }
  };

  // Telegram ❌ Failed → the same "Payment failed" screen as the book checkout.
  const markFailed = () => {
    clearTimers();
    setUpiPhase("failed");
  };

  const finishPaid = (extra) => {
    clearTimers();
    setUpiPhase("success");
    onPaid?.({ name: name.trim(), mobile: phoneDigits, plan, ...extra });
    setTimeout(() => setStep("success"), 1400);
  };

  // While the UPI screen is open and the order is written, poll every 3s.
  useEffect(() => {
    if (step !== "upi" || !confirmed || upiPhase === "success" || upiPhase === "failed")
      return;
    const iv = setInterval(runCheck, 3000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, confirmed, upiPhase]);

  // A 30s countdown, then `after` runs (used by the first wait and re-checks).
  const startCountdown = (phase, after) => {
    clearTimers();
    setUpiPhase(phase);
    setCountdown(30);
    const iv = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(iv);
          after();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    timers.current.push(iv);
  };

  // Pay → write the order, open the UPI screen (QR "generates" for 2s, then a
  // 30s wait before Verify / WhatsApp appear — same as the book checkout).
  const beginPayment = async (retry = false) => {
    if (busy) return;
    setBusy(true);
    setQrUnlocked(false);
    setStep("upi");
    setUpiPhase("await");
    try {
      if (!confirmed || retry) {
        await writeOrder();
        setConfirmed(true);
      }
    } catch (e) {
      console.error("QuickReads order failed", e);
      showToast("Something went wrong. Please try again.", "error");
      setStep("paysel");
      setBusy(false);
      return;
    }
    setBusy(false);
    const t = setTimeout(() => {
      setQrUnlocked(true);
      startCountdown("counting", () => setUpiPhase("ready"));
    }, 2000);
    timers.current.push(t);
  };

  const onVerifyStatus = async () => {
    const ok = await runCheck();
    if (!ok) startCountdown("rechecking", () => setUpiPhase("ready"));
  };

  const onWhatsApp = () => {
    const what = isSub
      ? planLabel
      : items.map((b) => b.name).join(", ");
    const msg = `Hi, I just paid ₹${amount} for QuickReads (${what}). My number: ${phoneDigits}. Please verify my payment.`;
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2500);
    } catch {
      showToast("Couldn't copy — long-press the UPI ID.", "info");
    }
  };

  const downloadQr = () => {
    const a = document.createElement("a");
    a.href = QR_IMAGE;
    a.download = "thebookx-quickreads-upi-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!mounted) return null;

  const footerTotal = (
    <div className="ps-foot-total">
      <span className="ps-foot-total-l">
        <small>Total payable</small>
        <b>₹{amount}</b>
      </span>
      {mrpSaving > 0 && (
        <span className="ps-foot-saved ps-foot-mrp">
          <TrendingDown size={13} /> ₹{mrpSaving} saved
          <small>on MRP</small>
        </span>
      )}
    </div>
  );

  const summary = (
    <div className="qrc-items">
      {isSub ? (
        <div className="qrc-item">
          <span className="qrc-item-name">
            {planLabel} · every QuickRead unlocked
          </span>
          <span className="qrc-item-price">₹{amount}</span>
        </div>
      ) : (
        items.map((b) => (
          <div key={b.id} className="qrc-item">
            <span className="qrc-item-name">{b.name}</span>
            <span className="qrc-item-price">
              <s className="qrc-item-mrp">₹{QUICKREAD_MRP}</s> ₹{QUICKREAD_PRICE}
            </span>
          </div>
        ))
      )}
    </div>
  );

  const sheet = (
    <motion.div
      className={`bill-modal-overlay qrc-overlay${isCenter ? " qrc-overlay-center" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bill-modal pay-sel-modal qrc-flow${isCenter ? " qrc-modal-center" : " qrc-modal-sheet"}`}
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
        {step === "details" && (
          <>
            <div className="bill-header">
              <span className="flex items-center gap-8">
                <span className="weight-600 font-16">Your details</span>
                <span className="ps-step-badge">Step 1/2</span>
                <FastCheckout />
              </span>
              <button
                type="button"
                className="bm2-x"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            <div className="pay-sel qrc-body">
              {summary}
              <div className="qrc-digital">
                <Zap size={14} />
                <span>
                  Digital · unlocks on your mobile number, nothing is shipped
                </span>
              </div>

              <div className="dd-sec-title">
                <span className="dd-sec-ic">
                  <User size={15} />
                </span>
                Who&apos;s reading?
              </div>
              {prefilled ? (
                <div className="qrc-payingas">
                  <span className="qrc-payingas-ic">
                    <User size={16} />
                  </span>
                  <div className="qrc-payingas-txt">
                    <strong>{name}</strong>
                    <small>+91 {mobile}</small>
                  </div>
                  <button
                    type="button"
                    className="qrc-payingas-change"
                    onClick={() => setPrefilled(false)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="qrc-fields">
                  <div className="input-group">
                    <label className="flex flex-row gap-4 items-center">
                      <User size={14} /> Name <span className="red">*</span>
                    </label>
                    <input
                      className={`sec-mid-btn width100${touched && !nameOk ? " error-border" : ""}`}
                      placeholder="Your name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="flex flex-row gap-4 items-center">
                      <Phone size={14} /> Mobile number <span className="red">*</span>
                    </label>
                    <input
                      className={`sec-mid-btn width100${touched && !phoneOk ? " error-border" : ""}`}
                      placeholder="10-digit mobile"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                    />
                  </div>
                  <p className="qrc-hint">
                    <Smartphone size={13} /> Your QuickReads unlock on this
                    number. Use it to sign in on any device.
                  </p>
                </div>
              )}
            </div>

            <div className="pay-sel-footer">
              {footerTotal}
              <button
                type="button"
                className="pri-big-btn width100"
                onClick={() => {
                  if (!canContinue) {
                    setTouched(true);
                    showToast(
                      !nameOk
                        ? "Please enter your name"
                        : "Please enter a valid 10-digit mobile number",
                      "error",
                    );
                    return;
                  }
                  setStep("paysel");
                }}
              >
                <span className="flex flex-row items-center justify-center gap-6">
                  Continue to payment <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </>
        )}

        {step === "paysel" && (
          <>
            <div className="bill-header">
              <span className="flex items-center gap-8">
                <button
                  type="button"
                  className="ps-back-btn"
                  onClick={() => setStep("details")}
                  aria-label="Back to your details"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="weight-600 font-16">Choose payment method</span>
                <span className="ps-step-badge">Step 2/2</span>
                <FastCheckout />
              </span>
              <button
                type="button"
                className="bm2-x"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            <div className="pay-sel qrc-body">
              <div className="pay-methods">
                <span className="deliv-addon-head pay-methods-head">
                  Payment method
                </span>
                <button type="button" className="pay-method pm2 selected">
                  <span className="pm2-main">
                    <span className="pm2-titlerow">
                      <span className="pm2-upi">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path d="M4 4 L13 12 L4 20 Z" fill="#ff8500" />
                          <path d="M9 4 L18 12 L9 20 Z" fill="#0a8f0c" />
                        </svg>
                      </span>
                      <span className="pm2-title">Pay Online</span>
                      <span className="pm2-badge">UPI</span>
                    </span>
                    <span className="pay-perks">
                      <span className="pay-perk">Instant access</span>
                      <span className="pay-perk">GPay · PhonePe · Paytm</span>
                    </span>
                  </span>
                  <span className="pm2-pricecol">
                    {mrpTotal > amount && (
                      <span className="pm2-strike">₹{mrpTotal}</span>
                    )}
                    <span className="pm2-price">₹{amount}</span>
                  </span>
                  <span className="pay-method-radio on" aria-hidden="true">
                    <Check size={13} strokeWidth={3} />
                  </span>
                </button>
              </div>
              <p className="qrc-nocod">
                <Info size={13} /> QuickReads are digital, so Cash on Delivery
                isn&apos;t available.
              </p>
              <div className="qrc-sum-head">Order summary</div>
              {summary}
            </div>

            <div className="pay-sel-footer">
              {footerTotal}
              <div className="pay-sel-footer-row">
                <a
                  className="sec-big-btn pay-sel-wa"
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi, I need help with my QuickReads order")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Need support?"
                >
                  <FaWhatsapp size={18} color="#25D366" />
                  <span>Need support?</span>
                </a>
                <button
                  type="button"
                  className="pri-big-btn pay-confirm-btn"
                  disabled={busy}
                  onClick={() => beginPayment()}
                >
                  <span className="flex flex-row items-center justify-center gap-6">
                    {busy ? "Please wait…" : `Pay ₹${amount}`}
                    {!busy && <ArrowRight size={18} strokeWidth={2.5} />}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <OrderPlacedSuccess
            title="Payment successful"
            subtitle="Unlocking your QuickReads…"
            onDone={() => {
              if (typeof window !== "undefined")
                window.location.assign("/my-quickreads");
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );

  return createPortal(
    <>
      {step !== "upi" && sheet}
      <AnimatePresence>
        {step === "upi" && (
          <div className="qrc-upi-layer">
            <UPIPaymentModal
              totalToPay={amount}
              qrUnlocked={qrUnlocked}
              upiCopied={upiCopied}
              upiPhase={upiPhase}
              verifyCountdown={countdown}
              upiId={UPI_ID}
              onVerifyStatus={onVerifyStatus}
              onCopyUpi={copyUpi}
              onDownloadQR={downloadQr}
              onCheckStatus={runCheck}
              onTryAgain={() => beginPayment(true)} // fresh order + message
              onWhatsAppFallback={onWhatsApp}
              onClose={() => {
                clearTimers();
                setStep("paysel");
              }}
              summaryName={name}
              summaryItems={
                isSub
                  ? [{ name: planLabel, qty: 1, price: amount }]
                  : items.map((b) => ({ name: b.name, qty: 1, price: QUICKREAD_PRICE }))
              }
            />
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
