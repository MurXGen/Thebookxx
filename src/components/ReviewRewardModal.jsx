"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Upload,
  Check,
  Clock,
  XCircle,
  Camera,
  X,
} from "lucide-react";
import { getSavedPhone } from "@/utils/userPhone";
import { showToast } from "@/context/ToastContext";

const MAX_REWARD = 200;
const PLATFORMS = ["Instagram", "YouTube", "Facebook", "Other"];
const norm = (p) => String(p || "").replace(/\D/g, "").slice(-10);

// Downscale an uploaded screenshot to a compact JPEG data URL.
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

/**
 * ReviewRewardModal — a compact "Get up to ₹200" CTA that opens the full
 * share-&-earn review flow in a pincode-style slide-up modal.
 */
export default function ReviewRewardModal({
  variant = "chip",
  className = "",
  orderId = "",
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [link, setLink] = useState("");
  const [shot, setShot] = useState(""); // dataURL preview
  const [busy, setBusy] = useState(false);
  const [subs, setSubs] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setPhone((cur) => cur || norm(getSavedPhone()));
  }, []);

  const loadSubs = async (p) => {
    const d = norm(p);
    if (d.length !== 10) return;
    try {
      const res = await fetch(`/api/reviews?phone=${d}`);
      const json = await res.json();
      setSubs(Array.isArray(json.submissions) ? json.submissions : []);
    } catch {}
  };

  // Load status when the modal opens with a known number.
  useEffect(() => {
    if (open && norm(phone).length === 10) loadSubs(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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

  const trigger =
    variant === "pill" ? (
      <button
        type="button"
        className={`rr-cos-pill ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Share a review and get up to ₹200 back"
        title="Post a reel/story — get up to ₹200 back"
      >
        <span className="rr-cos-ic" aria-hidden="true">
          <Gift size={16} />
        </span>
        <span className="rr-cos-txt">
          <b>Post &amp; earn up to ₹{MAX_REWARD}</b>
          <small>Share a reel/story — cashback to your account</small>
        </span>
      </button>
    ) : variant === "chip" ? (
      <button
        type="button"
        className={`rr-chip ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Share a review and get up to ₹200 back"
        title="Post a reel/story — get up to ₹200 back"
      >
        <Gift size={14} />
        <span className="rr-chip-txt">
          Up to <b>₹{MAX_REWARD}</b>
        </span>
      </button>
    ) : (
      <button
        type="button"
        className={`rr-cta ${className}`}
        onClick={() => setOpen(true)}
      >
        <Gift size={16} /> Share a review — get up to ₹{MAX_REWARD}
      </button>
    );

  const modal =
    !mounted || typeof document === "undefined"
      ? null
      : createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="bill-modal-overlay"
                style={{ maxWidth: "980px", margin: "0 auto" }}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bill-modal rr-modal"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="bill-header">
                    <span className="weight-600 font-16 flex items-center gap-8">
                      <Gift size={18} /> Share &amp; earn up to ₹{MAX_REWARD}
                    </span>
                    <span
                      className="cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      <X size={18} />
                    </span>
                  </div>

                  <div className="rr-modal-body">
                    <p className="rr-sub-txt">
                      Post a reel or story with your books &amp; an honest review
                      on Instagram/YouTube, send us the link + screenshot, and
                      we&apos;ll credit your wallet. 📚✨
                    </p>

                    <div className="rr-steps">
                      <span>
                        <b>1</b> Post with your books
                      </span>
                      <span>
                        <b>2</b> Upload screenshot + link
                      </span>
                      <span>
                        <b>3</b> Get up to ₹{MAX_REWARD}
                      </span>
                    </div>

                    {subs.length > 0 && (
                      <div className="rr-subs">
                        {subs.slice(0, 4).map((s, i) => (
                          <StatusRow s={s} key={s.subId || i} />
                        ))}
                      </div>
                    )}

                    <div className="rr-form">
                      <button
                        type="button"
                        className="rr-upload"
                        onClick={pickFile}
                      >
                        {shot ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={shot}
                            alt="screenshot"
                            className="rr-upload-img"
                          />
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

                      <input
                        className="rr-input"
                        placeholder="Paste the post/reel/story link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                      />

                      <input
                        className="rr-input"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Your 10-digit mobile number"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
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
                        Reward amount is confirmed after we verify your post.
                        Paid to your TheBookX wallet.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        );

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}
