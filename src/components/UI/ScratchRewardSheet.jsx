"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Hand } from "lucide-react";
import ScratchCard from "./ScratchCard";

/**
 * A reward scratch card that slides up over a warm, festive backdrop (same
 * look as the "Scratch & win" number popup). Full screen on phones. The card
 * is a real scratch surface — scratching reveals the reward and fires
 * `onScratch` (which credits the wallet). Used at checkout success + pincode.
 */
const CONFETTI = Array.from({ length: 18 }, (_, i) => i);

export default function ScratchRewardSheet({
  open,
  onClose,
  onViewProfile,
  eligible = true,
  reward = 0,
  scratched = false,
  onScratch,
  note,
}) {
  const won = scratched && eligible;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="scratch-sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="scratch-sheet srs"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Scratch card reward"
          >
            <div className="srs-rays" aria-hidden="true" />
            <span className="srs-float c1" aria-hidden="true">₹</span>
            <span className="srs-float c2" aria-hidden="true">₹</span>
            <span className="srs-float b1" aria-hidden="true">📚</span>

            <button type="button" className="srs-x" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>

            <div className="srs-head">
              <span className="srs-badge">
                <Gift size={14} /> Scratch &amp; win
              </span>
              <h2 className="srs-title">
                {scratched ? (
                  eligible ? (
                    <>
                      You won <em>₹{reward}</em>!
                    </>
                  ) : (
                    "Better luck tomorrow"
                  )
                ) : (
                  <>
                    Your card is <em>ready</em>
                  </>
                )}
              </h2>
              <p className="srs-sub">
                {scratched
                  ? eligible
                    ? "Wallet cash for your next order"
                    : "Thanks for joining TheBookX"
                  : "Scratch the card to reveal your wallet reward"}
              </p>
            </div>

            <div className={`srs-card${scratched ? " done" : ""}${eligible ? "" : " lose"}`}>
              <ScratchCard
                width={290}
                height={200}
                cover="festive"
                revealIcon={eligible ? "₹" : "🎁"}
                revealText={eligible ? `₹${reward}` : "Better luck tomorrow"}
                revealSub={eligible ? "Added to your TheBookX wallet" : ""}
                onComplete={onScratch}
              />
              {!scratched && (
                <span className="srs-hint" aria-hidden="true">
                  <Hand size={15} /> Swipe your finger across the card
                </span>
              )}
              {won && (
                <div className="srs-confetti" aria-hidden="true">
                  {CONFETTI.map((i) => (
                    <i key={i} style={{ "--i": i }} />
                  ))}
                </div>
              )}
            </div>

            {scratched && note && (
              <motion.div
                className="srs-note"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {note}
              </motion.div>
            )}

            <div className="srs-foot">
              {scratched ? (
                <button
                  type="button"
                  className="srs-cta"
                  onClick={onViewProfile ? onViewProfile : onClose}
                >
                  {onViewProfile ? "View my profile" : "Awesome, thanks!"}
                </button>
              ) : (
                <button type="button" className="srs-later" onClick={onClose}>
                  Maybe later
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
