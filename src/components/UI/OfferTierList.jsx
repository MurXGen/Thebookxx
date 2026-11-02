"use client";

import { Check, Lock, Sparkles, Truck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { resolveAppliedOffer } from "@/utils/cartOffers";

// Reward tiers for the "Unlock more rewards" sheets. Free delivery applies by
// itself once reached; flat ₹-off rewards unlock by cart value and then need a
// tap on Apply (only one can be active — applying another replaces it).
export default function OfferTierList({ offers = [], amount = 0, hasOneRupee = false }) {
  const { appliedOfferValue, applyOffer, removeOffer } = useStore();
  const applied = resolveAppliedOffer(amount, hasOneRupee, appliedOfferValue);

  return (
    <ul className="offer-sheet-list otl" aria-label="Cart rewards">
      {offers.map((o) => {
        const unlocked = amount >= o.target;
        const left = Math.max(o.target - amount, 0);
        const isFlat = o.type === "flat";
        const isApplied = isFlat && applied?.value === o.value;
        const state = !unlocked ? "locked" : isApplied ? "applied" : isFlat ? "ready" : "auto";
        return (
          <li key={`${o.type}-${o.target}`} className={`offer-tier otl-${state}`}>
            <span className="offer-tier-ic" aria-hidden="true">
              {state === "locked" ? (
                <Lock size={13} />
              ) : state === "ready" ? (
                <Sparkles size={14} />
              ) : isFlat ? (
                <Check size={14} />
              ) : (
                <Truck size={14} />
              )}
            </span>
            <span className="offer-tier-main">
              <span className="offer-tier-reward">{o.reward}</span>
              <span className="offer-tier-note">
                {state === "locked"
                  ? `Add ₹${left} more to unlock (spend ₹${o.target})`
                  : state === "applied"
                    ? `Applied — you save ₹${o.value}`
                    : state === "ready"
                      ? "Unlocked — tap Apply to use it"
                      : "Unlocked · applied automatically"}
              </span>
            </span>
            {state === "ready" && (
              <button
                type="button"
                className="otl-btn"
                onClick={() => {
                  applyOffer(o.value);
                  showToast(`${o.reward} applied 🎉 You save ₹${o.value}`, "success");
                }}
              >
                Apply
              </button>
            )}
            {state === "applied" && (
              <button
                type="button"
                className="otl-btn otl-btn-on"
                onClick={() => {
                  removeOffer();
                  showToast(`${o.reward} removed`, "info");
                }}
                aria-label={`Remove ${o.reward}`}
              >
                <Check size={13} strokeWidth={3} /> Applied
              </button>
            )}
            {state === "locked" && isFlat && (
              <button
                type="button"
                className="otl-btn"
                disabled
                aria-label={`${o.reward} locked — add ₹${left} more`}
              >
                <Lock size={11} /> Apply
              </button>
            )}
            {state === "locked" && !isFlat && (
              <span className="otl-lock-tag" aria-hidden="true">
                Locked
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
