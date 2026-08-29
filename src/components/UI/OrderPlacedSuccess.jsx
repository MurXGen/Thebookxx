"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Full-screen "Order placed successfully" splash.
 * Animation: the circle border draws from start → end, then "blasts" (a soft
 * scale-pop + expanding ring + confetti-ish sparks), with matching haptics.
 * Calls onDone() when the sequence finishes so the caller can redirect.
 */
export default function OrderPlacedSuccess({
  onDone,
  title = "Order placed successfully",
  subtitle = "Taking you to your order…",
}) {
  const doneRef = useRef(false);

  useEffect(() => {
    const buzz = (p) => {
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate)
          navigator.vibrate(p);
      } catch {}
    };
    // t0: ring starts drawing → a soft rising buzz.
    buzz(18);
    const t1 = setTimeout(() => buzz([14, 30, 22]), 720); // check draws
    const t2 = setTimeout(() => buzz([40, 30, 70]), 1080); // the "blast"
    const finish = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone && onDone();
      }
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(finish);
    };
  }, [onDone]);

  const R = 52;
  const C = 2 * Math.PI * R;
  const sparks = Array.from({ length: 12 });

  return (
    <motion.div
      className="ops-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="ops-center">
        <motion.div
          className="ops-badge"
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1, 1.12, 1] }}
          transition={{
            duration: 0.5,
            times: [0, 0.6, 0.82, 1],
            delay: 1.02,
            ease: "easeOut",
          }}
        >
          {/* Expanding blast ring */}
          <motion.span
            className="ops-blast"
            initial={{ scale: 0.4, opacity: 0.55 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: "easeOut" }}
          />
          {/* Sparks */}
          {sparks.map((_, i) => {
            const a = (i / sparks.length) * Math.PI * 2;
            const dx = Math.cos(a) * 78;
            const dy = Math.sin(a) * 78;
            return (
              <motion.span
                key={i}
                className="ops-spark"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                animate={{ x: dx, y: dy, opacity: [0, 1, 0], scale: 1 }}
                transition={{ duration: 0.7, delay: 1.06, ease: "easeOut" }}
              />
            );
          })}

          <svg viewBox="0 0 120 120" className="ops-svg">
            {/* track */}
            <circle cx="60" cy="60" r={R} className="ops-track" />
            {/* drawing border (start → end) */}
            <motion.circle
              cx="60"
              cy="60"
              r={R}
              className="ops-ring"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.95, ease: "easeInOut" }}
              transform="rotate(-90 60 60)"
            />
            {/* checkmark */}
            <motion.path
              d="M40 62 L54 76 L82 46"
              className="ops-check"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.34, delay: 0.98, ease: "easeOut" }}
            />
          </svg>
        </motion.div>

        <motion.h2
          className="ops-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 1.15 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="ops-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 1.35 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </motion.div>
  );
}
