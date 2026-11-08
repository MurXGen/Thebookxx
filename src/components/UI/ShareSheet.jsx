"use client";

// Site-wide sharing. `shareContent()` opens the device's own share sheet
// (WhatsApp, Instagram, Messages… whatever the shopper has installed) when the
// browser supports it — on any screen size. Browsers without it (most desktop
// browsers) get this panel instead, with one-tap app buttons and Copy link.
// <ShareSheetHost /> is mounted once in the root layout.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Link2, Check, Mail, Send } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaTelegram, FaLinkedinIn } from "react-icons/fa6";

const EVENT = "tbx:share";

export async function shareContent({ title = "", text = "", url }) {
  const data = { title, text, url };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      if (!navigator.canShare || navigator.canShare(data)) {
        await navigator.share(data);
        return "shared";
      }
    } catch (err) {
      if (err?.name === "AbortError") return "dismissed"; // closed the sheet
      // NotAllowedError etc. — fall through to our panel
    }
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: data }));
  return "panel";
}

export default function ShareSheetHost() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    const onShare = (e) => {
      setCopied(false);
      setData(e.detail);
    };
    window.addEventListener(EVENT, onShare);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENT, onShare);
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    const onKey = (e) => e.key === "Escape" && setData(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  if (!mounted) return null;

  const url = data?.url || "";
  const msg = [data?.text, url].filter(Boolean).join(" ");
  const enc = encodeURIComponent;
  const apps = data
    ? [
        { name: "WhatsApp", Icon: FaWhatsapp, color: "#25D366", href: `https://wa.me/?text=${enc(msg)}` },
        { name: "Telegram", Icon: FaTelegram, color: "#229ED9", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(data.text || "")}` },
        { name: "Facebook", Icon: FaFacebookF, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
        { name: "X", Icon: FaXTwitter, color: "#0a0a0a", href: `https://twitter.com/intent/tweet?text=${enc(data.text || "")}&url=${enc(url)}` },
        { name: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
        { name: "Email", Icon: Mail, color: "#ea4335", href: `mailto:?subject=${enc(data.title || "")}&body=${enc(msg)}` },
        { name: "SMS", Icon: Send, color: "#0a0a0a", href: `sms:?&body=${enc(msg)}` },
      ]
    : [];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return createPortal(
    <AnimatePresence>
      {data && (
        <motion.div
          className="shs-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setData(null)}
        >
          <motion.div
            className="shs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shs-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shs-head">
              <span className="shs-head-txt">
                <b id="shs-title">Share</b>
                {data.title && <small>{data.title}</small>}
              </span>
              <button type="button" className="shs-x" aria-label="Close" onClick={() => setData(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="shs-apps">
              {apps.map(({ name, Icon, color, href }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="shs-app"
                  onClick={() => setTimeout(() => setData(null), 150)}
                >
                  <span className="shs-app-ic" style={{ color }}>
                    <Icon size={24} />
                  </span>
                  <span className="shs-app-name">{name}</span>
                </a>
              ))}
            </div>

            <div className="shs-link">
              <Link2 size={16} className="shs-link-ic" aria-hidden="true" />
              <span className="shs-link-url">{url.replace(/^https?:\/\//, "")}</span>
              <button type="button" className={`shs-copy${copied ? " done" : ""}`} onClick={copy} data-no-busy>
                {copied ? (
                  <>
                    <Check size={14} strokeWidth={3} /> Copied
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
