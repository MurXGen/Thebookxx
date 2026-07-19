// Celebratory confetti burst fired when the cart unlocks a new offer tier
// (free delivery, ₹50 / ₹100 off, etc.).
import confetti from "canvas-confetti";

export function celebrateOffer() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#fb8500", "#ffb703", "#0a8f0c", "#34d399", "#ffffff"];

  // A quick two-sided burst from the bottom corners toward the centre.
  const shoot = (originX, angle) =>
    confetti({
      particleCount: 45,
      spread: 65,
      startVelocity: 55,
      angle,
      origin: { x: originX, y: 1 },
      colors,
      scalar: 0.9,
      ticks: 180,
      zIndex: 100000,
    });

  shoot(0.15, 65);
  shoot(0.85, 115);
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 100,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.85 },
      colors,
      scalar: 0.95,
      ticks: 200,
      zIndex: 100000,
    });
  }, 130);
}
