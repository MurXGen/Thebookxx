"use client";

import { Banknote, ChevronRight } from "lucide-react";

// "Facing issues? Make it Cash on Delivery": the same 52px rounded button as
// the pay CTAs, in the outline style, shown under them on the UPI pay guide
// and the verifying screen. Places the order as COD in one tap.
export default function CodSwitchBtn({ onClick, amount = 0, variant = "button" }) {
  // Quiet text link (verifying screen): available, but not competing with
  // the main action.
  if (variant === "link") {
    return (
      <button type="button" className="cod-switch-link" onClick={onClick}>
        Facing issues? Switch to Cash on Delivery{amount > 0 ? ` · ₹${amount}` : ""}
      </button>
    );
  }
  return (
    <button type="button" className="cod-switch" onClick={onClick}>
      <span className="cod-switch-ic" aria-hidden="true">
        <Banknote size={17} />
      </span>
      <span className="cod-switch-tx">
        <small>Facing issues paying online?</small>
        <b>Make it Cash on Delivery{amount > 0 ? ` · ₹${amount}` : ""}</b>
      </span>
      <ChevronRight size={17} className="cod-switch-chev" />
    </button>
  );
}
