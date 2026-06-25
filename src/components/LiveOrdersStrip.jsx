"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLiveOrders, getLast10MinSummary } from "@/utils/liveOrders";

/**
 * Slim auto-rotating "live orders" social-proof ticker, shown just below the
 * search bar on the homepage. Cycles through recent (sample) orders.
 */
export default function LiveOrdersStrip() {
  const orders = getLiveOrders();
  const summary = getLast10MinSummary();
  const [i, setI] = useState(0);

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
          {summary.books} books in last 10 min
        </span>
      </div>
    </div>
  );
}
