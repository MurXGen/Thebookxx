"use client";

import { combos } from "@/utils/combos";
import ComboCard from "./ComboCard";
import HorizontalScroll from "./UI/HorizontalScroll";
import Link from "next/link";
import { PackagePlus, ArrowRight, ChevronRight } from "lucide-react";

/**
 * Homepage combo section — reuses the shared HorizontalScroll rail (same
 * arrows/scroll behaviour as the ₹1 books section). Shows a preview slice;
 * the full catalogue lives at /combos.
 */
// Homepage order: the mixed 2-book combos (Art of Clarity ones spread
// through them), then the curated 3–4 book bundles.

function homepageCombos() {
  // 2-book combos in the shared mixed order (Art of Clarity ones spread
  // through it), then the curated bundles.
  const pairs = combos.filter((c) => c.discountPct);
  const curated = combos.filter((c) => !c.discountPct);
  return [...pairs, ...curated];
}

export default function ComboDeals({ limit = 14 }) {
  const preview = homepageCombos().slice(0, limit);

  return (
    <section className="combo-section section-1200">
      <div className="combo-head">
        <div className="combo-head-text">
          <span className="combo-eyebrow">
            <PackagePlus size={15} /> Combo offers
          </span>
          <h2 className="combo-heading">Buy more, save more — book combos</h2>
          <p className="combo-sub">
            Two bestsellers together at 10% off, plus handpicked bundles. One
            tap adds the whole set to your bag.
          </p>
        </div>
        <Link href="/combos" className="combo-viewall">
          View all combos <ArrowRight size={16} />
        </Link>
      </div>

      <HorizontalScroll itemWidth={278}>
        {preview.map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
        <Link href="/combos" className="combo-more-card">
          <ChevronRight size={26} />
          <span>See all {combos.length} combos</span>
        </Link>
      </HorizontalScroll>
    </section>
  );
}
