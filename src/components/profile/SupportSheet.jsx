"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Mail, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SUPPORT_WHATSAPP = "917710892108";
const SUPPORT_EMAIL = "uskillbook@gmail.com";

// "How can we help?" bottom-sheet — pick a reason, then reach us on WhatsApp
// or by email. The same reason message is prefilled into whichever channel is
// chosen. Shared by the profile, orders list and order detail pages.
export default function SupportSheet({ phone = "", orderId = "", onClose }) {
  const num = String(phone || "").replace(/\D/g, "").slice(-10);
  const ref = orderId ? ` (order ${orderId})` : "";
  const sig = num ? ` My number is ${num}.` : "";

  const topics = [
    { label: "Where is my order?", msg: `Hi TheBookX, I'd like an update on where my order is${ref}.${sig}` },
    { label: "Delivery estimate", msg: `Hi TheBookX, when can I expect my order${ref} to be delivered?${sig}` },
    { label: "Change delivery address", msg: `Hi TheBookX, I'd like to change the delivery address for my order${ref}.${sig}` },
    { label: "Payment help", msg: `Hi TheBookX, I need help with the payment for my order${ref}.${sig}` },
    { label: "Wrong or damaged item", msg: `Hi TheBookX, I received a wrong or damaged item${ref} and need help.${sig}` },
    { label: "Bookmark compensation", msg: `Hi TheBookX, I'd like to claim compensation for my missing bookmark${ref}.${sig}` },
    { label: "Something else", msg: `Hi TheBookX, I need some help with my order${ref}.${sig}` },
  ];

  const [selected, setSelected] = useState(0);
  const topic = topics[selected] || topics[0];

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(topic.msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose && onClose();
  };

  const openEmail = () => {
    const subject = `TheBookX support: ${topic.label}${orderId ? ` — order ${orderId}` : ""}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(topic.msg)}`;
    onClose && onClose();
  };

  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
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
              <MessageCircle size={18} /> How can we help?
            </span>
            <p className="support-head-sub">
              Pick a reason, then reach us on WhatsApp or email — we&apos;ll
              have your details ready.
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
  );
}
