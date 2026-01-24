import confetti from "canvas-confetti";

export const smallConfetti = () => {
  confetti({
    particleCount: 30,
    spread: 60,
    startVelocity: 18,
    gravity: 0.9,
    ticks: 120,
    origin: { y: 0.85 }, // near cart bar
    scalar: 0.7,
  });
};
