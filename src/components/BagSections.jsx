"use client";

// Bag page sections (Instamart-style): saved banner, small-gap wallet top-up,
// bill details and the policy note.

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Wallet, Check, Info, ChevronRight } from "lucide-react";

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// Pinned green strip: total saved on this order.
export function SavedBanner({ amount }) {
  if (!(amount > 0)) return null;
  return (
    <div className="bg-saved" role="status">
      <motion.span key={Math.round(amount)} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {inr(amount)} saved on this order!
      </motion.span>
    </div>
  );
}

// "FREE delivery on this order · Get ₹11 in your wallet · use it fully on the
// next order [ADD]". Shown when the cart is a small amount short of free
// delivery (or of the checkout minimum).
export function TopUpCard({ gap, reason, deliveryFee, on, onToggle }) {
  if (!(gap > 0)) return null;
  const tag = reason === "minimum" ? "Unlock checkout now" : "FREE delivery on this order";
  return (
    <section className={`bg-topup${on ? " on" : ""}`} aria-label="Wallet top-up">
      <span className="bg-topup-tag">
        {reason === "minimum" ? <Check size={12} strokeWidth={3} /> : <Truck size={12} />} {tag}
      </span>
      <div className="bg-topup-body">
        <ul className="bg-topup-pts">
          <li>
            <Wallet size={15} /> Add {inr(gap)} to your TheBookX wallet
          </li>
          <li>
            <Check size={15} strokeWidth={2.6} />{" "}
            {reason === "minimum"
              ? "Reach the minimum and check out now"
              : `Skip the ${inr(deliveryFee)} delivery fee`}
            , use the {inr(gap)} on your next order
          </li>
        </ul>
        <div className="bg-topup-act">
          <button type="button" className={`bg-topup-btn${on ? " on" : ""}`} onClick={onToggle} data-no-busy aria-pressed={on}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={on ? "on" : "off"}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                {on ? (
                  <>
                    <Check size={14} strokeWidth={3} /> ADDED
                  </>
                ) : (
                  "ADD"
                )}
              </motion.span>
            </AnimatePresence>
          </button>
          <b className="bg-topup-amt">{inr(gap)}</b>
        </div>
      </div>
      {on && (
        <p className="bg-topup-note">
          {inr(gap)} goes to your wallet once your order is confirmed (Cash on Delivery: once delivered).{" "}
          <button type="button" onClick={onToggle} data-no-busy>
            Remove
          </button>
        </p>
      )}
    </section>
  );
}

// Bill details card: MRP struck through → price, delivery, top-up, To pay.
export function BillCard({
  totalOriginal,
  totalDiscounted,
  offerDiscount,
  offerLabel,
  deliveryFee,
  deliveryFeeWithout, // fee without the top-up (to strike through)
  freeAt,
  topUp,
  quickReads = 0,
  toPay,
  onViewBill,
}) {
  const shortBy = Math.max(0, freeAt - totalDiscounted - (topUp || 0));
  const struckTotal = totalOriginal + deliveryFeeWithout + (topUp || 0) + quickReads;
  return (
    <section className="bg-bill" aria-labelledby="bg-bill-h">
      <h3 id="bg-bill-h" className="bg-cap">Bill details</h3>
      <div className="bg-bill-row">
        <span>Item total</span>
        <span>
          {totalOriginal > totalDiscounted && <s>{inr(totalOriginal)}</s>} {inr(totalDiscounted)}
        </span>
      </div>
      {offerDiscount > 0 && (
        <div className="bg-bill-row green">
          <span>{offerLabel || "Offer"}</span>
          <span>−{inr(offerDiscount)}</span>
        </div>
      )}
      {quickReads > 0 && (
        <div className="bg-bill-row">
          <span>QuickReads</span>
          <span>{inr(quickReads)}</span>
        </div>
      )}
      <div className="bg-bill-row dashed">
        <span className="bg-dot">Delivery fee</span>
        <span>
          {deliveryFee === 0 ? (
            <>
              {deliveryFeeWithout > 0 && <s>{inr(deliveryFeeWithout)}</s>} <b className="green">FREE</b>
            </>
          ) : (
            inr(deliveryFee)
          )}
        </span>
      </div>
      {deliveryFee > 0 && shortBy > 0 && (
        <p className="bg-bill-hint">Add books worth {inr(shortBy)} to get free delivery on this order</p>
      )}
      {topUp > 0 && (
        <div className="bg-bill-row">
          <span>Wallet top-up</span>
          <span>{inr(topUp)}</span>
        </div>
      )}
      <div className="bg-bill-total">
        <span>To pay</span>
        <span>
          {struckTotal > toPay && <s>{inr(struckTotal)}</s>} {inr(toPay)}
        </span>
      </div>
      {onViewBill && (
        <button type="button" className="bg-link" onClick={onViewBill} data-no-busy>
          Full bill breakdown <ChevronRight size={14} />
        </button>
      )}
    </section>
  );
}

export function PolicyNote() {
  return (
    <section className="bg-note">
      <p>
        <Info size={14} /> <b>Note:</b> Wrong or damaged copy? Return it within 7 days of delivery. Orders can&apos;t be
        changed once packed.
      </p>
      <Link href="/refund" className="bg-link">
        Read return policy
      </Link>
    </section>
  );
}
