"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import {
  getLiveOrders,
  getLast10MinSummary,
  fetchLiveOrders,
} from "@/utils/liveOrders";

/**
 * Slim auto-rotating "live orders" social-proof ticker. Shows real recent
 * orders pulled from the store's order sheet (first name + city only); starts
 * with sample data so it renders instantly, then swaps in the real feed.
 */
export default function LiveOrdersStrip() {
  const [orders, setOrders] = useState(() => getLiveOrders());
  const [summary, setSummary] = useState(() => getLast10MinSummary());
  const [i, setI] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchLiveOrders().then((data) => {
      if (!alive || !data?.orders?.length) return;
      setOrders(data.orders);
      setSummary(data.summary);
      setI(0);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (orders.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % orders.length), 3600);
    return () => clearInterval(t);
  }, [orders.length]);

  if (!orders.length) return null;
  const o = orders[i];

  // Full-bleed peach strip with a book icon + one rotating order line.
  return (
    <div className="lo-bar" aria-live="polite">
      <span className="lo-bar-ic" aria-hidden="true">
        <BookOpen size={16} />
      </span>
      <div className="lo-bar-track">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            className="lo-bar-row"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <strong>{o.name}</strong> ordered books worth ₹{o.amount}
            <span className="lo-bar-time"> · {o.timeLabel}</span>
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
