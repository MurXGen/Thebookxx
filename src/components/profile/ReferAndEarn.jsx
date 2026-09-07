"use client";

import { useState } from "react";
import { Gift, Copy, Check, Loader2, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { showToast } from "@/context/ToastContext";

const SITE = "https://www.thebookx.in";
const REFERRER_REWARD = 50;
const REFEREE_REWARD = 30;

// "Refer & Earn" card for the order-detail page. Enabling generates (or fetches)
// the customer's 6-char code and a shareable /refer/{code} link. They earn ₹50
// when a friend's first order is delivered; the friend gets ₹30.
export default function ReferAndEarn({ phone }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="refearn-card">
      <div className="refearn-head">
        <span className="refearn-ic">
          <Gift size={18} />
        </span>
        <div className="refearn-head-txt">
          <h3 className="refearn-title">Refer &amp; Earn ₹{REFERRER_REWARD}</h3>
          <p className="refearn-sub">
            Invite a friend — they get ₹{REFEREE_REWARD} off, you get ₹
            {REFERRER_REWARD} in your wallet once their first order is delivered.
          </p>
        </div>
      </div>

      {!code ? (
        <button
          type="button"
          className="refearn-enable"
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
