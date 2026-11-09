"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Canvas scratch card. The user scratches the orange cover to reveal the
 * centered `revealText`. Calls onComplete once ~55% is scratched.
 */
export default function ScratchCard({
  width = 300,
  height = 180,
  revealText = "Better luck next time",
  revealSub = "Thanks for reviewing ",
  completeAt = 0.55,
  cover = "plain", // "plain" | "festive" (₹ pattern, sparkles, coin)
  revealIcon,
  onComplete,
}) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Cover layer
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#fb8500");
    g.addColorStop(1, "#ffb703");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (cover === "festive") {
      // Diagonal ₹ pattern
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.font = "800 15px Poppins, sans-serif";
      for (let y = 10; y < height + 20; y += 28) {
        for (let x = (y / 28) % 2 ? 6 : 20; x < width + 20; x += 30) ctx.fillText("₹", x, y);
      }
      ctx.restore();
      // Sparkles
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      [[0.12, 0.2, 4], [0.86, 0.18, 3], [0.9, 0.78, 4], [0.1, 0.82, 3], [0.7, 0.12, 2.5]].forEach(([px, py, r]) => {
        const cx = px * width, cy = py * height;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 2);
        ctx.quadraticCurveTo(cx, cy, cx + r * 2, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + r * 2);
        ctx.quadraticCurveTo(cx, cy, cx - r * 2, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy - r * 2);
        ctx.fill();
      });
      // Coin
      const cx = width / 2, cy = height / 2 - 18;
      const cg = ctx.createRadialGradient(cx - 6, cy - 8, 2, cx, cy, 26);
      cg.addColorStop(0, "#fff3c4");
      cg.addColorStop(1, "#f59e0b");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#b45309";
      ctx.stroke();
      ctx.fillStyle = "#92400e";
      ctx.font = "900 22px Poppins, sans-serif";
      ctx.fillText("₹", cx, cy + 1);
      ctx.fillStyle = "#fff";
      ctx.font = "800 17px Poppins, sans-serif";
      ctx.fillText("Scratch here", width / 2, height / 2 + 30);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "600 11px Poppins, sans-serif";
      ctx.fillText("Reveal your wallet cash", width / 2, height / 2 + 50);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 16px Poppins, sans-serif";
      ctx.fillText(" Scratch here ", width / 2, height / 2);
    }

    let drawing = false;
    let done = false;

    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };
    const erase = (x, y) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
    };
    const checkClear = () => {
      if (done) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 40) {
        total++;
        if (data[i] === 0) cleared++;
      }
      if (total && cleared / total > completeAt) {
        done = true;
        setRevealed(true);
        // clear the rest for a clean reveal
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };
    const move = (e) => {
      if (!drawing) return;
      const { x, y } = point(e);
      erase(x, y);
      checkClear();
      e.preventDefault();
    };
    const start = (e) => {
      drawing = true;
      move(e);
    };
    const end = () => {
      drawing = false;
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`scratch-card${cover === "festive" ? " festive" : ""}${revealed ? " revealed" : ""}`} style={{ width, height }}>
      <div className="scratch-reveal">
        {revealIcon && <span className="scratch-reveal-ic">{revealIcon}</span>}
        <span className="scratch-reveal-main">{revealText}</span>
        {revealSub && <span className="scratch-reveal-sub">{revealSub}</span>}
      </div>
      <canvas
        ref={canvasRef}
        className={`scratch-canvas${revealed ? " done" : ""}`}
        style={{ width, height }}
      />
    </div>
  );
}
