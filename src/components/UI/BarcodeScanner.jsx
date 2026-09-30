"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Camera, Zap } from "lucide-react";

// Live camera barcode scanner (EMS / India Post labels are Code 128).
// Continuously decodes the back-camera stream; every NEW code is normalised
// (uppercased, spaces stripped) and handed to onDetect. The parent keeps the
// master list — this only reports fresh hits and shows what it caught.
export default function BarcodeScanner({
  open,
  onClose,
  onDetect,
  existing = [],
}) {
  const videoRef = useRef(null);
  const seenRef = useRef(new Set());
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState([]); // codes caught this session
  const [torchOn, setTorchOn] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const beep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start();
      o.stop(ctx.currentTime + 0.16);
    } catch {}
  };

  useEffect(() => {
    if (!open) return;
    // Seed the seen-set with codes the parent already has, so re-scanning an
    // already-listed label doesn't buzz again.
    seenRef.current = new Set(existing.map((s) => String(s).toUpperCase()));
    setSession([]);
    setError("");
    let cancelled = false;
    let reader;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current,
          (result) => {
            if (!result) return;
            const raw = result.getText
              ? result.getText()
              : String(result.text || "");
            const code = raw.trim().toUpperCase().replace(/\s+/g, "");
            if (!code || seenRef.current.has(code)) return;
            seenRef.current.add(code);
            setSession((prev) => [code, ...prev]);
            beep();
            try {
              if (navigator.vibrate) navigator.vibrate(60);
            } catch {}
            onDetect && onDetect(code);
          },
        );
        controlsRef.current = controls;
        if (cancelled) controls.stop();
      } catch (e) {
        console.error("Scanner error:", e);
        setError(
          e?.name === "NotAllowedError"
            ? "Camera permission denied. Allow camera access and try again."
            : "Couldn't start the camera on this device.",
        );
      }
    })();

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop();
      } catch {}
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleTorch = async () => {
    try {
      const stream = videoRef.current?.srcObject;
      const track = stream?.getVideoTracks?.()[0];
      if (!track) return;
      const caps = track.getCapabilities?.();
      if (!caps || !caps.torch) return;
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch {}
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="bscan-overlay">
      <div className="bscan-head">
        <span className="bscan-title">
          <Camera size={16} /> Scan barcode
        </span>
        <button
          type="button"
          className="bscan-x"
          onClick={onClose}
          aria-label="Close scanner"
        >
          <X size={20} />
        </button>
      </div>

      <div className="bscan-stage">
        <video ref={videoRef} className="bscan-video" playsInline muted />
        <div className="bscan-frame" aria-hidden="true">
          <span className="bscan-corner tl" />
          <span className="bscan-corner tr" />
          <span className="bscan-corner bl" />
          <span className="bscan-corner br" />
          <span className="bscan-laser" />
        </div>
        {error ? (
          <div className="bscan-error">{error}</div>
        ) : (
          <div className="bscan-hint">
            Point the camera at a barcode — it scans automatically
          </div>
        )}
        <button
          type="button"
          className={`bscan-torch${torchOn ? " on" : ""}`}
          onClick={toggleTorch}
          aria-label="Toggle flashlight"
        >
          <Zap size={18} />
        </button>
      </div>

      <div className="bscan-foot">
        <div className="bscan-caught">
          <span className="bscan-count">{session.length}</span> scanned this
          session
        </div>
        {session.length > 0 && (
          <div className="bscan-list">
            {session.slice(0, 6).map((c, i) => (
              <span className="bscan-chip" key={i}>
                <Check size={12} /> {c}
              </span>
            ))}
          </div>
        )}
        <button type="button" className="bscan-done" onClick={onClose}>
          Done{session.length ? ` · ${session.length} added` : ""}
        </button>
      </div>
    </div>,
    document.body,
  );
}
