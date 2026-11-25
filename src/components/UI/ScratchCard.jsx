"use client";
import "./ScratchCard.styles.css";

import { useEffect, useRef, useState } from "react";

/**
 * Canvas scratch card. The user scratches the orange cover to reveal the
 * centered `revealText`. Once ~50% is scratched the rest auto-scratches
 * (animated, with a haptic buzz + chime) and then onComplete fires.
 */
export default function ScratchCard({
  width = 300,
  height = 180,
  revealText = "Better luck next time",
  revealSub = "Thanks for reviewing ",
  completeAt = 0.5,
  cover = "plain", // "plain" | "festive" (₹ pattern, sparkles, coin)
  revealIcon,
  onComplete,
}) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [auto, setAuto] = useState(false); // auto-finishing the scratch

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

    // ── Scratching: pointer events + round-capped strokes between samples, so
    // fast swipes leave a continuous smooth trail (no dotted gaps). Coverage is
    // checked at most every ~90ms. Once `completeAt` (default 50%) is cleared,
    // the rest is auto-scratched with a quick animated zig-zag, plus a haptic
    // buzz and a chime.
    const BRUSH = 44;
    let drawing = false;
    let done = false;
    let last = null;
    let lastCheck = 0;
    let lastTick = 0;
    let raf = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Tiny WebAudio kit (created on the first touch — browsers need a gesture).
    let audio = null;
    const getAudio = () => {
      if (audio) return audio;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audio = new AC();
      } catch {
        audio = null;
      }
      return audio;
    };
    const scratchSound = () => {
      const a = audio;
      if (!a) return;
      try {
        const len = Math.floor(a.sampleRate * 0.05);
        const buf = a.createBuffer(1, len, a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = a.createBufferSource();
        src.buffer = buf;
        const f = a.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 2400 + Math.random() * 1600;
        f.Q.value = 0.8;
        const g = a.createGain();
        g.gain.value = 0.05;
        src.connect(f).connect(g).connect(a.destination);
        src.start();
      } catch {
        /* sound is a nice-to-have */
      }
    };
    const chime = () => {
      const a = audio;
      if (!a) return;
      try {
        const t0 = a.currentTime;
        [880, 1318.5, 1760].forEach((freq, i) => {
          const o = a.createOscillator();
          const g = a.createGain();
          o.type = "sine";
          o.frequency.value = freq;
          const t = t0 + i * 0.09;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
          o.connect(g).connect(a.destination);
          o.start(t);
          o.stop(t + 0.5);
        });
      } catch {
        /* ignore */
      }
    };
    const buzz = (pattern) => {
      try {
        navigator.vibrate?.(pattern);
      } catch {
        /* unsupported */
      }
    };

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const stroke = (from, to, width = BRUSH) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x + 0.01, to.y);
      ctx.stroke();
    };
    const coverage = () => {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 37) {
        total++;
        if (data[i] < 20) cleared++;
      }
      return total ? cleared / total : 0;
    };

    const finish = () => {
      ctx.clearRect(0, 0, width, height);
      setRevealed(true);
      onComplete?.();
    };
    // Auto-scratch the rest: a fast zig-zag sweep over ~650ms.
    const autoReveal = () => {
      done = true;
      drawing = false;
      setAuto(true);
      buzz([25, 40, 25, 40, 60]);
      chime();
      if (reduce) return finish();
      const rows = 5;
      const pts = [];
      for (let r = 0; r < rows; r++) {
        const y = ((r + 0.5) / rows) * height;
        const ltr = r % 2 === 0;
        pts.push({ x: ltr ? -20 : width + 20, y }, { x: ltr ? width + 20 : -20, y: y + height / rows / 2 });
      }
      const segLen = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
      const totalLen = segLen.reduce((a, b) => a + b, 0);
      const DUR = 650;
      const t0 = performance.now();
      let drawn = 0;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / DUR);
        const ease = 1 - Math.pow(1 - k, 2);
        const target = ease * totalLen;
        // Walk the polyline up to `target`, stroking each bit.
        let acc = 0;
        for (let i = 0; i < segLen.length; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          if (acc + segLen[i] < drawn) {
            acc += segLen[i];
            continue;
          }
          const from = Math.max(0, drawn - acc) / segLen[i];
          const to = Math.min(1, (target - acc) / segLen[i]);
          if (to <= 0) break;
          const p1 = { x: a.x + (b.x - a.x) * from, y: a.y + (b.y - a.y) * from };
          const p2 = { x: a.x + (b.x - a.x) * to, y: a.y + (b.y - a.y) * to };
          stroke(p1, p2, height / rows + 34);
          acc += segLen[i];
          if (acc >= target) break;
        }
        drawn = target;
        if (k < 1) raf = requestAnimationFrame(tick);
        else finish();
      };
      raf = requestAnimationFrame(tick);
    };

    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height };
    };
    const move = (e) => {
      if (!drawing || done) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      const list = evs.length ? evs : [e];
      for (const ev of list) {
        const p = point(ev);
        stroke(last || p, p);
        last = p;
      }
      const now = performance.now();
      if (now - lastTick > 70) {
        lastTick = now;
        buzz(6);
        scratchSound();
      }
      if (now - lastCheck > 90) {
        lastCheck = now;
        if (coverage() >= completeAt) autoReveal();
      }
    };
    const start = (e) => {
      if (done) return;
      drawing = true;
      last = null;
      getAudio()?.resume?.();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      move(e);
    };
    const end = () => {
      if (!drawing) return;
      drawing = false;
      last = null;
      if (!done && coverage() >= completeAt) autoReveal();
    };

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("lostpointercapture", end);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", end);
      canvas.removeEventListener("lostpointercapture", end);
      try {
        audio?.close?.();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`scratch-card${cover === "festive" ? " festive" : ""}${auto ? " auto" : ""}${revealed ? " revealed" : ""}`} style={{ width, height }}>
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
