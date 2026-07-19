"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";
import { books } from "@/utils/book";
import {
  getVerifiedBookIdsForPhone,
  grantBookAccess,
} from "@/lib/quickreads";
import { quickReadFrameCount } from "@/data/quickreads";
import QuickReadsReader from "./QuickReadsReader";

// Shows the QuickReads a phone number has purchased (read from the sheet, so it
// works across devices). Grants local access so the reader unlocks instantly.
// Renders nothing when the number has no QuickReads.
export default function ProfileQuickReads({ phone, onLoaded }) {
  const [libBooks, setLibBooks] = useState([]);
  const [openBook, setOpenBook] = useState(null);

  useEffect(() => {
    let active = true;
    const digits = String(phone || "").replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setLibBooks([]);
      return;
    }
    (async () => {
      const ids = await getVerifiedBookIdsForPhone(digits);
      if (!active) return;
      ids.forEach((id) => grantBookAccess(id, digits));
      const list = ids
        .map((id) => books.find((b) => b.id === id))
        .filter(Boolean);
      setLibBooks(list);
      onLoaded?.(list.length);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  if (!libBooks.length) return null;

  return (
    <div className="qr-bag-block" style={{ margin: 0 }}>
      <div className="qr-bag-block-head">
        <span className="qr-bag-block-title">
          <Sparkles size={14} /> Your QuickReads
        </span>
        <span className="qr-bag-block-count">{libBooks.length}</span>
      </div>
      <div className="qr-library-list">
        {libBooks.map((b) => (
          <div key={b.id} className="qr-lib-card">
            <div className="cart-row-cover">
              {b.image ? (
                <img
                  src={b.image}
                  alt={b.name}
                  className="cart-row-img"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <BookOpen size={20} />
              )}
            </div>
            <div className="qr-lib-body">
              <span className="cart-row-title">{b.name}</span>
              <span className="qr-lib-meta">
                {quickReadFrameCount(b.id)} insights · Unlocked
              </span>
            </div>
            <button
              type="button"
              className="qr-lib-read"
              onClick={() => setOpenBook(b)}
            >
              <BookOpen size={15} /> Read
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {openBook && (
          <QuickReadsReader
            book={openBook}
            resume
            onClose={() => setOpenBook(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
