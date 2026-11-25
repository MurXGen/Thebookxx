"use client";
import "./OneRupeeUnlock.styles.css";

// "Unlock your ₹1 book" picker. A ₹1 book only ships with a ₹199+ order, and
// orders that include one are our largest (₹569 on average), so we offer three
// one-tap bestsellers priced ₹149–199 — any one of them unlocks it.

import { useMemo } from "react";
import { Lock, Plus, Check } from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/ga";

// Best sellers from order data, most-bought first.
const PRIORITY = ["bk-005", "bk-006", "bk-009", "bk-146", "bk-391", "bk-002", "bk-007", "bk-010", "bk-017", "bk-145"];
const MIN = 149;
const MAX = 199;

const coverOf = (b) => (typeof b.image === "string" ? b.image : b.image?.src) || "";
const inRange = (b) => b.discountedPrice >= MIN && b.discountedPrice <= MAX && b.stock !== 0 && b.image;

// "The Psychology of Money (Price Drop)" → "the psychology of money"
const baseTitle = (n) => String(n || "").replace(/\s*\(price drop\)\s*/i, "").trim().toLowerCase();

export function oneRupeePicks(cartIds = [], n = 3) {
  const byId = new Map(books.map((b) => [b.id, b]));
  // Skip what's in the bag, and the full-price copy of a ₹1 book in it.
  const titles = new Set(cartIds.map((id) => baseTitle(byId.get(id)?.name)));
  const skipSet = new Set(cartIds);
  const skip = { has: (id) => skipSet.has(id) || titles.has(baseTitle(byId.get(id)?.name)) };
  const out = [];
  for (const id of PRIORITY) {
    const b = byId.get(id);
    if (b && inRange(b) && !skip.has(id)) out.push(b);
    if (out.length === n) return out;
  }
  for (const b of books) {
    if (out.length === n) break;
    if (inRange(b) && b.catalogue?.includes("bestseller") && !skip.has(b.id) && !out.includes(b)) out.push(b);
  }
  return out;
}

export default function OneRupeeUnlock({ source = "bag", title, sub, className = "" }) {
  const { cart, addToCart } = useStore();
  const ids = cart.map((i) => i.id);
  const key = ids.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const picks = useMemo(() => oneRupeePicks(ids), [key]);
  if (!picks.length) return null;

  const add = (b) => {
    addToCart(b.id, `rupee_unlock_${source}`);
    trackEvent("rupee_unlock_add", { source, book_id: b.id, price: b.discountedPrice });
    showToast(`${b.name} added · your ₹1 book is unlocked 🎉`, "success");
  };

  return (
    <section className={`r1u ${className}`} aria-label="Unlock your ₹1 book">
      <div className="r1u-head">
        <span className="r1u-ic" aria-hidden="true">
          <Lock size={15} strokeWidth={2.4} />
        </span>
        <span className="r1u-txt">
          <b>{title || "Unlock your ₹1 book: add any one bestseller"}</b>
          <small>{sub || "₹1 books ship with orders of ₹199+. One tap below does it."}</small>
        </span>
      </div>
      <div className="r1u-picks">
        {picks.map((b) => {
          const inCart = ids.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className={`r1u-pick${inCart ? " on" : ""}`}
              onClick={() => !inCart && add(b)}
              aria-label={`Add ${b.name} for ₹${b.discountedPrice}`}
            >
              <img src={coverOf(b)} alt="" loading="lazy" decoding="async" />
              <span className="r1u-name">{b.name}</span>
              <span className="r1u-price">
                ₹{b.discountedPrice}
                {b.originalPrice > b.discountedPrice && <s>₹{b.originalPrice}</s>}
              </span>
              <span className="r1u-add">
                {inCart ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
                {inCart ? "Added" : "Add"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
