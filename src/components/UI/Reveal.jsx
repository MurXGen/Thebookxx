"use client";

import { motion } from "framer-motion";

/**
 * Lightweight scroll-reveal wrapper. Fades + rises content into view once.
 * Usage: <Reveal><YourSection/></Reveal>  or  <Reveal delay={0.1} y={24}>…</Reveal>
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  once = true,
  amount = 0.2,
  as = "div",
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Stagger container — children with `variants={revealItem}` animate in sequence.
 */
export function RevealStagger({
  children,
  className = "",
  once = true,
  amount = 0.15,
  stagger = 0.06,
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
  },
};
