"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Share2 } from "lucide-react";

const SUPPORT_WHATSAPP = "917710892108";

/**
 * Floating WhatsApp button on the book page (phones only — it sits inside the
 * sticky bottom bar, just above "Add to Cart"). Opens a chat with a pre-filled
 * message asking for the best price / any extra offer on this book.
 * A small "Ask for a better price" hint shows briefly, then tucks away.
 */
export default function PdpWhatsApp({ book, price, mrp, liked = false, heart = null, onLike, onShare }) {
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setHint(true), 1200);
    const hide = setTimeout(() => setHint(false), 5200); // visible for 4s
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (!book?.name) return null;

  const open = () => {
    const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    const priceLine = price
      ? ` It's showing ₹${price}${mrp > price ? ` (MRP ₹${mrp})` : ""}.`
      : "";
    const msg =
      `Hi TheBookX! 👋 I'm about to order "${book.name}"${book.author ? ` by ${book.author}` : ""}.${priceLine}\n\n` +
      `Before I place it — is there any extra discount, combo deal or freebie I can still get on this today? ` +
      `I don't want to miss the best price 🙏` +
      (url ? `\n\n${url}` : "");
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pdp-wa">
      <span className={`wa-tip pdp-wa-tip${hint ? " show" : ""}`} role="tooltip">
        <FaWhatsapp size={18} />
        <span>
          Ask us for a better price
          <small>Extra discounts &amp; combo deals on WhatsApp</small>
        </span>
      </span>
      {/* Wishlist, share and WhatsApp stacked in one small pill */}
      <div className="pdp-dock">
        {onLike && (
          <button
            type="button"
            className={`pdp-dock-btn${liked ? " on" : ""}`}
            onClick={onLike}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            {heart}
          </button>
        )}
        {onShare && (
          <button type="button" className="pdp-dock-btn" onClick={onShare} aria-label="Share book">
            <Share2 size={18} />
          </button>
        )}
        <button
          type="button"
          className="pdp-dock-btn wa"
          onClick={open}
          aria-label={`Ask on WhatsApp for the best price on ${book.name}`}
        >
          <FaWhatsapp size={20} />
        </button>
      </div>
    </div>
  );
}
