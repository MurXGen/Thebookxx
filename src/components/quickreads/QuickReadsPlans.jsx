"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Crown, BookOpen, Check, Sparkles } from "lucide-react";
import {
  QUICKREAD_PRICE,
  SUB_MONTHLY_PRICE,
  SUB_YEARLY_PRICE,
} from "@/data/quickreads";
import QuickReadsCheckout from "./QuickReadsCheckout";

/**
 * Premium plan chooser: Single (₹29 lifetime) · Monthly (₹99) · Yearly (₹999).
 * `book` enables the single-book option. onSinglePaid / onSubscribed fire on success.
 */
export default function QuickReadsPlans({
  book,
  onClose,
  onSinglePaid,
  onSubscribed,
  variant = "sheet",
}) {
  const [checkoutPlan, setCheckoutPlan] = useState(null); // "single" | "monthly" | "yearly"
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isCenter = variant === "center";

  const monthlyPerYear = SUB_MONTHLY_PRICE * 12;
  const yearlySaving = monthlyPerYear - SUB_YEARLY_PRICE;

  const plans = [
    book && {
      key: "single",
      icon: BookOpen,
      title: "Single QuickRead",
      price: QUICKREAD_PRICE,
      unit: "one-time",
      tag: "Just this book, forever",
      bullets: [
        "Lifetime access to this title",
        "Every insight unlocked",
        "Download & save insight cards",
        "Listen with the built-in audio",
      ],
      cta: `Unlock for ₹${QUICKREAD_PRICE}`,
    },
    {
      key: "monthly",
      icon: Zap,
      title: "Unlimited Monthly",
      price: SUB_MONTHLY_PRICE,
      unit: "/month",
      tag: "Every QuickRead, all titles",
      bullets: [
        "Access to the entire catalogue",
        "New books added regularly",
        "Download, save & listen to all",
        "Cancel anytime",
      ],
      cta: "Go Unlimited",
    },
    {
      key: "yearly",
      icon: Crown,
      title: "Unlimited Yearly",
      price: SUB_YEARLY_PRICE,
      unit: "/year",
      tag: "Best value for committed readers",
      badge: yearlySaving > 0 ? `Save ₹${yearlySaving}` : "Best value",
      best: true,
      bullets: [
        "Everything in Monthly",
        "A full 12 months of access",
        "Lowest price per month",
        "Priority on new releases",
      ],
      cta: "Get Yearly",
    },
  ].filter(Boolean);

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        className={`bill-modal-overlay qrc-overlay${isCenter ? " qrc-overlay-center" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bill-modal qrp-modal${isCenter ? " qrc-modal-center" : " qrc-modal-sheet"}`}
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
          <div className="qrp-hero">
            <span className="qrp-hero-kicker">
              <Sparkles size={13} /> QuickReads by TheBookX
            </span>
            <h2 className="qrp-hero-title">Choose your plan</h2>
            <p className="qrp-hero-sub">
              Unlock big ideas from great books — read the key insights in
              minutes.
            </p>
            <span className="qrp-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </span>
          </div>

          <div className="qrp-grid">
            {plans.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  className={`qrp-card${p.best ? " best" : ""}`}
                >
                  {p.badge && <span className="qrp-badge">{p.badge}</span>}
                  <div className="qrp-card-head">
                    <span className="qrp-card-ic">
                      <Icon size={18} />
                    </span>
                    <div className="qrp-card-titles">
                      <span className="qrp-card-title">{p.title}</span>
                      <span className="qrp-card-tag">{p.tag}</span>
                    </div>
                  </div>
                  <div className="qrp-price">
                    <span className="qrp-price-amt">₹{p.price}</span>
                    <span className="qrp-price-unit">{p.unit}</span>
                  </div>
                  <ul className="qrp-bullets">
                    {p.bullets.map((b) => (
                      <li key={b}>
                        <Check size={14} /> {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={p.best ? "pri-big-btn width100" : "sec-big-btn width100"}
                    onClick={() => setCheckoutPlan(p.key)}
                  >
                    {p.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="qrp-foot">
            First 10 insights of every book are free to preview.
          </p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {checkoutPlan && (
          <QuickReadsCheckout
            items={checkoutPlan === "single" && book ? [book] : []}
            plan={checkoutPlan}
            variant={variant}
            onClose={() => setCheckoutPlan(null)}
            onPaid={(info) => {
              if (checkoutPlan === "single") onSinglePaid?.(info);
              else onSubscribed?.(info);
            }}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
