"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <div className="live-orders-wrap">
      <div className="live-orders">
        <span className="live-dot" aria-hidden="true" />

        <div className="live-orders-track">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              className="live-order-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span
                className="live-avatar"
                style={{ background: o.bg, color: o.fg }}
              >
                {o.initials}
              </span>
              <span className="live-msg">
                <strong>
                  {o.name} from {o.city}
                </strong>{" "}
                ordered ₹{o.amount} of books
              </span>
              <span className="live-time">{o.timeLabel}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <span className="live-summary">
          {summary.books} books ordered recently
        </span>
      </div>
    </div>
  );
}
