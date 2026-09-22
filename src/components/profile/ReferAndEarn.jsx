"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Copy, Check, Loader2, Users, Lock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { showToast } from "@/context/ToastContext";

const SITE = "https://www.thebookx.in";
const REFERRER_REWARD = 50;
const REFEREE_REWARD = 30;

// Social-proof faces (reuses the community member avatars).
const PROOF_AVATARS = [
  "/review/promotions/member-1.jpeg",
  "/review/promotions/member-2.jpeg",
  "/review/promotions/member-3.jpeg",
  "/review/promotions/member-4.jpeg",
];

// "Refer & Earn" card for the order-detail page. Enabling generates (or fetches)
// the customer's 6-char code and a shareable /refer/{code} link. They earn ₹50
// when a friend's first order is delivered; the friend gets ₹30.
export default function ReferAndEarn({
  phone,
  compact = false,
  minimal = false,
  guide = false,
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locked, setLocked] = useState("");
  // One-time onboarding guide: the button "taps" itself and a +₹50 coin floats
  // up toward the wallet, showing what sharing earns.
  const [guidePress, setGuidePress] = useState(false);
  const [guideCoin, setGuideCoin] = useState(false);

  useEffect(() => {
    if (!guide) return;
    const t1 = setTimeout(() => setGuidePress(true), 700);
    const t2 = setTimeout(() => {
      setGuidePress(false);
      setGuideCoin(true);
    }, 1150);
    const t3 = setTimeout(() => setGuideCoin(false), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [guide]);

  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  const link = code ? `${SITE}/refer/${code}` : "";

  const enable = async () => {
    if (digits.length !== 10) {
      showToast("Log in with your number to get your referral link.", "info");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-code", phone: digits }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {}
      if (data?.code) {
        setCode(String(data.code).toUpperCase());
      } else if (data?.status === "locked") {
        // Not eligible yet — needs a delivered order first.
        setLocked(data.message || "Available after your first delivered order.");
      } else {
        // Surface the real reason so issues are obvious while testing.
        const reason = data?.error || `HTTP ${res.status}`;
        showToast(`Couldn't create link: ${reason}`, "error");
        console.error("create-code failed:", res.status, data);
      }
    } catch (e) {
      showToast(`Couldn't create link: ${String(e?.message || e)}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      showToast("Referral link copied 🎉", "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Couldn't copy — long-press to copy the link.", "info");
    }
  };

  const share = () => {
    const msg =
      `📚 I've been loving *TheBookX* — bestsellers from just ₹1!\n\n` +
      `Use my link and get *₹${REFEREE_REWARD} off* your first order:\n${link}\n\n` +
      `Happy reading! 🎁`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Minimal variant: no container/faces/meter — just a dashed-top separator
  // with the earning line and the CTA, tucked inside the profile card.
  if (minimal) {
    return (
      <div className="refearn-mini">
        <div className="refearn-mini-txt">
          <strong>Refer &amp; Earn ₹{REFERRER_REWARD}</strong>
          <span>
            Your friend saves ₹{REFEREE_REWARD}, you earn ₹{REFERRER_REWARD} once
            their first order is delivered.
          </span>
        </div>
        {locked ? (
          <div className="refearn-locked refearn-mini-locked">
            <Lock size={14} />
            <span>{locked}</span>
          </div>
        ) : !code ? (
          <button
            type="button"
            className="refearn-mini-cta"
            onClick={enable}
            disabled={busy}
          >
            {busy ? (
              <Loader2 size={15} className="refearn-spin" />
            ) : (
              <Users size={15} />
            )}
            Get my referral link
          </button>
        ) : (
          <>
            <div className="refearn-linkrow refearn-mini-linkrow">
              <span className="refearn-link" title={link}>
                {link.replace(/^https?:\/\//, "")}
              </span>
              <button
                type="button"
                className="refearn-copy"
                onClick={copy}
                aria-label="Copy link"
              >
                {copied ? (
                  <Check size={15} strokeWidth={3} />
                ) : (
                  <Copy size={15} />
                )}
              </button>
            </div>
            <button
              type="button"
              className="refearn-mini-cta"
              onClick={share}
            >
              <FaWhatsapp size={16} /> Share on WhatsApp
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`refearn-card${compact ? " refearn-card--compact" : ""}`}
      style={{ position: "relative" }}
    >
      {/* One-time guide: a +₹50 coin floats up toward the wallet card. */}
      <AnimatePresence>
        {guideCoin && (
          <motion.div
            className="refearn-coin"
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: -150, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.45, ease: "easeOut", times: [0, 0.15, 0.7, 1] }}
          >
            +₹{REFERRER_REWARD} to your wallet
          </motion.div>
        )}
      </AnimatePresence>
      {/* Decorative floating coins — makes the card feel valuable/important. */}
      <span className="refearn-deco" aria-hidden="true">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <g className="refearn-deco-c1">
            <circle cx="26" cy="24" r="13" fill="#ffb703" opacity="0.9" />
            <text x="26" y="29" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">₹</text>
          </g>
          <g className="refearn-deco-c2">
            <circle cx="92" cy="40" r="10" fill="#fb8500" opacity="0.85" />
            <text x="92" y="44.5" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">₹</text>
          </g>
          <g className="refearn-deco-c3">
            <circle cx="70" cy="14" r="7" fill="#ffd166" opacity="0.8" />
          </g>
        </svg>
      </span>

      <div className="refearn-head">
        <span className="refearn-ic">
          <Gift size={18} />
        </span>
        <div className="refearn-head-txt">
          <h3 className="refearn-title">Refer &amp; Earn ₹{REFERRER_REWARD}</h3>
          <p className="refearn-sub">
            {compact ? (
              <>
                Your friend saves ₹{REFEREE_REWARD}, you earn ₹{REFERRER_REWARD}.
                Everyone wins.
              </>
            ) : (
              <>
                Invite a friend. They get ₹{REFEREE_REWARD} off, you get ₹
                {REFERRER_REWARD} in your wallet once their first order is
                delivered.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Social proof + an SVG "earnings filling" meter to build momentum. */}
      <div className="refearn-proof">
        <span className="refearn-proof-faces">
          {PROOF_AVATARS.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </span>
        <span className="refearn-proof-txt">
          <b>10.3k+ readers</b> are referring friends, earning rewards &amp;
          growing their bookshelf.
        </span>
      </div>
      <div className="refearn-meter" aria-hidden="true">
        <svg viewBox="0 0 300 8" preserveAspectRatio="none" width="100%" height="8">
          <rect x="0" y="0" width="300" height="8" rx="4" fill="#f1e6d4" />
          <rect
            className="refearn-meter-fill"
            x="0"
            y="0"
            width="300"
            height="8"
            rx="4"
            fill="url(#refGrad)"
          />
          <defs>
            <linearGradient id="refGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#fb8500" />
              <stop offset="1" stop-color="#ffb703" />
            </linearGradient>
          </defs>
        </svg>
        <span className="refearn-meter-lbl">More readers earning every day</span>
      </div>

      {locked ? (
        <div className="refearn-locked">
          <Lock size={15} />
          <span>{locked}</span>
        </div>
      ) : !code ? (
        <button
          type="button"
          className={`refearn-enable${guidePress ? " refearn-enable--tap" : ""}`}
          onClick={enable}
          disabled={busy}
        >
          {busy ? (
            <Loader2 size={16} className="refearn-spin" />
          ) : (
            <Users size={16} />
          )}
          Get my referral link
        </button>
      ) : (
        <>
          <div className="refearn-linkrow">
            <span className="refearn-link" title={link}>
              {link.replace(/^https?:\/\//, "")}
            </span>
            <button
              type="button"
              className="refearn-copy"
              onClick={copy}
              aria-label="Copy link"
            >
              {copied ? <Check size={15} strokeWidth={3} /> : <Copy size={15} />}
            </button>
          </div>
          <button type="button" className="refearn-share" onClick={share}>
            <FaWhatsapp size={17} /> Share on WhatsApp
          </button>
          <p className="refearn-foot">
            Your code: <strong>{code}</strong> · Reward credited only on your
            friend&apos;s first <em>delivered</em> order.
          </p>
        </>
      )}
    </div>
  );
}
