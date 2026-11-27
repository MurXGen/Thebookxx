"use client";
import "./CheckoutAddMore.styles.css";

// Checkout upsell, Swiggy "complete your order" style: a compact white section
// header over our existing 2-row book cards (BestsellerGrid, embedded: no big
// heading, and cards don't navigate away from checkout).

import { useState } from "react";
import { Sparkles } from "lucide-react";
import BestsellerGrid from "@/components/BestsellerGrid";

export default function CheckoutAddMore({ list = [], title = "Complete your order", subtitle = "Ships in the same parcel" }) {
  // Freeze the list when the step opens so cards don't jump around as the
  // bag (and therefore the recommendations) changes.
  const [items] = useState(() => list.slice(0, 24));
  if (!items.length) return null;

  const bestOff = Math.max(
    0,
    ...items.map((b) =>
      b.originalPrice > b.discountedPrice ? Math.round(((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100) : 0,
    ),
  );

  return (
    <section className="cam" aria-labelledby="cam-h">
      <header className="cam-head">
        <span className="cam-head-tx">
          <b id="cam-h">
            <Sparkles size={15} aria-hidden="true" /> {title}
          </b>
          <small>{subtitle}</small>
        </span>
        {bestOff > 0 && <span className="cam-pill">Up to {bestOff}% off</span>}
      </header>
      <BestsellerGrid list={items} hideHead noLinks className="cam-grid" />
    </section>
  );
}
