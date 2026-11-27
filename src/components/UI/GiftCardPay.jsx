"use client";
import "./GiftCardPay.styles.css";

// Card / net-banking payments via an Amazon Pay e-gift card.
// The shopper buys an Amazon Pay e-gift card for the exact amount (paying on
// Amazon with their credit card, debit card, net banking or UPI), then pastes
// the claim code here. Amazon doesn't accept a pre-filled amount in the link,
// so step 2 makes the amount a one-tap copy.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PayDemo } from "./UpiPayGuide";
import {
  ArrowRight,
  Check,
  ClipboardPaste,
  Copy,
  CreditCard,
  ExternalLink,
  Gift,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  TicketCheck,
} from "lucide-react";

// Amazon's classic "Amazon Pay eGift Card" (e-mail / share delivery, any amount
// from ₹10). The same https link opens the Amazon app on phones when it's
// installed, and Amazon.in in the browser otherwise.
export const AMAZON_GC_URL = "https://www.amazon.in/dp/B00KGE2ER2";
// Fallback: every Amazon Pay e-gift card design (e-mail gift cards category).
export const AMAZON_GC_LIST_URL = "https://www.amazon.in/s?k=amazon+pay+egift+card&rh=n%3A5807230031";

// Amazon.in claim codes: 14 (sometimes 15) letters/digits, shown as
// XXXX-XXXXXX-XXXX. The 16-digit number starting 60… is the Reference ID.
const clean = (v) => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export function formatClaimCode(v) {
  const c = clean(v).slice(0, 15);
  return [c.slice(0, 4), c.slice(4, 10), c.slice(10)].filter(Boolean).join("-");
}
export function claimCodeStatus(v) {
  const c = clean(v);
  if (!c) return { ok: false, msg: "" };
  if (/^\d+$/.test(c) && c.length > 12)
    return { ok: false, msg: "That looks like the Reference ID (numbers only). Paste the claim code instead — it has letters and numbers, like AB12-CD34EF-GH56." };
  if (c.length < 14) return { ok: false, msg: c.length >= 6 ? `${14 - c.length} more character${14 - c.length === 1 ? "" : "s"}` : "" };
  return { ok: c.length <= 15, msg: c.length > 15 ? "Too long — check the code." : "" };
}

const isPhone = () =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");

