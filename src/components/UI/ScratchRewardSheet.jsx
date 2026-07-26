"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import ScratchCard from "./ScratchCard";

/**
 * A reward scratch card that slides up from the bottom over a blurred backdrop.
 * The card is a real scratch surface — scratching reveals the reward and fires
 * `onScratch` (which credits the wallet). Used at checkout success + pincode.
 */
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
            className="scratch-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="scratch-sheet-grip" />
            <button
              type="button"
              className="scratch-sheet-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="scratch-sheet-head">
              <span className="scratch-sheet-badge">
                <Gift size={15} /> Scratch &amp; win
              </span>
              <span className="scratch-sheet-title">
                {scratched
                  ? eligible
                    ? "Reward unlocked! 🎉"
                    : "Better luck next time"
                  : "Scratch the card to reveal your reward"}
              </span>
            </div>

            <div className="scratch-sheet-card">
              <ScratchCard
                width={300}
                height={190}
                revealText={
                  eligible ? `₹${reward} won! 🎉` : "Better luck next time"
                }
                revealSub={
                  eligible
                    ? "Added to your TheBookX wallet"
                    : "You already have wallet credit 💛"
                }
                onComplete={onScratch}
              />
            </div>

            {scratched && note && (
              <motion.div
                className="scratch-sheet-note"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {note}
              </motion.div>
            )}

            <button
              type="button"
              className="pri-big-btn width100 scratch-sheet-btn"
              onClick={scratched && onViewProfile ? onViewProfile : onClose}
            >
              {scratched
                ? onViewProfile
                  ? "View my profile →"
                  : "Awesome, thanks!"
                : "Maybe later"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
