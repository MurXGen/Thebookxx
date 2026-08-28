"use client";

import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { books } from "@/utils/book";
import { quickReadBookIds } from "@/data/quickreads";
import { QUICKREAD_PRICE } from "@/data/quickreads";

// Small, conversational teaser that shows a few real QuickReads covers and nudges
// shoppers to try the ₹29 10-minute summaries. Sits under the reviews section.
export default function QuickReadsTeaser() {
  const ids = quickReadBookIds();
  const picks = ids
    .map((id) => books.find((b) => b.id === id))
    .filter((b) => b && b.image)
    .slice(0, 8);

  if (picks.length < 3) return null;

  return (
    <section className="qrt" aria-labelledby="qrt-heading">
      <div className="qrt-head">
        <span className="qrt-eyebrow">
          <Zap size={13} /> QuickReads · just ₹{QUICKREAD_PRICE}
        </span>
        <h2 id="qrt-heading" className="qrt-title">
          No time to read? Get the whole book in 10 minutes.
        </h2>
        <p className="qrt-sub">
          The big ideas and key lessons of bestsellers — summarised so you can
          finish one on your chai break. Start with any of these:
        </p>
      </div>

      <Link href="/quickreads" className="qrt-rail" aria-label="Explore QuickReads">
        <div className="qrt-covers">
          {picks.map((b) => (
            <span className="qrt-cover" key={b.id}>
              <img src={b.image} alt={b.name} loading="lazy" decoding="async" />
              <span className="qrt-cover-badge">10 min</span>
            </span>
          ))}
        </div>
      </Link>

      <Link href="/quickreads" className="qrt-cta">
        Try a QuickRead
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
