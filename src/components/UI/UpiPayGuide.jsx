"use client";

// Full-page "pay in your UPI app" guide, shown after the shopper taps
// "Open <app>" at checkout. The UPI ID is already copied; two sections walk
// them through paying — paste the UPI ID, OR download the QR and upload it in
// the app — each with a looping mini-phone demo (same style as the bag's
// "How to checkout" guide). A sticky bottom bar opens the app.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CodSwitchBtn from "./CodSwitchBtn";
import { showToast } from "@/context/ToastContext";
import {
  X,
  Check,
  Copy,
  Download,
  ArrowRight,
  ClipboardPaste,
  Image as ImageIcon,
  ScanLine,
  ShieldCheck,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";

const FRAME_MS = 2300;
// The name the UPI app shows for our account (either one is us).
const PAYEE_NAMES = ["Uskillbook", "Murthy"];
const PAYEE_TXT = PAYEE_NAMES.join(" or ");

// Loops 0..n-1 while the demo is on screen (and motion is allowed).
function useLoop(n) {
  const ref = useRef(null);
  const [f, setF] = useState(0);
  const [inView, setInView] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setF((x) => (x + 1) % n), FRAME_MS);
    return () => clearInterval(id);
  }, [inView, n]);
  return { ref, f, setF };
}

