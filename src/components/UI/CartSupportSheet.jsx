"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Check, Mail, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SUPPORT_WHATSAPP = "917710892108";
const SUPPORT_EMAIL = "uskillbook@gmail.com";

// Pre-purchase "Need support?" bottom-sheet for the checkout bag. The shopper
// picks a common question; we compose a WhatsApp/email message that already
// carries their bag details (books, add-ons, payment choice, total, name) so
// support can help instantly without asking for everything again.
export default function CartSupportSheet({
  open,
  onClose,
  name = "",
  phone = "",
  books = [], // [{ name, qty, price }]
  total = 0,
  giftWrap = false,
  bookmarkQty = 0,
  paymentLabel = "",
}) {
  const [selected, setSelected] = useState(0);

  const num = String(phone || "").replace(/\D/g, "").slice(-10);

  // ── Build the bag-details block appended to every message ──
  const bookLines = (books || [])
    .map(
      (b) =>
        `• ${b.name}${(b.qty || 1) > 1 ? ` ×${b.qty}` : ""}${
          b.price ? ` — ₹${b.price}` : ""
        }`,
    )
    .join("\n");
  const addOns = [];
  if (giftWrap) addOns.push("Gift wrap");
  if (bookmarkQty > 0)
    addOns.push(`${bookmarkQty} bookmark${bookmarkQty > 1 ? "s" : ""}`);
  const addOnStr = addOns.length ? addOns.join(", ") : "None";

  const details =
    `\n\n— My bag —` +
    (bookLines ? `\n${bookLines}` : "") +
    `\nAdd-ons: ${addOnStr}` +
    (paymentLabel ? `\nPayment: ${paymentLabel}` : "") +
    (total ? `\nTotal: ₹${total}` : "") +
    (name ? `\nName: ${name}` : "") +
    (num ? `\nNumber: ${num}` : "");

  const topics = [
    { label: "When will my order be delivered?", q: "Could you tell me when my order would be delivered?" },
    { label: "Will I get a discount or offer?", q: "Are there any discounts or offers I can get on this order?" },
    { label: "What is faster delivery?", q: "What is faster delivery and is it worth it for my order?" },
    { label: "Is Cash on Delivery available?", q: "Is Cash on Delivery available for my order and area?" },
    { label: "Are the books original & good quality?", q: "Are these books original and in good quality?" },
    { label: "Can I add or change books?", q: "Can I add or change the books in my order before it ships?" },
    { label: "How do free bookmarks work?", q: "How do the free bookmarks work with my order?" },
    { label: "How does the wallet / coins work?", q: "How do the wallet coins work and can I use them here?" },
    { label: "Do you deliver to my pincode?", q: "Do you deliver to my area / pincode?" },
    { label: "Can I pay in two parts?", q: "How does 'Pay in two parts' work for my order?" },
    { label: "Return & refund policy?", q: "What is your return and refund policy for this order?" },
    { label: "Something else", q: "I need some help with my order." },
  ];

  const topic = topics[selected] || topics[0];
  const message = `Hi TheBookX, ${topic.q}${details}`;

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose && onClose();
  };
  const openEmail = () => {
    const subject = `TheBookX support: ${topic.label}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(message)}`;
    onClose && onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 100000 }}
        >
          <motion.div
            className="bill-modal support-sheet"
            style={{ maxWidth: "500px" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="support-head">
              <div className="support-head-titles">
                <span className="support-head-title">
                  <MessageCircle size={18} /> Need support?
                </span>
                <p className="support-head-sub">
                  Pick what you need — we&apos;ll reach you on WhatsApp or email
                  with your bag details ready.
                </p>
              </div>
              <button
                type="button"
                className="support-head-x"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="support-reasons">
              {topics.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  className={`support-reason${selected === i ? " active" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  <span
                    className={`support-reason-radio${selected === i ? " on" : ""}`}
                  >
                    {selected === i && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="support-actions">
              <button
                type="button"
                className="sec-big-btn support-wa"
                onClick={openWhatsApp}
              >
                <FaWhatsapp size={17} /> WhatsApp
              </button>
              <button
                type="button"
                className="sec-big-btn support-email"
                onClick={openEmail}
              >
                <Mail size={16} /> Email us
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
