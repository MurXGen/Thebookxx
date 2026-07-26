"use client";

import Link from "next/link";
import { Zap, Clock, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

// SEO + conversion styled promo for the QuickReads feature.
export default function QuickReadsPromo() {
  return (
    <section
      className="qr-promo qr-promo-seo-only"
      aria-labelledby="qr-promo-heading"
    >
      <div className="qr-promo-inner">
        <span className="qr-promo-eyebrow">
          <Zap size={13} /> TheBookX QuickReads
        </span>
        <h2 id="qr-promo-heading" className="qr-promo-title">
          Short on time? Finish a bestseller in 10 minutes.
        </h2>
        <p className="qr-promo-sub">
          QuickReads distil the world&apos;s best non-fiction into crisp,
          actionable summaries — the big ideas, key lessons and takeaways of a
          whole book, ready to read on any device in minutes. Learn faster,
          remember more, and decide what&apos;s worth reading in full.
        </p>

        <div className="qr-promo-points">
          <div className="qr-promo-point">
            <Clock size={16} />
            <span>10-minute reads</span>
          </div>
          <div className="qr-promo-point">
            <BookOpen size={16} />
            <span>Key insights, no fluff</span>
          </div>
          <div className="qr-promo-point">
            <CheckCircle2 size={16} />
            <span>Unlock instantly</span>
          </div>
        </div>

        <Link href="/quickreads" className="qr-promo-cta">
          Explore QuickReads
          <ArrowRight size={18} />
        </Link>
        <span className="qr-promo-trust">
          Loved by thousands of readers · New summaries added weekly
        </span>
      </div>
    </section>
  );
}
