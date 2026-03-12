"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";

export default function SlideConfirm({ onComplete, disabled, resetTrigger }) {
  const x = useMotionValue(0);
  const containerRef = useRef(null);

  const handleDragEnd = () => {
    const container = containerRef.current;
    if (!container) return;

    const max = container.offsetWidth - 60;

    if (x.get() > max * 0.8) {
      animate(x, max, { type: "spring", stiffness: 300 });
      onComplete();
    } else {
      animate(x, 0, { type: "spring", stiffness: 300 });
    }
  };

  // 🔹 Reset when modal closes
  useEffect(() => {
    animate(x, 0, { type: "spring", stiffness: 300 });
  }, [resetTrigger]);

  return (
    <div
      ref={containerRef}
      className={`slide-confirm ${disabled ? "disabled" : ""}`}
    >
      <span className="slide-text">Slide to confirm</span>

      <motion.div
        className="slide-knob"
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        style={{ x }}
        onDragEnd={handleDragEnd}
      >
        <ChevronRight size={16} />
      </motion.div>
    </div>
  );
}
