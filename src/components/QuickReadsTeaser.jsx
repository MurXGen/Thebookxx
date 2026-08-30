"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
import { books } from "@/utils/book";
import { quickReadBookIds, QUICKREAD_PRICE } from "@/data/quickreadsMeta";

// Small, conversational teaser with an infinite, smoothly auto-scrolling rail of
// real QuickReads covers. The marquee only animates while it's in the viewport.
export default function QuickReadsTeaser() {
  const ids = quickReadBookIds();
  const picks = ids
    .map((id) => books.find((b) => b.id === id))
    .filter((b) => b && b.image)
    .slice(0, 10);

  const marqueeRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (picks.length < 3) return null;

  // Duplicate the set so the loop is seamless (translateX(-50%) = one full set).
  const loop = [...picks, ...picks];

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

      <div className="qrt-marquee" ref={marqueeRef} aria-hidden="true">
        <div className={`qrt-track${inView ? " running" : ""}`}>
          {loop.map((b, i) => (
            <Link
              href="/quickreads"
              className="qrt-cover"
              key={`${b.id}-${i}`}
              tabIndex={-1}
            >
              <img src={b.image} alt="" loading="lazy" decoding="async" />
              <span className="qrt-cover-badge">10 min</span>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/quickreads" className="qrt-cta">
        Try a QuickRead
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
