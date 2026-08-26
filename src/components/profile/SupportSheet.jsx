"use client";

import { motion } from "framer-motion";
import { X, ChevronRight, MessageCircle } from "lucide-react";

const SUPPORT_WHATSAPP = "917710892108";

// "How can we help?" bottom-sheet — pick a topic, opens WhatsApp with a ready
// message. Shared by the profile, orders list and order detail pages.
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

  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bill-modal"
        style={{ maxWidth: "500px" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.34, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-700 font-16 flex flex-row items-center gap-6">
            <MessageCircle size={17} /> How can we help?
          </span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>
        <p className="ep-hint" style={{ marginBottom: 6 }}>
          Pick a topic and we&apos;ll open WhatsApp with a ready message.
        </p>
        <div className="support-templates">
          {topics.map((t) => (
            <button
              key={t.label}
              type="button"
              className="support-template-row"
              onClick={() => {
                window.open(
                  `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(t.msg)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
                onClose && onClose();
              }}
            >
              <span>{t.label}</span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
