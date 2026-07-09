"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { combos, COMBO_CATEGORIES } from "@/utils/combos";
import ComboCard from "@/components/ComboCard";

export default function CombosClient() {
  const [active, setActive] = useState("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? combos
        : combos.filter((c) => c.category === active),
    [active],
  );

  const chips = ["All", ...COMBO_CATEGORIES];

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
          <PackagePlus size={15} /> Combo offers
        </span>
        <h1>Book Combo Offers — Buy 3+ Books & Save Big</h1>
        <p>
          {combos.length} handpicked book bundles across bestsellers, romance,
          thrillers, business, self-help, author collections and more. Every
          combo drops the whole set into your bag in one tap — with prices from
          ₹1, Cash on Delivery and free delivery across India.
        </p>
      </header>

      <div className="combos-filter" role="tablist" aria-label="Combo categories">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            role="tab"
            aria-selected={active === chip}
            className={`combos-chip ${active === chip ? "active" : ""}`}
            onClick={() => setActive(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="combos-grid">
        {filtered.map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </div>
    </main>
  );
}
