"use client";

import { useEffect } from "react";

export default function GlobalHaptics() {
  useEffect(() => {
    const triggerHaptic = () => {
      if (navigator.vibrate) {
        navigator.vibrate([10, 20, 10]);
      }
    };

    const handleClick = (e) => {
      const target = e.target.closest("button, a");

      if (!target) return;

      // 🔥 Add visual vibration
      target.classList.add("button-vibrate");

      setTimeout(() => {
        target.classList.remove("button-vibrate");
      }, 250);

      // 🔥 Trigger haptic
      triggerHaptic();
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
