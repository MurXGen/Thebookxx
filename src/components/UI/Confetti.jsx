"use client";
import { useEffect, useState } from "react";

export default function CartConfetti({ trigger }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="confetti-mask">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}
