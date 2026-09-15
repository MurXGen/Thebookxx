"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, ChevronRight, Heart } from "lucide-react";
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

// Icon-only trigger that opens a bottom sheet to join the community on
// Instagram or the WhatsApp group. Reuses the existing .community-* styles.
export default function CommunityJoin({ className = "", variant = "icon" }) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState({});
  const avatars = COMMUNITY_AVATARS.filter((s) => !broken[s]);

  return (
    <>
      {variant === "card" ? (
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
                onError={() =>
                  setBroken((prev) => ({ ...prev, [src]: true }))
                }
              />
            ))}
          </span>
          <ChevronRight size={18} className="cct-arrow" />
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
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal community-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 700)
                  setOpen(false);
              }}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Join our community</span>
                <span className="cursor-pointer" onClick={() => setOpen(false)}>
                  <X size={18} />
                </span>
              </div>

              {avatars.length > 0 && (
                <div className="community-avatars">
                  {avatars.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="community-avatar"
                      loading="lazy"
                      onError={() =>
                        setBroken((prev) => ({ ...prev, [src]: true }))
                      }
                    />
                  ))}
                  <span className="community-avatars-note">
                    Join 5,000+ book lovers
                  </span>
                </div>
              )}

              <p className="community-sub">
                Be first to know about ₹1 drops, new arrivals and exclusive
                offers. Pick where you&rsquo;d like to join us.
              </p>

              <div className="community-actions">
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-btn wa"
                  onClick={() => setOpen(false)}
                >
                  <FaWhatsapp size={20} />
                  <span>Join WhatsApp group</span>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-btn ig"
                  onClick={() => setOpen(false)}
                >
                  <FaInstagram size={20} />
                  <span>Follow on Instagram</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
