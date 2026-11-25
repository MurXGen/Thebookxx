"use client";
import "./CombosClient.styles.css";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { combos, clarityCombos, bookPairCombos, COMBO_CATEGORIES } from "@/utils/combos";
import ComboCard from "@/components/ComboCard";

export default function CombosClient({
  items = combos,
  eyebrow = "Combo offers",
  heading = "Book Combo Offers — Buy Together & Save",
  intro = null,
  children = null,
}) {
  const [active, setActive] = useState("All");
  // Cards render in batches as you scroll (every combo URL is also in the
  // page's ItemList JSON-LD and the sitemap, so crawlers see them all).
  const BATCH = 12;
  const [shown, setShown] = useState(BATCH);
  const moreRef = useRef(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? items
        : items.filter((c) => c.category === active),
    [active, items],
  );

  useEffect(() => {
    const el = moreRef.current;
    if (!el || shown >= filtered.length) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setShown((n) => n + BATCH),
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, filtered.length]);

  const chips = ["All", ...(items === combos ? COMBO_CATEGORIES : [...new Set(items.map((c) => c.category))])];

  return (
    <main className="combos-page">
      <div style={{ maxWidth: 1120, margin: "0 auto 6px" }}>
        <Link
          href="/"
          className="combo-viewall"
          style={{ color: "var(--foreground)" }}
        >
          <ArrowLeft size={16} /> Back to store
        </Link>
      </div>

      <header className="combos-hero">
        <span className="combo-eyebrow">
          <PackagePlus size={15} /> {eyebrow}
        </span>
        <h1>{heading}</h1>
        {intro ? <p>{intro}</p> : <p>
          {clarityCombos.length} Art of Clarity combos and {bookPairCombos.length} 2-book bestseller
          combos at 10% off, plus {combos.length - clarityCombos.length - bookPairCombos.length} handpicked bundles across bestsellers, romance,
          thrillers, business, self-help, author collections and more. Every
          combo drops the whole set into your bag in one tap — with prices from
          ₹1, Cash on Delivery and free delivery from ₹249.{" "}
          <Link href="/book-sets">Looking for a whole series? Shop box sets →</Link>
        </p>}
      </header>

      <div className="combos-filter" role="tablist" aria-label="Combo categories">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            role="tab"
            aria-selected={active === chip}
            className={`combos-chip ${active === chip ? "active" : ""}`}
            onClick={() => {
              setActive(chip);
              setShown(BATCH);
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="combos-grid">
        {filtered.slice(0, shown).map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </div>
      {shown < filtered.length && <div ref={moreRef} className="combos-more" aria-hidden="true" style={{ height: 1 }} />}
      {children}
    </main>
  );
}
