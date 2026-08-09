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
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const UPI_ID = "7977960242-1@okbizaxis";
const SUPPORT_WA = "917710892108";

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

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=TheBookX&am=${amount}&cu=INR&tn=${encodeURIComponent(
    `Order ${orderId}`,
  )}`;

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

  const confirmUpi = () =>
    waConfirm(
      `Hi TheBookX, I've paid ₹${amount} for my order ${orderId} via ${method}. Please confirm my payment.\n\nOrder details: ${orderLink}`,
    );

  const submitGift = () => {
    const code = giftCode.trim();
    if (code.length < 4) return;
    waConfirm(
      `Hi TheBookX, paying for order ${orderId} with ${giftMethod}.\n\nAmazon gift card code: ${code}\nAmount: ₹${amount}\n\nOrder details: ${orderLink}`,
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
                  { k: "Paytm", c: "#00baf2" },
                  { k: "PhonePe", c: "#5f259f" },
                  { k: "Google Pay", c: "#1a73e8" },
                  { k: "Other UPI apps", c: "#fb8500" },
                ].map((app) => (
                  <button
                    key={app.k}
                    type="button"
                    className="paymeth-app"
                    onClick={() => chooseUpi(app.k)}
                  >
                    <span
                      className="paymeth-app-ic"
                      style={{ background: app.c }}
                    >
                      {app.k === "Other UPI apps" ? (
                        <Smartphone size={18} />
                      ) : (
                        app.k[0]
                      )}
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
            <div className="paynow-upi-id">{UPI_ID}</div>
            <a href={upiLink} className="pri-big-btn paynow-upi-open">
              Open {method} <ArrowRight size={16} />
            </a>
            <button
              type="button"
              className="sec-big-btn paynow-upi-done"
              onClick={confirmUpi}
            >
              <FaWhatsapp size={16} color="#25D366" />
              I&apos;ve paid — confirm on WhatsApp
            </button>
            <p className="paymeth-gift-fine">
              Scan the QR in any UPI app, or tap “Open {method}”. Then confirm so
              we can dispatch your order.
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
