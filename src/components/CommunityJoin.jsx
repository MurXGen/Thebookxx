"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, ChevronRight, Heart, Gift, Sparkles, BookOpen, MessageCircle } from "lucide-react";
import { XmasSnow } from "./XmasDecor";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const INSTAGRAM_URL = "https://www.instagram.com/thebookx.in/";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/Lk3okPbq21s8kJeoM3UA4c?mode=gi_t";

// Overlapping member avatars shown in the Join-community sheet.
const COMMUNITY_AVATARS = [
  "/review/promotions/member-1.jpeg",
  "/review/promotions/member-2.jpeg",
  "/review/promotions/member-3.jpeg",
  "/review/promotions/member-4.jpeg",
  "/review/promotions/member-5.jpeg",
];

// Trigger + bottom-sheet to join the community (Instagram / WhatsApp group).
// variant: "icon" | "pill" | "card". The sheet is portaled to <body> so it
// always sits above fixed footers / cart bars.
export default function CommunityJoin({ className = "", variant = "icon" }) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState({});
  const avatars = COMMUNITY_AVATARS.filter((s) => !broken[s]);

  const trigger =
    variant === "fab" ? (
      <button
        type="button"
        className={`cos-fab cos-fab-community ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Join our reader community"
        title="Our reader community"
      >
        <span className="cos-fab-ic">
          <Users size={21} />
        </span>
        <span className="cos-fab-label">Community</span>
      </button>
    ) : variant === "card" ? (
      <button
        type="button"
        className={`community-card-trigger ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Join our community"
      >
        <span className="cct-ic">
          <Heart size={18} fill="currentColor" stroke="none" />
        </span>
        <span className="cct-txt">
          <strong>Join our community</strong>
          <small>Book drops, offers &amp; bookish chat on WhatsApp &amp; Instagram</small>
        </span>
        <span className="cct-faces">
          {avatars.slice(0, 3).map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              onError={() => setBroken((p) => ({ ...p, [src]: true }))}
            />
          ))}
        </span>
        <ChevronRight size={18} className="cct-arrow" />
      </button>
    ) : variant === "hero" ? (
      <button
        type="button"
        className={`cj-hero ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Join our reader community on WhatsApp and Instagram"
      >
        <span className="cj-hero-faces" aria-hidden="true">
          {avatars.slice(0, 3).map((src) => (
            <img key={src} src={src} alt="" loading="lazy" onError={() => setBroken((p) => ({ ...p, [src]: true }))} />
          ))}
        </span>
        <span className="cj-hero-txt">
          <strong>Join 5,000+ readers</strong>
          <small>Our WhatsApp &amp; Instagram community</small>
        </span>
        <span className="cj-hero-apps" aria-hidden="true">
          <i className="wa"><FaWhatsapp size={14} /></i>
          <i className="ig"><FaInstagram size={14} /></i>
        </span>
        <span className="cj-hero-go">
          Join <ChevronRight size={15} />
        </span>
      </button>
    ) : variant === "pill" ? (
      <button
        type="button"
        className={`cos-social-pill ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Join our community"
      >
        <Users size={16} />
        <span>Join community</span>
      </button>
    ) : (
      <button
        type="button"
        className={`community-icon-btn ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Join our community"
        title="Join our community"
      >
        <Users size={18} />
      </button>
    );

  const sheet = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bill-modal-overlay community-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          style={{ zIndex: 4000 }}
        >
          <motion.div
            className="bill-modal community-sheet cj-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) setOpen(false);
            }}
          >
            {/* Festive top: snow over a rose band, avatars + title */}
            <div className="cj-top">
              <XmasSnow className="cj-snow" density={0.8} max={30} />
              <button type="button" className="cj-x" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
              {avatars.length > 0 && (
                <div className="cj-faces">
                  {avatars.map((src) => (
                    <img key={src} src={src} alt="" loading="lazy" onError={() => setBroken((p) => ({ ...p, [src]: true }))} />
                  ))}
                  <span className="cj-faces-more">5k+</span>
                </div>
              )}
              <h3 className="cj-title">Join our reader community</h3>
              <p className="cj-sub">5,000+ book lovers already get the good stuff first.</p>
            </div>

            <div className="cj-body">
              <span className="cj-cap">What you get</span>
              <ul className="cj-perks">
                <li><span className="cj-perk-ic"><Gift size={16} /></span>₹1 book drops, first</li>
                <li><span className="cj-perk-ic"><Sparkles size={16} /></span>New arrivals &amp; restocks</li>
                <li><span className="cj-perk-ic"><Heart size={16} /></span>Members-only offers</li>
                <li><span className="cj-perk-ic"><MessageCircle size={16} /></span>Bookish chat &amp; picks</li>
              </ul>

              <span className="cj-cap">Pick where to join</span>
              <div className="cj-apps">
                <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="cj-app wa" onClick={() => setOpen(false)}>
                  <span className="cj-app-ic"><FaWhatsapp size={22} /></span>
                  <span className="cj-app-txt">
                    <b>WhatsApp group</b>
                    <small>Drops &amp; offers, straight to chat</small>
                  </span>
                  <ChevronRight size={18} className="cj-app-go" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="cj-app ig" onClick={() => setOpen(false)}>
                  <span className="cj-app-ic"><FaInstagram size={22} /></span>
                  <span className="cj-app-txt">
                    <b>Instagram</b>
                    <small>@thebookx.in · reels &amp; new books</small>
                  </span>
                  <ChevronRight size={18} className="cj-app-go" />
                </a>
              </div>
              <p className="cj-note">
                <BookOpen size={13} /> Free to join · leave anytime · no spam
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {trigger}
      {typeof document !== "undefined" ? createPortal(sheet, document.body) : null}
    </>
  );
}
