"use client";
import "./UpiPayGuide.styles.css";

// Full-page "pay in your UPI app" guide, shown after the shopper taps
// "Open <app>" at checkout. The UPI ID is already copied; two sections walk
// them through paying — paste the UPI ID, OR download the QR and upload it in
// the app — each with a looping mini-phone demo (same style as the bag's
// "How to checkout" guide). A sticky bottom bar opens the app.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CodSwitchBtn from "./CodSwitchBtn";
import { showToast } from "@/context/ToastContext";
import { downloadUpiQr } from "@/utils/upiApps";
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
  Maximize2,
  ServerCrash,
  QrCode,
} from "lucide-react";

const QR_SRC = "/books/uskillbook.png";

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
export function PayDemo({ steps, frames, label }) {
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

// The two ways to pay on a phone — Option 1: download the QR and upload it in
// the app, OR Option 2: paste the UPI ID — each with a looping mini-phone demo.
// Used by the full-page guide and under the checkout QR screen. Without
// onDownloadQr it saves the QR itself (downloadUpiQr) and tracks the result.
export function UpiPayOptions({
  appLabel = "your UPI app",
  amount = 0,
  upiId = "",
  advance = false,
  qrState: qrStateProp,
  onDownloadQr: onDownloadQrProp,
  tabs = false, // desktop: show the two options as tabs
}) {
  const [tab, setTab] = useState(0);
  const [ownQr, setOwnQr] = useState("idle");
  useEffect(() => {
    if (onDownloadQrProp) return;
    const on = (e) => setOwnQr(e.detail?.ok ? "ok" : "failed");
    window.addEventListener("tbx:qr-download", on);
    return () => window.removeEventListener("tbx:qr-download", on);
  }, [onDownloadQrProp]);
  const qrState = onDownloadQrProp ? qrStateProp || "idle" : ownQr;
  const onDownloadQr =
    onDownloadQrProp ||
    (() => {
      setOwnQr("pending");
      downloadUpiQr({ amount, upiId, advance });
      setTimeout(() => setOwnQr((q) => (q === "pending" ? "ok" : q)), 3000);
    });
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

  const one = (
    <section className="upg-card">
      <div className="upg-h">
        <span className="upg-opt">Option 1</span>
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
  );
  const two = (
    <section className="upg-card">
      <div className="upg-h">
        <span className="upg-opt">Option 2</span>
        <h3>Pay by pasting the UPI ID</h3>
      </div>
      <PayDemo label="How to pay with the UPI ID" steps={idSteps} frames={idFrames} />
    </section>
  );

  // Tabs (desktop): one demo at a time so everything fits on one screen.
  if (tabs) {
    return (
      <div className="upg-tabsw">
        <div className="upg-tabs" role="tablist" aria-label="Ways to pay">
          <button type="button" role="tab" aria-selected={tab === 0} className={tab === 0 ? "on" : ""} onClick={() => setTab(0)} data-no-busy>
            <QrCode size={14} /> Upload the QR
          </button>
          <button type="button" role="tab" aria-selected={tab === 1} className={tab === 1 ? "on" : ""} onClick={() => setTab(1)} data-no-busy>
            <ClipboardPaste size={14} /> Paste the UPI ID
          </button>
        </div>
        {tab === 0 ? one : two}
      </div>
    );
  }

  return (
    <>
      {one}
      <div className="upg-or" role="separator">
        <span>OR</span>
      </div>
      {two}
    </>
  );
}

export default function UpiPayGuide({
  appLabel = "your UPI app",
  amount = 0,
  upiId = "",
  qrState = "idle", // idle | pending | ok | failed
  onCopy,
  onDownloadQr,
  onLaunch,
  onPaid,
  onClose,
  onSwitchToCOD,
  codAmount = 0,
}) {
  const [copied, setCopied] = useState(false);
  const [qrPreview, setQrPreview] = useState(false);
  // Desktop: shoppers scan with their phone, so the QR leads (not the UPI ID).
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const check = () => {
      const touch = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");
      setDesktop(!touch && window.innerWidth >= 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  // On arrival: the UPI ID was copied in the app-pick tap. Tell them (toast +
  // haptic buzz) and how it gets confirmed.
  useEffect(() => {
    const t = setTimeout(
      () => {
        const isDesk =
          !/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "") && window.innerWidth >= 768;
        showToast(
          isDesk
            ? `Scan the QR with any UPI app on your phone and pay ₹${amount}. We'll verify it automatically.`
            : `Pay ₹${amount} through ${appLabel}. We'll verify it automatically.`,
          "success",
          { title: isDesk ? "Scan to pay" : "UPI ID copied" },
        );
      },
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
        {/* Shown only in this modal: why they're paying in their own app */}
        <div className="upg-busy" role="status">
          <ServerCrash size={18} />
          <span>
            <b>Payment servers are busy right now</b>
            <small>Please pay ₹{amount} directly using the steps below. It takes under a minute.</small>
          </span>
        </div>

        {desktop && (
          <section className="upg-card upg-deskqr">
            <span className="upg-deskqr-k">Scan with any UPI app on your phone</span>
            <b className="upg-deskqr-amt">₹{amount}</b>
            <button
              type="button"
              className="upg-deskqr-img"
              onClick={() => setQrPreview(true)}
              aria-label="View the QR code larger"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={QR_SRC} alt="TheBookX UPI QR code" />
            </button>
            <span className="upg-payto-name">
              <BadgeCheck size={13} /> Shows as <b>{PAYEE_NAMES[0]}</b> or <b>{PAYEE_NAMES[1]}</b> · enter ₹{amount}
            </span>
            <div className="upg-deskqr-alt">
              <button type="button" onClick={onDownloadQr} disabled={qrState === "pending"} data-no-busy>
                <Download size={14} /> {qrState === "ok" ? "QR saved" : "Download QR"}
              </button>
              <button type="button" onClick={copyAgain} data-no-busy>
                {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />} {upiId}
              </button>
            </div>
          </section>
        )}

        {/* Two ways to pay (phones): Option 1 = QR, OR, Option 2 = UPI ID */}
        {!desktop && (
          <UpiPayOptions appLabel={appLabel} amount={amount} upiId={upiId} qrState={qrState} onDownloadQr={onDownloadQr} />
        )}

        <p className="upg-safe">
          <ShieldCheck size={14} /> After paying, come back to this page. We verify your payment and confirm the order.
        </p>
      </div>

      {/* QR preview: the QR with the amount + download */}
      <AnimatePresence>
        {qrPreview && (
          <motion.div
            className="upg-qrprev-back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrPreview(false)}
          >
            <motion.div
              className="upg-qrprev"
              role="dialog"
              aria-modal="true"
              aria-label="TheBookX UPI QR code"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="upg-qrprev-x" onClick={() => setQrPreview(false)} aria-label="Close">
                <X size={18} />
              </button>
              <span className="upg-qrprev-k">Scan to pay</span>
              <b className="upg-qrprev-amt">₹{amount}</b>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={QR_SRC} alt="TheBookX UPI QR code" className="upg-qrprev-img" />
              <span className="upg-qrprev-name">
                <BadgeCheck size={14} /> Shows as {PAYEE_TXT}
              </span>
              <div className="upg-idrow upg-qrprev-id">
                <code>{upiId}</code>
                <button type="button" onClick={copyAgain} data-no-busy>
                  {copied ? <><Check size={13} strokeWidth={3} /> Copied</> : <><Copy size={13} /> Copy UPI ID</>}
                </button>
              </div>
              <button
                type="button"
                className={`upg-dlbtn${qrState === "ok" ? " ok" : ""}`}
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
                ) : (
                  <>
                    <Download size={16} /> Download QR
                  </>
                )}
              </button>
              <small className="upg-qrprev-note">Then open {appLabel} → Scan → upload this QR and pay ₹{amount}.</small>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="upg-bar">
        {desktop ? (
          <button type="button" className="upg-cta" onClick={onPaid || onLaunch}>
            <ShieldCheck size={17} /> I&apos;ve paid ₹{amount} · verify
            <ArrowRight size={17} />
          </button>
        ) : (
          <button type="button" className="upg-cta" onClick={onLaunch}>
            {qrState === "ok" ? <ScanLine size={17} /> : <ClipboardPaste size={17} />}
            Open {appLabel} &amp; pay ₹{amount}
            <ArrowRight size={17} />
          </button>
        )}
        {onSwitchToCOD && <CodSwitchBtn onClick={onSwitchToCOD} amount={codAmount} />}
      </footer>
    </motion.div>
  );
}
