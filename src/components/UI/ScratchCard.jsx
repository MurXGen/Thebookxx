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
  revealSub = "Thanks for reviewing 💛",
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
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 16px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ Scratch here ✨", width / 2, height / 2);

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
      if (total && cleared / total > 0.55) {
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
    <div className="scratch-card" style={{ width, height }}>
      <div className="scratch-reveal">
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
