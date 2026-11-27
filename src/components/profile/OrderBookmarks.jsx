"use client";
import "./OrderBookmarks.styles.css";

// Order page: the bookmarks that ship with this order, drawn as a fan of
// ribbon bookmarks (free ones orange with a FREE tag, paid ones deep amber).

import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

const MAX_DRAWN = 10;

function Ribbon({ free, i, n }) {
  const mid = (n - 1) / 2;
  const rot = n > 1 ? (i - mid) * Math.min(7, 40 / n) : 0;
  return (
    <motion.span
      className={`obm-rb${free ? " free" : " paid"}`}
      style={{ zIndex: i + 1 }}
      initial={{ y: -36, opacity: 0, rotate: rot - 12 }}
      animate={{ y: 0, opacity: 1, rotate: rot }}
      transition={{ delay: 0.08 + i * 0.07, type: "spring", stiffness: 380, damping: 18 }}
    >
      <svg viewBox="0 0 30 46" width="30" height="46" aria-hidden="true">
        <path d="M4 1h22a3 3 0 0 1 3 3v40l-14-9-14 9V4a3 3 0 0 1 3-3z" />
        <path d="M8 8h14" className="ln" />
        <path d="M8 13h9" className="ln" />
      </svg>
      <span className="obm-tassel" aria-hidden="true" />
      {free && <b className="obm-free">FREE</b>}
    </motion.span>
  );
}

export default function OrderBookmarks({ qty = 0, free = 0, charged = 0, unit = 9 }) {
  const total = Math.max(0, Number(qty) || 0);
  if (!total) return null;
  const freeN = Math.min(total, Math.max(0, Number(free) || 0));
  const paidN = Math.max(0, Number(charged) || total - freeN);
  const drawn = Math.min(total, MAX_DRAWN);
  const freeDrawn = Math.min(freeN, drawn);

  return (
    <section className="od-block obm" aria-label="Bookmarks in this order">
      <div className="obm-head">
        <span className="obm-ic" aria-hidden="true">
          <Bookmark size={16} />
        </span>
        <span className="obm-head-tx">
          <b>
            {total} bookmark{total === 1 ? "" : "s"} in this order
          </b>
          <small>Collectible TheBookX bookmarks, packed with your books</small>
        </span>
      </div>

      <div className="obm-fan" role="img" aria-label={`${total} bookmarks`}>
        {Array.from({ length: drawn }).map((_, i) => (
          <Ribbon key={i} i={i} n={drawn} free={i < freeDrawn} />
        ))}
        {total > drawn && <span className="obm-more">+{total - drawn}</span>}
      </div>

      <div className="obm-split">
        {freeN > 0 && (
          <span className="obm-chip free">
            <i aria-hidden="true" /> {freeN} free
          </span>
        )}
        {paidN > 0 && (
          <span className="obm-chip paid">
            <i aria-hidden="true" /> {paidN} × ₹{unit} = ₹{paidN * unit}
          </span>
        )}
      </div>
    </section>
  );
}
