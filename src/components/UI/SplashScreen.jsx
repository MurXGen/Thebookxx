"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

// Paytm-style launch splash: a dark full-screen cover with the TheBookX
// wordmark that blurs in, holds, then blurs out — shown for ~2s on first load.
// Everything is driven by opacity / blur / transform for buttery 60fps motion.
const EASE = [0.22, 1, 0.36, 1]; // smooth ease-out-expo-ish

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  // Hide after ~3.5s (quick blur-in, hold, quick blur-out).
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 3100);
    return () => clearTimeout(t);
  }, []);

  // Lock body scroll ONLY while the splash is visible. This effect's cleanup
  // runs the moment `show` flips to false — the splash lives in the root layout
  // and never unmounts, so relying on unmount would leave scroll locked forever.
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
          className="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
        >
          <motion.div
            className="splash-center"
            initial={{ opacity: 0, filter: "blur(22px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(22px)",
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" },
            }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span className="splash-wordmark">TheBookX</span>
            <motion.span
              className="splash-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
            >
              Books, delivered with care
            </motion.span>
          </motion.div>

          <motion.div
            className="splash-trust"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.45, delay: 0.25, ease: EASE }}
          >
            <span className="splash-trust-lbl">
              Trusted by readers across India
            </span>
            <div className="splash-badges">
              <span className="splash-badge">
                <ShieldCheck size={15} /> Secure checkout
              </span>
              <span className="splash-badge">
                <Truck size={15} /> COD available
              </span>
              <span className="splash-badge">
                <RotateCcw size={15} /> 7-day returns
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
