"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Upload, Check, Clock, XCircle, X, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getSavedPhone } from "@/utils/userPhone";
import { showToast } from "@/context/ToastContext";

const MAX_REWARD = 200;
const SUPPORT_WA = "917710892108";
const SUPPORT_EMAIL = "uskillbook@gmail.com";
const norm = (p) => String(p || "").replace(/\D/g, "").slice(-10);

/**
 * ReviewRewardModal — a compact "Get up to ₹200" CTA that opens the
 * share-&-earn flow. The shopper just pastes their post link; after submitting
 * they're asked to send the screenshot over WhatsApp or Email (so the proof +
 * image reaches us directly), and we release the reward within 24h.
 */
export default function ReviewRewardModal({
  variant = "chip",
  className = "",
  orderId = "",
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [subs, setSubs] = useState([]);
  // After a successful submit → ask them to send the screenshot to us.
  const [shotPrompt, setShotPrompt] = useState(false);

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

  useEffect(() => {
    if (open && norm(phone).length === 10) loadSubs(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = async () => {
    const p = norm(phone);
    if (p.length !== 10) {
      showToast("Enter your 10-digit mobile number", "error");
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
          platform: "social",
          link: link.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) {
        loadSubs(p);
        setShotPrompt(true); // ask for the screenshot next
      } else {
        showToast(json.error || "Couldn't submit — try again", "error");
      }
    } catch {
      showToast("Couldn't submit — check your connection", "error");
    } finally {
      setBusy(false);
    }
  };

  // Message the shopper sends us along with their screenshot.
  const proofText = () =>
    `Hi TheBookX! 🎉 I've posted my review.\n\n` +
    `🔗 Post link: ${link.trim()}\n` +
    `📱 Mobile: ${norm(phone)}\n\n` +
    `I'm attaching the screenshot of my story/post here. Please release my reward 🙏`;

  const sendWhatsApp = () => {
    window.open(
      `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(proofText())}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const sendEmail = () => {
    const subject = `TheBookX review reward — screenshot (${norm(phone)})`;
    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(proofText())}`;
  };
  const finishPrompt = () => {
    setShotPrompt(false);
    setLink("");
    setOpen(false);
    showToast(
      "Thanks! Once we see your screenshot, your reward lands within 24h 🎉",
      "success",
    );
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
    variant === "fab" ? (
      <button
        type="button"
        className={`cos-fab cos-fab-reward ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Post a reel and earn up to ₹200"
        title="Post & earn up to ₹200"
      >
        <span className="cos-fab-ic">
          <Gift size={21} />
        </span>
        <span className="cos-fab-badge">₹{MAX_REWARD}</span>
        <span className="cos-fab-label">Earn</span>
      </button>
    ) : variant === "pill" ? (
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
                      on Instagram or YouTube, paste the link below, and we&apos;ll
                      credit your wallet. 📚✨
                    </p>

                    <div className="rr-steps">
                      <span>
                        <b>1</b> Post with your books
                      </span>
                      <span>
                        <b>2</b> Paste the link
                      </span>
                      <span>
                        <b>3</b> Send us the screenshot
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
                            <Upload size={16} /> Submit &amp; send screenshot
                          </>
                        )}
                      </button>
                      <p className="rr-fine">
                        After submitting, send us the screenshot on WhatsApp or
                        Email. Reward is paid to your TheBookX wallet once
                        verified.
                      </p>
                    </div>
                  </div>

                  {/* Screenshot prompt — slide-up on top after submit. */}
                  <AnimatePresence>
                    {shotPrompt && (
                      <motion.div
                        className="rr-shot-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={finishPrompt}
                      >
                        <motion.div
                          className="rr-shot-sheet"
                          onClick={(e) => e.stopPropagation()}
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ duration: 0.32, ease: "easeOut" }}
                        >
                          <div className="rr-shot-grab" />
                          <div className="rr-shot-emoji">📸</div>
                          <h3 className="rr-shot-title">
                            One last step — send your screenshot
                          </h3>
                          <p className="rr-shot-sub">
                            Your link is in! Now send us a screenshot of your
                            story/post so we can verify it. Attach the image and
                            send it on WhatsApp or Email — we&apos;ll release
                            your reward within 24 hours. 🎉
                          </p>
                          <div className="rr-shot-btns">
                            <button
                              type="button"
                              className="rr-shot-wa"
                              onClick={sendWhatsApp}
                            >
                              <FaWhatsapp size={18} /> Send on WhatsApp
                            </button>
                            <button
                              type="button"
                              className="rr-shot-email"
                              onClick={sendEmail}
                            >
                              <Mail size={17} /> Send via Email
                            </button>
                          </div>
                          <button
                            type="button"
                            className="rr-shot-done"
                            onClick={finishPrompt}
                          >
                            I&apos;ve sent it
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
