"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Clock } from "lucide-react";
import { books } from "@/utils/book";
import {
  getQuickReadProfileForPhone,
  grantBookAccess,
} from "@/lib/quickreads";
import { quickReadFrameCount } from "@/data/quickreads";
import QuickReadsReader from "./QuickReadsReader";

// Shows the QuickReads a phone number has (read from the sheet, so it works
// across devices). Verified books are unlocked to read; ordered-but-unverified
// books show as "awaiting confirmation". Also surfaces the customer's name from
// the QuickReads sheet (via onName) so the profile can greet a QuickReads-only
// user who has no physical-book orders. Renders nothing when there are none.
export default function ProfileQuickReads({ phone, onLoaded, onName }) {
  const [verifiedBooks, setVerifiedBooks] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [openBook, setOpenBook] = useState(null);

  useEffect(() => {
    let active = true;
    const digits = String(phone || "").replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setVerifiedBooks([]);
      setPendingBooks([]);
      return;
    }
    (async () => {
      const { name, verified, pending } =
        await getQuickReadProfileForPhone(digits);
      if (!active) return;
      // Unlock verified ones locally so the reader opens instantly.
      verified.forEach((id) => grantBookAccess(id, digits));
      const vList = verified
        .map((id) => books.find((b) => b.id === id))
        .filter(Boolean);
      const pList = pending
        .map((id) => books.find((b) => b.id === id))
        .filter(Boolean);
      setVerifiedBooks(vList);
      setPendingBooks(pList);
      if (name) onName?.(name);
      onLoaded?.(vList.length + pList.length);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const total = verifiedBooks.length + pendingBooks.length;
  if (!total) return null;

  return (
    <div className="qr-bag-block" style={{ margin: 0 }}>
      <div className="qr-bag-block-head">
        <span className="qr-bag-block-title">
          <Sparkles size={14} /> Your QuickReads
        </span>
        <span className="qr-bag-block-count">{total}</span>
      </div>
      <div className="qr-library-list">
        {verifiedBooks.map((b) => (
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

        {pendingBooks.map((b) => (
          <div key={b.id} className="qr-lib-card qr-lib-card-pending">
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
              <span className="qr-lib-meta qr-lib-meta-pending">
                <Clock size={12} /> Awaiting payment confirmation
              </span>
            </div>
            <button
              type="button"
              className="qr-lib-read qr-lib-read-preview"
              onClick={() => setOpenBook(b)}
            >
              <BookOpen size={15} /> Preview
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
