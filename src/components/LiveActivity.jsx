"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap, BookPlus, Star } from "lucide-react";

const ICONS = {
  order: { Icon: ShoppingBag, cls: "la-ic-order" },
  faster: { Icon: Zap, cls: "la-ic-fast" },
  cart: { Icon: BookPlus, cls: "la-ic-cart" },
  review: { Icon: Star, cls: "la-ic-review" },
};

const VISIBLE = 3;

/**
 * "Happening on TheBookX" — live numbers + a rolling feed of real orders,
 * Faster-delivery picks, books going into bags and reader reviews.
 * Data comes from /api/live-activity (privacy-safe: first names only).
 */
export default function LiveActivity() {
  const [data, setData] = useState(null);
  const [start, setStart] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/live-activity")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d?.events?.length && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const events = data?.events || [];
  useEffect(() => {
    if (events.length <= VISIBLE) return;
    const t = setInterval(
      () => setStart((s) => (s + VISIBLE) % events.length),
      4200,
    );
    return () => clearInterval(t);
  }, [events.length]);

  if (!data) return null;
  const shown = Array.from({ length: Math.min(VISIBLE, events.length) }, (_, k) => {
    const idx = (start + k) % events.length;
    return { ...events[idx], key: idx };
  });

  return (
    <section className="la" aria-labelledby="la-title">
      <span id="la-title" className="la-label">
        <span className="la-live" aria-hidden="true" />
        Readers loving <b>TheBookX</b>
      </span>

      <ul className="la-feed" aria-live="polite">
        {shown.map((e, slot) => {
          const { Icon, cls } = ICONS[e.type] || ICONS.order;
          return (
            <li key={slot} className="la-slot">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={e.key}
                  className="la-item"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut", delay: slot * 0.1 }}
                >
                  <span className={`la-ic ${cls}`}>
                    <Icon size={15} />
                  </span>
                  <span className="la-txt">
                    <span className="la-line">
                      <b>{e.name}</b>
                      {e.city ? <span className="la-city"> · {e.city}</span> : null}{" "}
                      {e.type === "review" && e.rating ? (
                        <span className="la-stars" aria-label={`${e.rating} stars`}>
                          {"★".repeat(e.rating)}
                        </span>
                      ) : null}
                    </span>
                    <span className="la-what">{e.text}</span>
                  </span>
                  <span className="la-time">{e.time}</span>
                </motion.div>
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
