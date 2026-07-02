"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ExternalLink, ArrowUpRight } from "lucide-react";

/**
 * Auto-rotating strip of "related reads" for a book — Medium articles and
 * TheBookX book-focused pages. Each titled link slides up from below (same
 * motion as the homepage live-orders ticker). Includes an "Articles" tertiary
 * button that opens the author's Medium page.
 */
export default function BookLinksStrip({ links = [], mediumUrl }) {
  const items = Array.isArray(links)
    ? links.filter((l) => l && l.url && l.title)
    : [];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 3600);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[i % items.length];
  const isMedium = item.source === "medium";

  return (
    <div className="bls-wrap">
      <span className="bls-label">
        <Newspaper size={14} className="bls-label-icon" />
        Read more
      </span>

      <div className="bls-track">
        <AnimatePresence mode="wait">
          <motion.a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`bls-item ${isMedium ? "is-medium" : "is-thebookx"}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            title={item.title}
          >
            <span className="bls-source">
              {isMedium ? "Medium" : "TheBookX"}
            </span>
            <span className="bls-title">{item.title}</span>
            <ExternalLink size={12} className="bls-ext" />
          </motion.a>
        </AnimatePresence>
      </div>

      {mediumUrl && (
        <a
          href={mediumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bls-articles-btn"
        >
          Articles <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}
