"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { XmasSnow, XmasGarland, XmasTree } from "@/components/XmasDecor";

// Christmas launch splash: festive red cover with falling snow, a garland, a
// tree and the TheBookX wordmark. Shown ONCE per device — the first time the
// homepage loads. A tiny script in <head> (layout.js) marks <html> with
// data-splash-seen on repeat visits so it never flashes before React loads.
export const SPLASH_SEEN_KEY = "tbx_splash_seen";
const EASE = [0.22, 1, 0.36, 1];
const SHOW_MS = 1700;

export default function SplashScreen() {
  // Only the homepage gets the launch splash.
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [done, setDone] = useState(false);
  const show = onHome && !done;

  // Decide once per page load (a ref, so React's double-run of effects in
  // development doesn't read back the flag we just wrote and skip it).
  const decided = useRef(null); // null | "show" | "skip"
  useEffect(() => {
    if (decided.current === null) {
      let seen = false;
      try {
        seen = localStorage.getItem(SPLASH_SEEN_KEY) === "1";
      } catch {
        /* storage blocked → just show it this once */
      }
      decided.current = seen || !onHome ? "skip" : "show";
      if (decided.current === "show") {
        try {
          localStorage.setItem(SPLASH_SEEN_KEY, "1");
        } catch {
          /* ignore */
        }
      }
    }
    if (decided.current === "skip") {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), SHOW_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll only while visible (the splash never unmounts).
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="tbx-splash"
          className="splash splash-xmas"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
          onClick={() => setDone(true)}
          role="presentation"
        >
          <span className="splash-glow" aria-hidden="true" />
          <XmasGarland className="splash-garland" />
          <XmasSnow className="splash-snow" density={0.9} max={70} />

          <motion.div
            className="splash-center"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.25 } }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <motion.span
              className="splash-tree"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
              aria-hidden="true"
            >
              <XmasTree size={84} />
            </motion.span>
            <span className="splash-wordmark">
              TheBookX
              <span className="splash-sparkle" aria-hidden="true">✦</span>
            </span>
            <motion.span
              className="splash-merry"
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, letterSpacing: "0.16em" }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            >
              Merry Christmas
            </motion.span>
            <motion.span
              className="splash-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            >
              Books, gift-wrapped &amp; delivered with care
            </motion.span>
          </motion.div>

          <motion.div
            className="splash-trust"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.45, delay: 0.35, ease: EASE }}
          >
            <div className="splash-badges">
              <span className="splash-badge">
                <ShieldCheck size={14} /> Secure checkout
              </span>
              <span className="splash-badge">
                <Truck size={14} /> COD available
              </span>
              <span className="splash-badge">
                <RotateCcw size={14} /> 7-day replacement
              </span>
            </div>
          </motion.div>

          {/* Snow bank along the bottom */}
          <svg className="splash-bank" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 30 C40 12 80 40 120 26 C160 12 200 38 240 24 C280 10 320 36 360 22 C380 16 392 20 400 24 L400 60 L0 60Z"
              fill="#fff"
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
