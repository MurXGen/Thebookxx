"use client";

import { combos, mixedBookSets } from "@/utils/combos";
import ComboCard from "./ComboCard";
import HorizontalScroll from "./UI/HorizontalScroll";
import Link from "next/link";
import { PackagePlus, Library, ArrowRight, ChevronRight } from "lucide-react";

/**
 * Homepage combo section — reuses the shared HorizontalScroll rail (same
 * arrows/scroll behaviour as the ₹1 books section). Shows a preview slice;
 * the full catalogue lives at /combos.
 */
const COPY = {
  pairs: {
    eyebrow: "Combo offers",
    heading: "Buy more, save more — book combos",
    sub: "Two bestsellers together at 10% off. One tap adds both books to your bag.",
    href: "/combos",
    more: (n) => `See all ${n} combos`,
  },
  sets: {
    eyebrow: "Book sets",
    heading: "Complete book sets — 3 & 4 books, one tap",
    sub: "Handpicked sets by genre and author, priced below buying each book on its own.",
    href: "/book-sets",
    more: (n) => `See all ${n} book sets`,
  },
};

/**
 * kind="pairs": 2-book combos in the shared mixed order (Art of Clarity ones
 * spread through it). kind="sets": the 3–4 book sets, mixed across genres.
 */
export default function ComboDeals({ kind = "pairs", limit = 14 }) {
  const all = kind === "sets" ? mixedBookSets : combos.filter((c) => c.discountPct);
  const preview = all.slice(0, limit);
  const t = COPY[kind] || COPY.pairs;
  const Icon = kind === "sets" ? Library : PackagePlus;

  return (
    <section className={`combo-section section-1200${kind === "sets" ? " combo-section-sets" : ""}`} aria-labelledby={`combo-h-${kind}`}>
      <div className="combo-head">
        <div className="combo-head-text">
          <span className="combo-eyebrow">
            <Icon size={15} /> {t.eyebrow}
          </span>
          <h2 className="combo-heading" id={`combo-h-${kind}`}>{t.heading}</h2>
          <p className="combo-sub">{t.sub}</p>
        </div>
        <Link href={t.href} className="combo-viewall">
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <HorizontalScroll itemWidth={278}>
        {preview.map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
        <Link href={t.href} className="combo-more-card">
          <ChevronRight size={26} />
          <span>{t.more(all.length)}</span>
        </Link>
      </HorizontalScroll>
    </section>
  );
}
