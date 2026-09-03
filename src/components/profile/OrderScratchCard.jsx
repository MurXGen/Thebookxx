"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Wallet } from "lucide-react";
import ScratchCard from "@/components/UI/ScratchCard";
import {
  fetchWalletBalance,
  creditWalletReward,
  orderWalletReward,
} from "@/utils/googleFormOrder";

/**
 * Per-order scratch-card reward, shown on the order-detail page.
 *
 * Flow:
 *   checking  → skeleton while we confirm this order hasn't been scratched yet
 *   ready     → a 3D foil card the shopper can physically scratch
 *   revealed  → celebratory reward card (credited to the TheBookX wallet)
 *
 * "Already scratched earlier?" is answered server-side: the wallet ledger is
 * scanned for a Credit tagged with this order's id + a scratch reason. That
 * makes the check survive across devices (localStorage is only a fast cache).
 */
export default function OrderScratchCard({
  phone,
  orderId,
  orderValue = 0,
  cancelled = false,
}) {
  // The reward is credited to (and the "already scratched" check reads) the
  // order's own phone when present, else the logged-in number in the URL.
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  const lsKey = `tbx_order_scratch_${orderId}`;

  const [status, setStatus] = useState("checking"); // checking|ready|revealed|hidden
  const [reward, setReward] = useState(0);
  const decided = useRef(false);
  const crediting = useRef(false);

  useEffect(() => {
    if (cancelled || digits.length !== 10 || !orderId) {
      setStatus("hidden");
      return;
    }
    let ignore = false;

    // 1) Fast path: this device already recorded a scratch for this order.
    try {
      const cached = localStorage.getItem(lsKey);
      if (cached) {
        const amt = parseInt(cached, 10) || 0;
        setReward(amt);
        setStatus("revealed");
        return;
      }
    } catch (_) {}

    (async () => {
      // 2) Source of truth: has a scratch reward already been credited for
      //    THIS order? (Prevents a second scratch on another device / re-login.)
      try {
        const res = await fetch(`/api/wallet?phone=${digits}`);
        const json = await res.json();
        const entries = Array.isArray(json.entries) ? json.entries : [];
        const prior = entries.find(
          (e) =>
            String(e.orderId || "").trim() === String(orderId).trim() &&
            Number(e.amount) > 0 &&
            /scratch/i.test(String(e.reason || "")),
        );
        if (ignore) return;
        if (prior) {
          const amt = Math.round(Number(prior.amount) || 0);
          setReward(amt);
          setStatus("revealed");
          try {
            localStorage.setItem(lsKey, String(amt));
          } catch (_) {}
          return;
        }
      } catch (_) {
        // Network hiccup — fall through and still let them scratch.
      }
      if (ignore) return;
      // 3) Not scratched yet → decide the reward for this order's value.
      if (!decided.current) {
        decided.current = true;
        setReward(orderWalletReward(orderValue));
      }
      setStatus("ready");
    })();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, orderId, cancelled]);

  const handleScratched = async () => {
    if (crediting.current) return;
    crediting.current = true;
    // Optimistically flip to the reveal state so the celebration is instant.
    setStatus("revealed");
    try {
      localStorage.setItem(lsKey, String(reward));
    } catch (_) {}
    try {
      await creditWalletReward(
        digits,
        reward,
        orderId,
        "Scratch card reward · Order " + orderId,
      );
    } catch (e) {
      console.error("[wallet] order scratch credit failed", e);
    }
  };

  if (status === "hidden") return null;

  return (
    <section className="od-block od-scratch-block">
      {status === "checking" && (
        <div className="od-scratch-skel" aria-busy="true" aria-label="Loading reward">
          <div className="od-scratch-skel-head">
            <span className="od-sk od-scratch-sk-badge" />
            <span className="od-sk od-scratch-sk-line" />
          </div>
          <div className="od-sk od-scratch-sk-card">
            <span className="od-sk-shine" />
          </div>
        </div>
      )}

      {status === "ready" && (
        <motion.div
          className="od-scratch-ready"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="od-scratch-head">
            <span className="od-scratch-badge">
              <Gift size={14} /> Order reward
            </span>
            <h3 className="od-scratch-title">A reward is hiding under here</h3>
            <p className="od-scratch-sub">
              Scratch the card to reveal what you&apos;ve won — it lands straight
              in your TheBookX wallet.
            </p>
          </div>

          {/* 3D foil card: perspective frame + sheen sit behind a flat,
              fully-interactive scratch surface. */}
          <div className="od-scratch-3d">
            <span className="od-scratch-glow" aria-hidden="true" />
            <div className="od-scratch-foil">
              <span className="od-scratch-shine" aria-hidden="true" />
              <span className="od-scratch-spark s1" aria-hidden="true">
                <Sparkles size={16} />
              </span>
              <span className="od-scratch-spark s2" aria-hidden="true">
                <Sparkles size={12} />
              </span>
              <div className="od-scratch-surface">
                <ScratchCard
                  width={216}
                  height={124}
                  completeAt={0.8}
                  revealText={`₹${reward} won!`}
                  revealSub="Added to your wallet"
                  onComplete={handleScratched}
                />
              </div>
            </div>
          </div>
          <p className="od-scratch-hint">
            <Sparkles size={13} /> Swipe across the card with your finger
          </p>
        </motion.div>
      )}

      {status === "revealed" && (
        <motion.div
          className="od-scratch-won"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <span className="od-scratch-won-ic">
            <Gift size={20} />
          </span>
          <div className="od-scratch-won-txt">
            <strong>You won ₹{reward} on this order</strong>
            <span>Added to your TheBookX wallet</span>
          </div>
          <Link href="/wallet" className="od-scratch-won-btn">
            <Wallet size={14} /> Wallet
          </Link>
        </motion.div>
      )}
    </section>
  );
}
