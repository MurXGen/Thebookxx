"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Mail, MessageCircle, MapPin, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SUPPORT_WHATSAPP = "917710892108";
const SUPPORT_EMAIL = "uskillbook@gmail.com";

// "How can we help?" bottom-sheet — pick a reason, then reach us on WhatsApp
// or by email. The same reason message is prefilled into whichever channel is
// chosen. Shared by the profile, orders list and order detail pages.
// `eta` (e.g. "4–9") + `onDetail` enable instant auto-answers for the two
// tracking-style reasons so the customer doesn't need to message at all.
export default function SupportSheet({
  phone = "",
  orderId = "",
  eta = "4–9",
  onDetail = false,
  onClose,
}) {
  const num = String(phone || "").replace(/\D/g, "").slice(-10);
  const ref = orderId ? ` (order ${orderId})` : "";
  const sig = num ? ` My number is ${num}.` : "";

  // Link the customer's own order page so support can pull it up instantly:
  // the specific order-detail page when an order is open, otherwise their
  // orders list.
  const ordersUrl = num ? `https://www.thebookx.in/profile/${num}/orders` : "";
  const detailUrl =
    num && orderId
      ? `https://www.thebookx.in/profile/${num}/orders/${orderId}`
      : "";
  const link = detailUrl || ordersUrl;
  const linkLine = link ? `\n\nMy order page: ${link}` : "";

  const topics = [
    { label: "Where is my order?", msg: `Hi TheBookX, I'd like an update on where my order is${ref}.${sig}${linkLine}` },
    { label: "Delivery estimate", msg: `Hi TheBookX, when can I expect my order${ref} to be delivered?${sig}${linkLine}` },
    { label: "Change delivery address", msg: `Hi TheBookX, I'd like to change the delivery address for my order${ref}.${sig}${linkLine}` },
    { label: "Payment help", msg: `Hi TheBookX, I need help with the payment for my order${ref}.${sig}${linkLine}` },
    { label: "Wrong or damaged item", msg: `Hi TheBookX, I received a wrong or damaged item${ref} and need help.${sig}${linkLine}` },
    { label: "Bookmark compensation", msg: `Hi TheBookX, I'd like to claim compensation for my missing bookmark${ref}.${sig}${linkLine}` },
    { label: "Something else", msg: `Hi TheBookX, I need some help with my order${ref}.${sig}${linkLine}` },
  ];

  const [selected, setSelected] = useState(0);
  const [autoReply, setAutoReply] = useState(false);
  const topic = topics[selected] || topics[0];

  // Two reasons get an instant, in-app answer instead of opening a channel.
  const autoTopics = new Set(["Where is my order?", "Delivery estimate"]);
  const isAuto = autoTopics.has(topic.label);
  const autoMsg =
    topic.label === "Delivery estimate"
      ? `Your order is expected to reach you within the next ${eta} days from the date of booking.`
      : `Your order is on its way and should reach you within the next ${eta} days from the date of booking.`;

  const openWhatsApp = () => {
    if (isAuto) {
      setAutoReply(true);
      return;
    }
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(topic.msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose && onClose();
  };

  const openEmail = () => {
    if (isAuto) {
      setAutoReply(true);
      return;
    }
    const subject = `TheBookX support: ${topic.label}${orderId ? ` — order ${orderId}` : ""}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(topic.msg)}`;
    onClose && onClose();
  };
  // From the auto-reply view, still let them reach a human if they want.
  const escalateWhatsApp = () => {
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(topic.msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
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

        {autoReply ? (
          <div className="support-auto">
            <span className="support-auto-ic">
              <Truck size={22} />
            </span>
            <p className="support-auto-msg">{autoMsg}</p>
            <p className="support-auto-note">
              <MapPin size={13} /> Close this to watch it live on the map on your
              order page.
            </p>
            <button
              type="button"
              className="support-auto-close"
              onClick={onClose}
            >
              Got it{onDetail ? " · view map" : ""}
            </button>
            <button
              type="button"
              className="support-auto-chat"
              onClick={escalateWhatsApp}
            >
              <FaWhatsapp size={15} /> Still need help? Chat with us
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
