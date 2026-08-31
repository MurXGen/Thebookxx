"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Smartphone,
  Gift,
  Info,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const UPI_ID = "7977960242-1@okbizaxis";
const SUPPORT_WA = "917710892108";

// Inline UPI-app brand marks (no PNG assets to host). Rendered inside the
// 40×40 tile — recognisable logos so shoppers pick the right app at a glance.
function UpiLogo({ app }) {
  if (app === "Google Pay") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
        />
      </svg>
    );
  }
  if (app === "PhonePe") {
    return <span className="upi-word upi-phonepe">Pe</span>;
  }
  if (app === "Paytm") {
    return (
      <span className="upi-word upi-paytm">
        <span style={{ color: "#00baf2" }}>pay</span>
        <span style={{ color: "#002970" }}>tm</span>
      </span>
    );
  }
  return <Smartphone size={18} />;
}

// Standalone "Pay here" flow used from the shared invoice (thebookx.in?orderID=).
// Mirrors the checkout chooser: UPI apps → QR/deep-link; Cards/net-banking &
// Amazon voucher → gift-card code. Completion is confirmed over WhatsApp since
// this runs post-order outside the checkout.
export default function PayNowChooser({
  amount = 0,
  orderId = "",
  name = "",
  phone = "",
  onClose,
}) {
  const [stage, setStage] = useState("choose"); // choose | upi | gift
  const [method, setMethod] = useState("");
  const [giftMethod, setGiftMethod] = useState("");
  const [giftCode, setGiftCode] = useState("");

  const orderLink = orderId
    ? `https://thebookx.in?orderID=${encodeURIComponent(orderId)}`
    : "";

  // Merchant-only confirmation link: opens /{orderId}, where the merchant
  // enters the password and marks the order confirmed (+ debits wallet). Same
  // flow as the checkout UPI "Verify on WhatsApp" step.
  const buildMerchantLink = async () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://thebookx.in";
    let link = `${origin}/${encodeURIComponent(orderId)}`;
    try {
      const res = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`,
      );
      const short = await res.text();
      if (short && short.startsWith("http")) link = short;
    } catch (_) {}
    return link;
  };

  const [upiCopied, setUpiCopied] = useState(false);
  const copyUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 1500);
    } catch {}
  };
  const saveQR = () => {
    const a = document.createElement("a");
    a.href = "/books/uskillbook.png";
    a.download = "thebookx-upi-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const waConfirm = (msg) => {
    window.open(
      `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose?.();
  };

  const chooseUpi = (app) => {
    setMethod(app);
    setStage("upi");
  };
  const chooseGift = (label) => {
    setGiftMethod(label);
    setGiftCode("");
    setStage("gift");
  };

  const confirmUpi = async () => {
    const merchantLink = await buildMerchantLink();
    waConfirm(
      [
        `Hi TheBookX, I've *paid ₹${amount}* for my order ${orderId} via ${method}. Please confirm my payment.`,
        "",
        `Order details: ${orderLink}`,
        "",
        "———",
        "*Merchant only* — confirm this order:",
        merchantLink,
      ].join("\n"),
    );
  };

  const submitGift = async () => {
    const code = giftCode.trim();
    if (code.length < 4) return;
    const merchantLink = await buildMerchantLink();
    waConfirm(
      [
        `Hi TheBookX, paying for order ${orderId} with ${giftMethod}.`,
        "",
        `Amazon gift card code: ${code}`,
        `Amount: ₹${amount}`,
        "",
        `Order details: ${orderLink}`,
        "",
        "———",
        "*Merchant only* — confirm this order:",
        merchantLink,
      ].join("\n"),
    );
  };

  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ maxWidth: "980px", margin: "0 auto" }}
    >
      <motion.div
        className="bill-modal paymeth-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-600 font-16 flex items-center gap-8">
            {stage !== "choose" ? (
              <>
                <button
                  type="button"
                  className="paymeth-back"
                  onClick={() => setStage("choose")}
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                {stage === "upi" ? method : giftMethod}
              </>
            ) : (
              `Pay ₹${amount}`
            )}
          </span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>

        {stage === "choose" && (
          <div className="paymeth">
            <div className="paymeth-group">
              <span className="paymeth-group-title">Pay via UPI</span>
              <div className="paymeth-apps">
                {[
                  { k: "Paytm", light: true },
                  { k: "PhonePe", c: "#5f259f" },
                  { k: "Google Pay", light: true },
                  { k: "Other UPI apps", c: "#fb8500" },
                ].map((app) => (
                  <button
                    key={app.k}
                    type="button"
                    className="paymeth-app"
                    onClick={() => chooseUpi(app.k)}
                  >
                    <span
                      className={`paymeth-app-ic${app.light ? " light" : ""}`}
                      style={app.c ? { background: app.c } : undefined}
                    >
                      <UpiLogo app={app.k} />
                    </span>
                    <span className="paymeth-app-nm">{app.k}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="paymeth-group">
              <span className="paymeth-group-title">Cards &amp; net banking</span>
              <div className="paymeth-cards">
                {["Credit card", "Debit card", "Net banking"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="paymeth-row"
                    onClick={() => chooseGift(m)}
                  >
                    <CreditCard size={18} className="paymeth-row-ic" />
                    <span className="paymeth-row-nm">{m}</span>
                    <ChevronRight size={16} className="paymeth-row-chev" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="paymeth-amazon"
              onClick={() => chooseGift("Amazon Gift Voucher")}
            >
              <span className="paymeth-amazon-ic">
                <Gift size={18} />
              </span>
              <span className="paymeth-amazon-txt">
                <strong>Amazon Gift Voucher</strong>
                <small>Already have an Amazon gift card? Redeem it.</small>
              </span>
              <ChevronRight size={16} className="paymeth-row-chev" />
            </button>
          </div>
        )}

        {stage === "upi" && (
          <div className="paynow-upi">
            <div className="paynow-upi-amt">Pay ₹{amount} to TheBookX</div>
            <img
              src="/books/uskillbook.png"
              alt="UPI QR code"
              className="paynow-qr"
            />
            <div className="paynow-upi-id-row">
              <span className="paynow-upi-id">{UPI_ID}</span>
              <button type="button" className="paynow-upi-copy" onClick={copyUpi}>
                {upiCopied ? <Check size={14} /> : <Copy size={14} />}
                {upiCopied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="paynow-upi-btns">
              <button
                type="button"
                className="sec-big-btn paynow-upi-save"
                onClick={saveQR}
              >
                <Download size={15} /> Save QR
              </button>
              <button
                type="button"
                className="pri-big-btn paynow-upi-done"
                onClick={confirmUpi}
              >
                <FaWhatsapp size={16} /> I&apos;ve paid
              </button>
            </div>
            <p className="paymeth-gift-fine">
              Scan the QR in any UPI app to pay {method === "Other UPI apps" ? "" : `via ${method}`}. Then tap “I&apos;ve paid” so we can
              dispatch your order.
            </p>
          </div>
        )}

        {stage === "gift" && (
          <div className="paymeth-gift">
            <div className="paymeth-gift-note">
              <Info size={16} />
              <p>
                To pay with <strong>{giftMethod}</strong>, buy an{" "}
                <strong>Amazon gift card worth ₹{amount}</strong> and paste the
                code below. We&apos;ll verify it and confirm your order on
                WhatsApp.
              </p>
            </div>
            <a
              href="https://www.amazon.in/dp/B08DXJP4KG"
              target="_blank"
              rel="noopener noreferrer"
              className="paymeth-gift-buy"
            >
              Buy an Amazon gift card
              <ArrowRight size={15} />
            </a>
            <label className="paymeth-gift-label">Gift card code</label>
            <input
              className="paymeth-gift-input"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              placeholder="Paste your gift-card code here"
              autoComplete="off"
            />
            <button
              type="button"
              className="pri-big-btn paymeth-gift-submit"
              disabled={giftCode.trim().length < 4}
              onClick={submitGift}
            >
              Submit &amp; confirm · ₹{amount}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