export default function GiftCardPay({ method, amount, code, onCode, onSubmit, haveCard = false }) {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPhone(isPhone()), 0);
    return () => clearTimeout(t);
  }, []);
  const status = useMemo(() => claimCodeStatus(code), [code]);

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(String(amount));
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const pasteCode = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) onCode(formatClaimCode(t));
    } catch {}
  };

  const steps = haveCard
    ? []
    : [
        {
          k: "open",
          done: opened,
          icon: <ExternalLink size={16} />,
          title: "Open the Amazon Pay e-gift card",
          body: phone ? "Opens in the Amazon app if you have it, else Amazon.in." : "Opens Amazon.in in a new tab.",
        },
        {
          k: "amount",
          done: copied || opened,
          icon: <TicketCheck size={16} />,
          title: (
            <>
              Tap <b>“Other amount”</b> and enter <b>₹{amount}</b>
            </>
          ),
          body: "Exactly this amount — the gift card pays for your whole order.",
        },
        {
          k: "pay",
          done: status.ok,
          icon: <Mail size={16} />,
          title: (
            <>
              Send it to <b>your own email</b> and pay with your {String(method).toLowerCase()}
            </>
          ),
          body: "Delivery: Email → your email address. Credit card, debit card, net banking or UPI all work on Amazon.",
        },
        {
          k: "code",
          done: status.ok,
          icon: <Gift size={16} />,
          title: "Copy the claim code from Amazon's email",
          body: "It looks like AB12-CD34EF-GH56. Paste it below.",
        },
      ];

  const meth = String(method).toLowerCase();
  const demoSteps = [
    { t: "Open the Amazon Pay e-gift card", s: "Tap Buy on Amazon below" },
    { t: `Tap “Other amount” · enter ₹${amount}`, s: "Exactly this amount — it pays for your whole order" },
    { t: "Email it to yourself & pay", s: `Delivery: Email → your email · pay by ${meth}, net banking or UPI` },
    { t: "Copy the claim code", s: "From Amazon's email — looks like AB12-CD34EF-GH56" },
  ];
  const demoFrames = [
    {
      node: (
        <>
          <span className="cg-ttl">amazon.in</span>
          <span className="gcf-card">
            <b>amazon pay</b>
            <small>e-gift card</small>
          </span>
          <span className="cg-btn or">Buy now<span className="cg-tap" /></span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Gift card amount</span>
          <span className="gcf-chips">
            <i>₹500</i>
            <i>₹1000</i>
            <i className="hl">Other<span className="cg-tap" /></i>
          </span>
          <span className="upg-amt">₹{amount}</span>
        </>
      ),
    },
    {
      node: (
        <>
          <span className="cg-ttl">Delivery: Email</span>
          <span className="upg-field">
            <span className="upg-type">you@gmail.com</span>
          </span>
          <span className="cg-btn gr">Pay ₹{amount}<span className="cg-tap" /></span>
        </>
      ),
    },
    {
      done: true,
      node: (
        <>
          <span className="cg-ttl">Inbox · Amazon</span>
          <span className="gcf-code">
            <small>Claim code</small>
            <b>AB12-CD34EF-GH56</b>
          </span>
          <span className="cg-btn or">Copy<span className="cg-tap" /></span>
        </>
      ),
    },
  ];

  return (
    <div className="gcp">
      <motion.div
        className="gcp-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="gcp-hero-ic" aria-hidden="true">
          {haveCard ? <Gift size={20} /> : <CreditCard size={20} />}
        </span>
        <span className="gcp-hero-tx">
          <small>{haveCard ? "Redeem your Amazon Pay gift card" : `Pay by ${method} via Amazon`}</small>
          <b>₹{amount}</b>
        </span>
        <button type="button" className={`gcp-copy${copied ? " on" : ""}`} onClick={copyAmount}>
          {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy amount"}
        </button>
      </motion.div>

      {!haveCard && (
        <motion.section
          className="gcp-sec"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
        >
          <h3 className="gcp-sec-h">How to pay · 4 quick steps</h3>
        <PayDemo label="How to pay with an Amazon Pay e-gift card" steps={demoSteps} frames={demoFrames} />
        <div className="gcp-actions">
          <a
            href={AMAZON_GC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gcp-amz"
            onClick={() => setOpened(true)}
          >
            <span className="gcp-amz-logo" aria-hidden="true">
              a<i />
            </span>
            Buy on Amazon <ArrowRight size={15} />
          </a>
          <button type="button" className={`gcp-chip${copied ? " on" : ""}`} onClick={copyAmount}>
            {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />} ₹{amount}
          </button>
        </div>
        <p className="gcp-sub-note">
          {phone ? "Opens in the Amazon app if you have it, else Amazon.in." : "Opens Amazon.in in a new tab."}{" "}
          <a href={AMAZON_GC_LIST_URL} target="_blank" rel="noopener noreferrer" className="gcp-alt" onClick={() => setOpened(true)}>
            More designs
          </a>
        </p>
        </motion.section>
      )}

      <motion.div
        className={`gcp-sec gcp-code${status.ok ? " ok" : status.msg && clean(code).length >= 14 ? " bad" : ""}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: haveCard ? 0.1 : 0.4, duration: 0.3 }}
      >
        <label htmlFor="gcp-code-in">Amazon gift card claim code</label>
        <div className="gcp-field">
          <input
            id="gcp-code-in"
            value={code}
            onChange={(e) => onCode(formatClaimCode(e.target.value))}
            placeholder="AB12-CD34EF-GH56"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
          />
          {status.ok ? (
            <span className="gcp-ok" aria-label="Looks right">
              <Check size={16} strokeWidth={3} />
            </span>
          ) : (
            <button type="button" className="gcp-paste" onClick={pasteCode}>
              <ClipboardPaste size={14} /> Paste
            </button>
          )}
        </div>
        {status.msg && <p className="gcp-hint">{status.msg}</p>}
      </motion.div>

      <button type="button" className={`gcp-submit${status.ok ? " ready" : ""}`} disabled={!status.ok} onClick={onSubmit}>
        <Lock size={15} /> Confirm &amp; place order · ₹{amount}
      </button>

      <ul className="gcp-fine">
        <li>
          <ShieldCheck size={13} /> We verify the code and confirm your order on WhatsApp, usually within minutes.
        </li>
        <li>
          <Smartphone size={13} /> Never share your Amazon password or OTP — we only need the claim code.
        </li>
      </ul>
    </div>
  );
}