// Mini phone on the left, steps on the right — the active step follows the phone.
function PayDemo({ steps, frames, label }) {
  const { ref, f, setF } = useLoop(frames.length);
  return (
    <div ref={ref} className="cg-body upg-demo" aria-label={label}>
      <div className="cg-phone upg-phone" aria-hidden="true">
        <div className="cg-notch" />
        {frames.map((fr, i) => (
          <div key={i} className={`cg-fr${f === i ? " on" : ""}${fr.done ? " cg-done" : ""}`}>
            {fr.node}
          </div>
        ))}
      </div>
      <ol className="cg-steps">
        {steps.map((st, i) => (
          <li key={st.t} className={i === f ? "on" : i < f ? "done" : ""}>
            <button type="button" onClick={() => setF(i)}>
              <span className="cg-n">{i < f ? <Check size={11} strokeWidth={3.5} /> : i + 1}</span>
              <span className="cg-t">
                <b>{st.t}</b>
                <small>{st.s}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

const Done = ({ amount }) => (
  <>
    <span className="cg-badge">
      <span className="cg-badge-bg" />
      <Check size={22} strokeWidth={3.5} className="cg-badge-ic" />
    </span>
    <span className="cg-ok">₹{amount} paid!</span>
  </>
);

// Tiny QR glyph drawn with CSS cells.
const MiniQr = ({ className = "" }) => (
  <span className={`upg-qr ${className}`}>
    {Array.from({ length: 25 }).map((_, i) => (
      <i key={i} className={[0, 1, 5, 6, 3, 4, 8, 9, 15, 16, 20, 21, 12, 18, 23, 13].includes(i) ? "k" : ""} />
    ))}
  </span>
);

export default function UpiPayGuide({
  appLabel = "your UPI app",
  amount = 0,
  upiId = "",
  qrState = "idle", // idle | pending | ok | failed
  onCopy,
  onDownloadQr,
  onLaunch,
  onClose,
  onSwitchToCOD,
  codAmount = 0,
}) {
  const [copied, setCopied] = useState(false);
  // On arrival: the UPI ID was copied in the app-pick tap. Tell them (toast +
  // haptic buzz) and how it gets confirmed.
  useEffect(() => {
    const t = setTimeout(
      () =>
        showToast(`Pay ₹${amount} through ${appLabel}. We'll verify it automatically.`, "success", {
          title: "UPI ID copied",
        }),
      350,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const copyAgain = () => {
    showToast(`Paste it in ${appLabel} and pay ₹${amount}.`, "success", { title: "UPI ID copied" });
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const shortId = upiId.length > 16 ? `${upiId.slice(0, 13)}…` : upiId;

  const idSteps = [
    { t: `Open ${appLabel}`, s: "Tap “Pay UPI ID / number” (or “Pay anyone”)" },
    { t: "Paste the UPI ID", s: "Long-press the box and tap Paste — it’s already copied" },
    { t: `Enter ₹${amount}`, s: `Check the name shows ${PAYEE_TXT}, then type the exact amount` },
    { t: "Pay & come back", s: "Enter your UPI PIN, then return here — we verify it" },
  ];
  const idFrames = [
    {
      node: (
        <>
          <span className="cg-ttl">{appLabel}</span>
          <span className="upg-grid">
            <i /><i /><i /><i className="hl">UPI ID<span className="cg-tap" /></i>
          </span>
          <span className="upg-rows"><b /><b /></span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Pay UPI ID</span>
          <span className="upg-field">
            <span className="upg-type">{shortId}</span>
          </span>
          <span className="upg-paste">
            <ClipboardPaste size={8} /> Paste<span className="cg-tap" />
          </span>
          <span className="cg-btn or">Verify</span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Paying {PAYEE_NAMES[0]}</span>
          <span className="upg-amt">₹{amount}</span>
          <span className="upg-keys">
            {Array.from({ length: 9 }).map((_, i) => <i key={i} />)}
          </span>
          <span className="cg-btn gr">Pay<span className="cg-tap" /></span>
        </>
      ),
    },
    { done: true, node: <Done amount={amount} /> },
  ];

  const qrSteps = [
    { t: "Download the QR", s: "It saves to your gallery / downloads" },
    { t: `Open ${appLabel} → Scan`, s: "Tap “Scan any QR”, then the gallery / upload icon" },
    { t: "Pick the saved QR", s: "Choose “thebookx-upi-qr” from your photos" },
    { t: `Pay ₹${amount} & come back`, s: `Name shows ${PAYEE_TXT} · enter PIN, return here` },
  ];
  const qrFrames = [
    {
      node: (
        <>
          <span className="cg-ttl">TheBookX</span>
          <span className="upg-dl">
            <MiniQr />
            <span className="upg-dl-arrow"><Download size={10} strokeWidth={3} /></span>
          </span>
          <span className="upg-saved">Saved to gallery</span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Scan any QR</span>
          <span className="upg-scan">
            <span className="upm-scan-c tl" /><span className="upm-scan-c tr" />
            <span className="upm-scan-c bl" /><span className="upm-scan-c br" />
            <span className="upg-scanline" />
          </span>
          <span className="upg-galbtn">
            <ImageIcon size={9} /> Upload<span className="cg-tap" />
          </span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Gallery</span>
          <span className="upg-photos">
            <i /><i /><i className="pick"><MiniQr className="sm" /><span className="cg-tap" /></i>
            <i /><i /><i />
          </span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Paying {PAYEE_NAMES[0]}</span>
          <span className="upg-amt">₹{amount}</span>
          <span className="upg-rows"><b /><b /></span>
          <span className="cg-btn gr">Pay<span className="cg-tap" /></span>
        </>
      ),
    },
  ];

  return (
    <motion.div
      className="upg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upg-h"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="upg-top">
        <button type="button" className="upg-x" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <span className="upg-top-t">
          <b id="upg-h">Pay with {appLabel}</b>
          <small>Amount ₹{amount}</small>
        </span>
      </header>

      <div className="upg-scroll">
        {/* Copied confirmation */}
        <section className="upg-card upg-copied">
          <span className="upg-tick" aria-hidden="true">
            <Check size={22} strokeWidth={3.2} />
          </span>
          <div className="upg-copied-tx">
            <b>UPI ID copied!</b>
            <span>Open {appLabel} and pay ₹{amount} there.</span>
          </div>
          <p className="upg-payee">
            <BadgeCheck size={15} />
            <span>
              In the app the name will show as <b>{PAYEE_NAMES[0]}</b> or <b>{PAYEE_NAMES[1]}</b>. Both are
              TheBookX, so go ahead and pay.
            </span>
          </p>
          <div className="upg-idrow">
            <code>{upiId}</code>
            <button type="button" onClick={copyAgain} data-no-busy>
              {copied ? <><Check size={13} strokeWidth={3} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
        </section>

        {/* Option 1 — paste the UPI ID */}
        <section className="upg-card">
          <div className="upg-h">
            <span className="upg-opt">Option 1</span>
            <h3>Pay by pasting the UPI ID</h3>
          </div>
          <PayDemo label="How to pay with the UPI ID" steps={idSteps} frames={idFrames} />
        </section>

        <div className="upg-or" role="separator">
          <span>OR</span>
        </div>

        {/* Option 2 — download QR, upload in the app */}
        <section className="upg-card">
          <div className="upg-h">
            <span className="upg-opt">Option 2</span>
            <h3>Download the QR & upload it in the app</h3>
          </div>
          <PayDemo label="How to pay by uploading the QR" steps={qrSteps} frames={qrFrames} />
          <button
            type="button"
            className={`upg-dlbtn${qrState === "ok" ? " ok" : ""}${qrState === "failed" ? " fail" : ""}`}
            onClick={onDownloadQr}
            disabled={qrState === "pending"}
            data-no-busy
          >
            {qrState === "pending" ? (
              <>
                <span className="upiv3-spin dark" /> Saving QR…
              </>
            ) : qrState === "ok" ? (
              <>
                <Check size={16} strokeWidth={3} /> QR saved · download again
              </>
            ) : qrState === "failed" ? (
              <>
                <AlertCircle size={16} /> Download failed · try again
              </>
            ) : (
              <>
                <Download size={16} /> Download QR code
              </>
            )}
          </button>
        </section>

        <p className="upg-safe">
          <ShieldCheck size={14} /> After paying, come back to this page. We verify your payment and confirm the order.
        </p>
      </div>

      <footer className="upg-bar">
        <button type="button" className="upg-cta" onClick={onLaunch}>
          {qrState === "ok" ? <ScanLine size={17} /> : <ClipboardPaste size={17} />}
          Open {appLabel} &amp; pay ₹{amount}
          <ArrowRight size={17} />
        </button>
        {onSwitchToCOD && <CodSwitchBtn onClick={onSwitchToCOD} amount={codAmount} />}
      </footer>
    </motion.div>
  );
}
