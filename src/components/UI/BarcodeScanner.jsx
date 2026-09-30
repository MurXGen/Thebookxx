"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Camera, Zap, Pencil, Trash2, GripHorizontal } from "lucide-react";

// Live camera barcode scanner (EMS / India Post labels are Code 128).
// We run our OWN decode loop over a center-cropped region of interest (the
// on-screen frame) so ONLY the barcode inside the box is read — barcodes above
// or below it are ignored. Every new code is normalised (uppercased, spaces
// stripped) and handed to onDetect; a clear "Captured" flash tells the user the
// exact moment a code was grabbed.
export default function BarcodeScanner({
  open,
  onClose,
  onDetect,
  onEdit,
  onRemove,
  ids = [],
  existing = [],
  single = false, // single-capture mode: grab one code, hand it back, close
  title = "Scan barcode",
}) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const readerRef = useRef(null);
  const seenRef = useRef(new Set());
  const busyRef = useRef(false);
  const flashUntilRef = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [captured, setCaptured] = useState(""); // shows the just-grabbed code
  const [torchOn, setTorchOn] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [listH, setListH] = useState(170); // resizable list-panel height (px)
  const dragRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // Drag the divider to resize the list panel vs the camera stage.
  const startResize = (e) => {
    e.preventDefault();
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const startH = listH;
    const maxH = Math.round(window.innerHeight * 0.6);
    const move = (ev) => {
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const next = Math.max(70, Math.min(maxH, startH + (startY - y)));
      setListH(next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  const removeAt = (i) => {
    const val = String(ids[i] || "").toUpperCase();
    seenRef.current.delete(val); // allow re-scanning a removed code
    if (editIdx === i) setEditIdx(-1);
    onRemove && onRemove(i);
  };
  const editAt = (i, val) => {
    const up = String(val || "").toUpperCase().replace(/\s+/g, "");
    onEdit && onEdit(i, up);
  };

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
      o.frequency.value = 900;
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start();
      o.stop(ctx.currentTime + 0.16);
    } catch {}
  };

  // Map the on-screen frame box to intrinsic video pixels (video is object-fit:
  // cover, so it's scaled up and center-cropped) and draw just that slice.
  const drawRoi = () => {
    const video = videoRef.current;
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!video || !frame || !canvas || video.readyState < 2) return null;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    const vRect = video.getBoundingClientRect();
    const fRect = frame.getBoundingClientRect();
    const cw = vRect.width;
    const ch = vRect.height;
    const scale = Math.max(cw / vw, ch / vh);
    const offX = (cw - vw * scale) / 2;
    const offY = (ch - vh * scale) / 2;

    let sx = (fRect.left - vRect.left - offX) / scale;
    let sy = (fRect.top - vRect.top - offY) / scale;
    let sw = fRect.width / scale;
    let sh = fRect.height / scale;
    // Clamp inside the frame.
    sx = Math.max(0, Math.min(sx, vw));
    sy = Math.max(0, Math.min(sy, vh));
    sw = Math.max(1, Math.min(sw, vw - sx));
    sh = Math.max(1, Math.min(sh, vh - sy));

    // Upscale a little for sharper 1D decoding.
    const scaleUp = 2;
    canvas.width = Math.round(sw * scaleUp);
    canvas.height = Math.round(sh * scaleUp);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const handleHit = (raw) => {
    const code = String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!single && (!code || seenRef.current.has(code))) return;
    if (!code) return;
    seenRef.current.add(code);
    setSessionCount((n) => n + 1);
    setCaptured(code);
    flashUntilRef.current = Date.now() + 1000;
    beep();
    try {
      if (navigator.vibrate) navigator.vibrate(70);
    } catch {}
    onDetect && onDetect(code);
    // Single-capture: hand the one code back and close after a brief flash.
    if (single) {
      if (loopRef.current) clearInterval(loopRef.current);
      loopRef.current = null;
      setTimeout(() => onClose && onClose(), 550);
      return;
    }
    setTimeout(() => {
      if (Date.now() >= flashUntilRef.current) setCaptured("");
    }, 1050);
  };

  useEffect(() => {
    if (!open) return;
    seenRef.current = new Set(existing.map((s) => String(s).toUpperCase()));
    setSessionCount(0);
    setCaptured("");
    setError("");
    setReady(false);
    let cancelled = false;

    (async () => {
      try {
        const [{ BrowserMultiFormatReader }, zxlib] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const { DecodeHintType, BarcodeFormat } = zxlib;
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.ITF,
          BarcodeFormat.CODABAR,
          BarcodeFormat.EAN_13,
          BarcodeFormat.UPC_A,
        ]);
        readerRef.current = new BrowserMultiFormatReader(hints);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play().catch(() => {});
        setReady(true);

        // Decode loop over the cropped ROI (~7 fps).
        loopRef.current = setInterval(() => {
          if (busyRef.current) return;
          const canvas = drawRoi();
          if (!canvas) return;
          busyRef.current = true;
          try {
            const result = readerRef.current.decodeFromCanvas(canvas);
            if (result) handleHit(result.getText());
          } catch {
            /* no barcode in the box this frame */
          } finally {
            busyRef.current = false;
          }
        }, 140);
      } catch (e) {
        console.error("Scanner error:", e);
        setError(
          e?.name === "NotAllowedError"
            ? "Camera permission denied. Allow camera access and try again."
            : e?.name === "NotFoundError"
              ? "No camera found on this device."
              : "Couldn't start the camera. Make sure you're on https.",
        );
      }
    })();

    return () => {
      cancelled = true;
      if (loopRef.current) clearInterval(loopRef.current);
      loopRef.current = null;
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
      readerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleTorch = async () => {
    try {
      const track = streamRef.current?.getVideoTracks?.()[0];
      if (!track || !track.getCapabilities?.().torch) return;
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
          <Camera size={16} /> {title}
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
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div
          ref={frameRef}
          className={`bscan-frame${captured ? " hit" : ""}`}
          aria-hidden="true"
        >
          <span className="bscan-corner tl" />
          <span className="bscan-corner tr" />
          <span className="bscan-corner bl" />
          <span className="bscan-corner br" />
          {!captured && <span className="bscan-laser" />}
          {captured && (
            <span className="bscan-hitmark">
              <Check size={30} strokeWidth={3} />
            </span>
          )}
        </div>

        {/* Live status: shows the app is actively grabbing what's in the box. */}
        {!error && (
          <div className={`bscan-status${captured ? " ok" : ""}`}>
            {captured ? (
              <>
                <Check size={14} /> Captured {captured}
              </>
            ) : ready ? (
              <>
                <span className="bscan-dots">
                  <i /> <i /> <i />
                </span>
                Hold the barcode inside the box…
              </>
            ) : (
              <>
                <span className="bscan-spin" /> Starting camera…
              </>
            )}
          </div>
        )}
        {error && <div className="bscan-error">{error}</div>}

        <button
          type="button"
          className={`bscan-torch${torchOn ? " on" : ""}`}
          onClick={toggleTorch}
          aria-label="Toggle flashlight"
        >
          <Zap size={18} />
        </button>
      </div>

      {single ? (
        <div className="bscan-foot">
          <button type="button" className="bscan-done" onClick={onClose}>
            Cancel
          </button>
        </div>
      ) : (
      <>
      {/* Draggable divider between the camera and the ID list */}
      <div
        className="bscan-resizer"
        ref={dragRef}
        onPointerDown={startResize}
        onTouchStart={startResize}
        role="separator"
        aria-label="Drag to resize the list"
      >
        <GripHorizontal size={18} />
      </div>

      <div className="bscan-foot">
        <div className="bscan-foot-top">
          <span className="bscan-caught">
            <span className="bscan-count">{ids.length}</span> ID
            {ids.length === 1 ? "" : "s"} in list
            {sessionCount ? ` · ${sessionCount} this session` : ""}
          </span>
        </div>

        <div className="bscan-panel" style={{ height: listH }}>
          {ids.length === 0 ? (
            <div className="bscan-empty">
              Scanned IDs will appear here — edit or remove any before pushing.
            </div>
          ) : (
            ids.map((code, i) => (
              <div className="bscan-row" key={i}>
                <span className="bscan-row-idx">{i + 1}</span>
                {editIdx === i ? (
                  <input
                    className="bscan-row-input"
                    value={code}
                    autoFocus
                    onChange={(e) => editAt(i, e.target.value)}
                    onBlur={() => setEditIdx(-1)}
                    onKeyDown={(e) => e.key === "Enter" && setEditIdx(-1)}
                  />
                ) : (
                  <span
                    className="bscan-row-code"
                    onClick={() => setEditIdx(i)}
                  >
                    {code || "—"}
                  </span>
                )}
                <button
                  type="button"
                  className="bscan-row-btn edit"
                  onClick={() => setEditIdx(editIdx === i ? -1 : i)}
                  aria-label="Edit"
                >
                  {editIdx === i ? <Check size={16} /> : <Pencil size={15} />}
                </button>
                <button
                  type="button"
                  className="bscan-row-btn del"
                  onClick={() => removeAt(i)}
                  aria-label="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        <button type="button" className="bscan-done" onClick={onClose}>
          Done{ids.length ? ` · ${ids.length} in list` : ""}
        </button>
      </div>
      </>
      )}
    </div>,
    document.body,
  );
}
