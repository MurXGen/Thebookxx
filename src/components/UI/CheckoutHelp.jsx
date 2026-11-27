"use client";
import "./CheckoutHelp.styles.css";

// Checkout header: WhatsApp help. Opens a small sheet of ready-made messages
// (address, order, payment, delivery, other); each opens WhatsApp with the
// shopper's checkout details filled in, so support sees everything at once.

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { X, Check, Mail, MessageCircle } from "lucide-react";
import { WA_NUMBER } from "@/lib/offerTimer";

const noop = () => () => {};
const SUPPORT_EMAIL = "uskillbook@gmail.com";

const TOPICS = [
  {
    k: "address",
    title: "Help with my address",
    sub: "Pincode, landmark or delivery location",
    ask: "I need help with my delivery address.",
  },
  {
    k: "order",
    title: "Question about my order",
    sub: "Books, quantity, combos, offers",
    ask: "I have a question about the books in my order.",
  },
  {
    k: "payment",
    title: "Payment problem",
    sub: "UPI, card, gift card or COD",
    ask: "I'm facing a problem while paying.",
  },
  {
    k: "delivery",
    title: "Delivery time & charges",
    sub: "Faster / Thunder, dates, free delivery",
    ask: "I want to know about delivery time and charges.",
  },
  {
    k: "other",
    title: "Something else",
    sub: "Tell us in your own words",
    ask: "I need help with my order.",
  },
];

/**
 * ctx: { name, phone, pincode, city, address, items: [{name, qty}], amount, step }
 */
export default function CheckoutHelp({ ctx = {}, className = "" }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(() => (/pay|upi|card/i.test(String(ctx.step || "")) ? 2 : 0));
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const message = (topic) => {
    const lines = [`Hi TheBookX 👋 ${topic.ask}`, ""];
    const items = (ctx.items || []).filter((b) => b && b.name);
    if (items.length) {
      lines.push("*My bag:*");
      items.slice(0, 8).forEach((b) => lines.push(`• ${b.name}${b.qty > 1 ? ` × ${b.qty}` : ""}`));
      if (items.length > 8) lines.push(`• +${items.length - 8} more`);
    }
    if (ctx.amount) lines.push(`*To pay:* ₹${ctx.amount}`);
    const who = [ctx.name, ctx.phone].filter(Boolean).join(" · ");
    if (who) lines.push(`*Name / phone:* ${who}`);
    const where = [ctx.address, ctx.city, ctx.pincode].filter(Boolean).join(", ");
    if (where) lines.push(`*Address:* ${where}`);
    if (ctx.step) lines.push(`*Checkout step:* ${ctx.step}`);
    lines.push("", topic.k === "other" ? "My question: " : "Details: ");
    return lines.join("\n");
  };

  const go = (topic) => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message(topic))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const mail = (topic) => {
    const subject = `TheBookX checkout help: ${topic.title}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message(topic))}`;
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={`ckh-btn ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Get help on WhatsApp"
      >
        <FaWhatsapp size={17} aria-hidden="true" />
        <span>Help</span>
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="ckh"
                className="ckh-back"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              >
                <motion.div
                  className="ckh-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ckh-h"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ckh-grab" aria-hidden="true" />
                  <div className="support-head">
                    <div className="support-head-titles">
                      <span className="support-head-title" id="ckh-h">
                        <MessageCircle size={18} /> How can we help?
                      </span>
                      <p className="support-head-sub">
                        Pick a reason, then reach us on WhatsApp or email — we&apos;ll have your details ready.
                      </p>
                    </div>
                    <button type="button" className="support-head-x" onClick={() => setOpen(false)} aria-label="Close">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="support-reasons">
                    {TOPICS.map((t, i) => (
                      <button
                        key={t.k}
                        type="button"
                        className={`support-reason${sel === i ? " active" : ""}`}
                        onClick={() => setSel(i)}
                      >
                        <span className={`support-reason-radio${sel === i ? " on" : ""}`}>
                          {sel === i && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span>{t.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="support-actions">
                    <button type="button" className="sec-big-btn support-wa" onClick={() => go(TOPICS[sel])}>
                      <FaWhatsapp size={17} /> WhatsApp
                    </button>
                    <button type="button" className="sec-big-btn support-email" onClick={() => mail(TOPICS[sel])}>
                      <Mail size={16} /> Email us
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
