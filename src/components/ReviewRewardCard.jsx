"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Gift,
  Upload,
  Check,
  Clock,
  XCircle,
  Sparkles,
  Camera,
  X,
} from "lucide-react";
import { getSavedPhone } from "@/utils/userPhone";
import { showToast } from "@/context/ToastContext";

const MAX_REWARD = 200;
const PLATFORMS = ["Instagram", "YouTube", "Facebook", "Other"];
const norm = (p) => String(p || "").replace(/\D/g, "").slice(-10);

// Downscale an uploaded screenshot to a compact JPEG data URL (keeps the POST
// small while still clear enough for the team to review in Telegram).
function fileToDataUrl(file, maxDim = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        try {
          resolve(c.toDataURL("image/jpeg", quality));
        } catch {
          resolve(reader.result);
        }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReviewRewardCard({ orderId = "", phone: phoneProp = "" }) {
  const [phone, setPhone] = useState(() =>
    norm(phoneProp) ||
    (typeof window !== "undefined" ? norm(getSavedPhone()) : ""),
  );
  const [platform, setPlatform] = useState("Instagram");
  const [link, setLink] = useState("");
  const [shot, setShot] = useState(""); // dataURL preview
  const [busy, setBusy] = useState(false);
  const [subs, setSubs] = useState([]);
  const [open, setOpen] = useState(false); // form expanded
  const [howOpen, setHowOpen] = useState(false); // "How it works" modal
  const fileRef = useRef(null);

  // Prefill from the prop if it arrives after mount (e.g. profile loads async).
  useEffect(() => {
    const p = norm(phoneProp);
    if (p.length === 10) {
      queueMicrotask(() => setPhone((cur) => cur || p));
    }
  }, [phoneProp]);

  const loadSubs = async (p) => {
    const d = norm(p);
    if (d.length !== 10) return;
    try {
      const res = await fetch(`/api/reviews?phone=${d}`);
      const json = await res.json();
      setSubs(Array.isArray(json.submissions) ? json.submissions : []);
    } catch {}
  };
  useEffect(() => {
    if (norm(phone).length === 10) loadSubs(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const pickFile = () => fileRef.current?.click();
  const onFile = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      showToast("Please upload an image screenshot", "error");
      return;
    }
    try {
      setShot(await fileToDataUrl(file));
    } catch {
      showToast("Couldn't read that image — try another", "error");
    }
  };

  const submit = async () => {
    const p = norm(phone);
    if (p.length !== 10) {
      showToast("Enter your 10-digit mobile number", "error");
      return;
    }
    if (!shot) {
      showToast("Upload a screenshot of your post", "error");
      return;
    }
    if (!/^https?:\/\//i.test(link.trim())) {
      showToast("Paste the link where you posted it", "error");
      return;
    }
    setBusy(true);
    try {
      // Remember the number so it's prefilled next time (same key as checkout).
      try {
        localStorage.setItem("track_orders_phone", p);
      } catch {}
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: p,
          orderId,
          platform,
          link: link.trim(),
          image: shot,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) {
        showToast("Submitted! We'll review it shortly 🎉", "success");
        setShot("");
        setLink("");
        setOpen(false);
        loadSubs(p);
      } else {
        showToast(json.error || "Couldn't submit — try again", "error");
      }
    } catch {
      showToast("Couldn't submit — check your connection", "error");
    } finally {
      setBusy(false);
    }
  };

  const StatusRow = ({ s }) => {
    if (s.status === "approved")
      return (
        <div className="rr-sub rr-sub-ok">
          <Check size={15} />
          <span>
            <b>₹{s.amount || 0} credited</b> to your wallet 🎉
            <small>{s.platform ? ` · ${s.platform}` : ""}</small>
          </span>
        </div>
      );
    if (s.status === "rejected")
      return (
        <div className="rr-sub rr-sub-no">
          <XCircle size={15} />
          <span>
            <b>Not approved</b>
            {s.note ? <small> · {s.note}</small> : null}
          </span>
        </div>
      );
    return (
      <div className="rr-sub rr-sub-pending">
        <Clock size={15} />
        <span>
          <b>Under review</b>
          <small> · usually within 24h</small>
        </span>
      </div>
    );
  };

  return (
    <section className="rr-card">
      {/* Compact achievement header — one line + reward progress bar + Claim */}
      <div className="rr-compact">
        <div className="rr-compact-top">
          <span className="rr-badge">
            <Gift size={13} /> SHARE &amp; EARN
          </span>
          <button
            type="button"
            className="rr-how-link"
            onClick={() => setHowOpen(true)}
          >
            <Sparkles size={13} /> How it works
          </button>
        </div>
        <p className="rr-compact-line">
          Post a reel &amp; honest review —{" "}
          <b>earn up to ₹{MAX_REWARD}</b> back to your wallet
        </p>
        <div className="rr-ach">
          <div className="rr-ach-track">
            <span className="rr-ach-dot" style={{ left: "0%" }} />
            <span className="rr-ach-dot" style={{ left: "50%" }} />
            <span className="rr-ach-dot rr-ach-dot-end" style={{ left: "100%" }} />
          </div>
          <div className="rr-ach-scale">
            <span>₹50</span>
            <span>₹100</span>
            <span>₹{MAX_REWARD}</span>
          </div>
        </div>
        <button
          type="button"
          className="rr-claim"
          onClick={() => setOpen(true)}
        >
          <Sparkles size={15} /> Claim up to ₹{MAX_REWARD}
        </button>
      </div>

      {howOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="rr-how-overlay"
            onClick={() => setHowOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="rr-how-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rr-how-modal-head">
                <span className="rr-how-modal-title">
                  <Sparkles size={16} /> How it works
                </span>
                <button
                  type="button"
                  className="rr-how-x"
                  onClick={() => setHowOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <ol className="rr-how-steps">
                <li>
                  <span className="rr-how-ic">
                    <Camera size={14} />
                  </span>
                  <span className="rr-how-txt">
                    <b>Record a reel or story</b> with your TheBookX books and
                    share an honest review on Instagram or YouTube. Tag or
                    mention <b>@thebookx</b> so we can find it.
                  </span>
                </li>
                <li>
                  <span className="rr-how-ic">
                    <Upload size={14} />
                  </span>
                  <span className="rr-how-txt">
                    <b>Submit it below</b> — paste the post link, upload a
                    screenshot, and add your number. Takes under a minute.
                  </span>
                </li>
                <li>
                  <span className="rr-how-ic">
                    <Clock size={14} />
                  </span>
                  <span className="rr-how-txt">
                    <b>We verify your post</b> — usually within 24 hours. You
                    can track the status right here on this card.
                  </span>
                </li>
                <li>
                  <span className="rr-how-ic">
                    <Check size={14} />
                  </span>
                  <span className="rr-how-txt">
                    <b>Get rewarded</b> — ₹50 to ₹{MAX_REWARD} (based on quality
                    &amp; reach) is credited straight to your TheBookX account.
                  </span>
                </li>
              </ol>
              <p className="rr-how-note">
                More genuine, higher-reach posts earn more. One reward per post.
              </p>
            </div>
          </div>,
          document.body,
        )}

      {/* Existing submissions / status */}
      {subs.length > 0 && (
        <div className="rr-subs">
          {subs.slice(0, 4).map((s, i) => (
            <StatusRow s={s} key={s.subId || i} />
          ))}
        </div>
      )}

      {/* Claim / submit form — opens as a modal */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="rr-how-overlay"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="rr-how-modal rr-claim-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rr-how-modal-head">
                <span className="rr-how-modal-title">
                  <Gift size={16} /> Claim up to ₹{MAX_REWARD}
                </span>
                <button
                  type="button"
                  className="rr-how-x"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="rr-form">
                {/* Screenshot */}
                <button type="button" className="rr-upload" onClick={pickFile}>
                  {shot ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={shot} alt="screenshot" className="rr-upload-img" />
                  ) : (
                    <span className="rr-upload-ph">
                      <Camera size={20} />
                      <span>Upload screenshot of your post</span>
                    </span>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  style={{ display: "none" }}
                />

                {/* Platform */}
                <div className="rr-plats">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`rr-plat${platform === p ? " on" : ""}`}
                      onClick={() => setPlatform(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Link */}
                <input
                  className="rr-input"
                  placeholder="Paste the post/reel/story link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />

                {/* Phone */}
                <input
                  className="rr-input"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Your 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />

                <button
                  type="button"
                  className="rr-cta"
                  onClick={submit}
                  disabled={busy}
                >
                  {busy ? (
                    "Submitting…"
                  ) : (
                    <>
                      <Upload size={16} /> Submit for review
                    </>
                  )}
                </button>
                <p className="rr-fine">
                  Reward amount is confirmed after we verify your post. Paid to
                  your TheBookX wallet.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
