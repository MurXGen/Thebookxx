"use client";
import "./ReviewClient.styles.css";

// Review page (festive theme). Sectioned like a Swiggy feedback flow:
//   1 What are you reviewing → 2 Rate it → 3 Tell us more → 4 Reward details
// A sticky bar tracks progress and submits. On submit: confetti, then a
// scratch card. The card holds ₹40–₹47 wallet cashback when the server says
// this phone qualifies (wallet below ₹50, has an order, not claimed before).

import { books } from "@/utils/book";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Star, BookOpen, Store, Mail, Phone, Check, Wallet, ShieldCheck } from "lucide-react";
import ReviewsShowcase from "@/components/ReviewsShowcase";
import ScratchRewardSheet from "@/components/UI/ScratchRewardSheet";
import { XmasSnow, XmasGarland } from "@/components/XmasDecor";
import { getSavedPhone } from "@/utils/userPhone";
import { trackEvent } from "@/lib/ga";
import {
  submitReviewToSheet,
  notifyReviewTelegram,
  isReviewRateLimited,
  recordReviewSubmission,
} from "@/utils/reviewForm";

const RATING_LABEL = ["", "Not good", "Could be better", "It was okay", "Loved it!", "Absolutely loved it! ✨"];
const TAGS = {
  store: ["Fast delivery", "Neat packaging", "Great prices", "Genuine books", "Easy checkout", "Helpful support"],
  book: ["Couldn't put it down", "Life-changing", "Easy to read", "Great print quality", "Worth the price", "Perfect gift"],
};
const MAX_LEN = 500;

function burst(big = true) {
  import("canvas-confetti")
    .then(({ default: confetti }) => {
      const colors = ["#d62828", "#f4c430", "#2a9d5c", "#ffffff"];
      confetti({ particleCount: big ? 140 : 70, spread: 90, startVelocity: 42, origin: { y: 0.65 }, colors, zIndex: 3000 });
      if (big) {
        setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 3000 }), 180);
        setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 3000 }), 320);
      }
    })
    .catch(() => {});
}

// A wrapped present that shakes on its own (lid hops, ribbon + bow).
function GiftBox({ box, ribbon, size = 64, delay = 0, className = "" }) {
  return (
    <span className={`rvx-gift ${className}`} style={{ "--d": `${delay}s`, width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <ellipse cx="32" cy="61" rx="22" ry="3" fill="rgba(0,0,0,.18)" />
        <rect x="9" y="28" width="46" height="32" rx="4" fill={box} />
        <rect x="9" y="28" width="46" height="32" rx="4" fill="url(#rvxShade)" />
        <rect x="28" y="28" width="8" height="32" fill={ribbon} />
        <g className="rvx-gift-lid">
          <rect x="6" y="19" width="52" height="11" rx="3" fill={box} />
          <rect x="6" y="19" width="52" height="11" rx="3" fill="rgba(255,255,255,.18)" />
          <rect x="28" y="19" width="8" height="11" fill={ribbon} />
          <path d="M32 19c-6-11-17-9-14-2 2 4 9 3 14 2z" fill={ribbon} />
          <path d="M32 19c6-11 17-9 14-2-2 4-9 3-14 2z" fill={ribbon} />
          <circle cx="32" cy="18" r="3.2" fill={ribbon} stroke="rgba(0,0,0,.15)" />
        </g>
      </svg>
    </span>
  );
}

function Section({ n, title, sub, done, children }) {
  return (
    <section className={`rvx-sec${done ? " done" : ""}`}>
      <header className="rvx-sec-head">
        <span className="rvx-sec-n">{done ? <Check size={14} strokeWidth={3} /> : n}</span>
        <span className="rvx-sec-t">
          <b>{title}</b>
          {sub && <small>{sub}</small>}
        </span>
      </header>
      {children}
    </section>
  );
}

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("store");
  const [selectedBook, setSelectedBook] = useState("");
  const [review, setReview] = useState("");
  const [tags, setTags] = useState([]);
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // Scratch card: { status: "credited", amount } | { status: "ineligible", reason, balance }
  const [reward, setReward] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scratched, setScratched] = useState(false);

  const selectedBookData = books.find((b) => b.id.trim() === selectedBook.trim());

  useEffect(() => {
    const bookId = searchParams.get("bk");
    if (bookId) {
      setSelectedBook(bookId);
      setActiveTab("book");
    }
  }, [searchParams]);

  useEffect(() => {
    setPhone((p) => p || getSavedPhone());
  }, []);

  const phoneOk = /^\d{10}$/.test(phone);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const step1 = activeTab === "store" || !!selectedBook;
  const step2 = rating > 0;
  const step3 = review.trim().length > 0 || tags.length > 0;
  const step4 = phoneOk || emailOk;
  const doneCount = [step1, step2, step3, step4].filter(Boolean).length;

  const switchTab = (t) => {
    setActiveTab(t);
    setTags([]);
    setMessage("");
  };
  const toggleTag = (t) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const handleSubmit = async () => {
    setMessage("");
    if (!step1) return setMessage("Pick the book you're reviewing.");
    if (!step2) return setMessage("Tap the stars to rate it.");
    if (!step3) return setMessage("Pick a highlight or write a few words.");
    if (!step4) return setMessage("Add your phone number (or email) so we can send your reward.");
    if (isReviewRateLimited()) return setMessage("Too many reviews from this device. Please try again later.");

    setLoading(true);
    const bookName = activeTab === "book" ? selectedBookData?.name || "" : "";
    const text = [tags.length ? `[${tags.join(", ")}]` : "", review.trim()].filter(Boolean).join(" ");
    const type = activeTab === "book" ? "Book" : "Store";
    try {
      await notifyReviewTelegram({
        review: text,
        rating,
        email: email.trim() || null,
        phoneNumber: phone || null,
        bookId: activeTab === "book" ? selectedBook : undefined,
        bookName: bookName || undefined,
        type,
      });
      await submitReviewToSheet({
        type,
        bookName,
        rating,
        review: text,
        email: email.trim(),
        phone,
        timestamp: new Date().toLocaleString("en-IN"),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : "",
      });
      recordReviewSubmission();
      trackEvent("review_submit", { type, rating });
    } catch {
      setLoading(false);
      return setMessage("Something went wrong. Please try again.");
    }

    // The review is in. Now ask the server for this phone's scratch reward.
    let r = { status: "ineligible", reason: "no_phone" };
    if (phoneOk) {
      try {
        const res = await fetch("/api/review-cashback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        r = await res.json();
      } catch {
        r = { status: "error" };
      }
    }
    setLoading(false);
    setReview("");
    setTags([]);
    setRating(0);
    setReward(r);
    setScratched(false);
    burst(true);
    setTimeout(() => setSheetOpen(true), 650);
  };

  const won = reward?.status === "credited";
  // Monthly free-book draw: winners are revealed on the last day of this month.
  const drawDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);
  const loseSub = "You've been added to our monthly free-book draw list";

  // Email for the draw result (saved as a "Draw entry" row in the reviews sheet;
  // it has no review text, so it never shows up as a review on the page).
  const [drawEmail, setDrawEmail] = useState("");
  const [drawSaved, setDrawSaved] = useState(false);
  const [drawBusy, setDrawBusy] = useState(false);
  const drawEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(drawEmail.trim());
  const saveDrawEmail = async () => {
    if (!drawEmailOk || drawBusy) return;
    setDrawBusy(true);
    try {
      await submitReviewToSheet({
        type: "Draw entry",
        email: drawEmail.trim(),
        phone,
        timestamp: new Date().toLocaleString("en-IN"),
      });
      setEmail(drawEmail.trim());
      setDrawSaved(true);
      trackEvent("review_draw_email", {});
    } catch {
      /* best effort */
    } finally {
      setDrawBusy(false);
    }
  };
  const drawNote = (
    <div className="rvx-draw">
      <p>
        🎁 Winners are revealed on <strong>{drawDate}</strong> along with their reward.
      </p>
      {emailOk || drawSaved ? (
        <p className="rvx-draw-ok">
          <Check size={14} strokeWidth={3} /> We&apos;ll email the winning message to <b>{email.trim()}</b>
        </p>
      ) : (
        <>
          <p className="rvx-draw-ask">Add your email so the winning message reaches you:</p>
          <div className="rvx-draw-row">
            <input
              type="email"
              placeholder="you@example.com"
              value={drawEmail}
              onChange={(e) => setDrawEmail(e.target.value)}
              aria-label="Email for the draw result"
            />
            <button type="button" onClick={saveDrawEmail} disabled={!drawEmailOk || drawBusy}>
              {drawBusy ? "Saving…" : "Notify me"}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const StarRow = (
    <div className="rvx-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={rating === s}
          className={`rvx-star${s <= rating ? " on" : ""}`}
          onClick={() => setRating(s)}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          <Star size={34} strokeWidth={1.8} fill={s <= rating ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="rvx">
      {/* ── Hero ── */}
      <header className="rvx-hero">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <linearGradient id="rvxShade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".22" />
              <stop offset="1" stopColor="#000" stopOpacity=".18" />
            </linearGradient>
          </defs>
        </svg>
        <XmasGarland className="rvx-garland" />
        <XmasSnow className="rvx-snow" density={0.7} max={60} />
        <div className="rvx-gifts">
          <GiftBox box="#2a9d5c" ribbon="#f4c430" size={54} delay={0.4} className="g1" />
          <GiftBox box="#ffffff" ribbon="#d62828" size={74} delay={0} className="g2" />
          <GiftBox box="#f4c430" ribbon="#d62828" size={50} delay={0.9} className="g3" />
        </div>
        <span className="rvx-kicker">⭐ Reader reviews</span>
        <h1 className="rvx-title">Share your story, unwrap a gift</h1>
        <p className="rvx-sub">
          Every review gets a <b>scratch card</b> with a surprise reward
        </p>
        <ol className="rvx-steps" aria-label="How it works">
          <li><span>1</span>Rate</li>
          <li><span>2</span>Review</li>
          <li><span>3</span>Scratch &amp; win</li>
        </ol>
      </header>

      <div className="rvx-body">
        <Section n={1} title="What are you reviewing?" done={step1}>
          <div className="rvx-seg" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "store"}
              className={activeTab === "store" ? "on" : ""}
              onClick={() => switchTab("store")}
            >
              <Store size={16} /> TheBookX store
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "book"}
              className={activeTab === "book" ? "on" : ""}
              onClick={() => switchTab("book")}
            >
              <BookOpen size={16} /> A book
            </button>
          </div>
          {activeTab === "book" && (
            <div className="rvx-book">
              <select className="rvx-select" value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} aria-label="Choose a book">
                <option value="">Choose a book…</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {selectedBookData && (
                <div className="rvx-book-card">
                  {selectedBookData.image && (
                    <Image src={selectedBookData.image} alt="" width={46} height={66} className="rvx-book-cover" />
                  )}
                  <span>
                    <b>{selectedBookData.name}</b>
                    <small>by {selectedBookData.author || "Unknown"}</small>
                  </span>
                </div>
              )}
            </div>
          )}
        </Section>

        <Section
          n={2}
          title={activeTab === "book" ? "How was the book?" : "How was your experience?"}
          done={step2}
        >
          {StarRow}
          <p className={`rvx-rate-label${rating ? " on" : ""}`}>{rating ? RATING_LABEL[rating] : "Tap a star to rate"}</p>
        </Section>

        <Section n={3} title="Tell us more" sub="Pick what stood out, add a line if you like" done={step3}>
          <div className="rvx-tags">
            {TAGS[activeTab].map((t) => (
              <button
                key={t}
                type="button"
                className={`rvx-tag${tags.includes(t) ? " on" : ""}`}
                aria-pressed={tags.includes(t)}
                onClick={() => toggleTag(t)}
              >
                {tags.includes(t) && <Check size={13} strokeWidth={3} />}
                {t}
              </button>
            ))}
          </div>
          <div className="rvx-ta-wrap">
            <textarea
              className="rvx-ta"
              rows={4}
              maxLength={MAX_LEN}
              placeholder={activeTab === "book" ? "What did you think of this book?" : "How was your experience with TheBookX?"}
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <span className="rvx-count">
              {review.length}/{MAX_LEN}
            </span>
          </div>
        </Section>

        <Section n={4} title="Where should your reward go?" sub="Cashback lands in the wallet on this number" done={step4}>
          <label className="rvx-input">
            <Phone size={16} />
            <span className="rvx-cc">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            {phoneOk && <Check size={16} className="rvx-ok" strokeWidth={3} />}
          </label>
          <label className="rvx-input">
            <Mail size={16} />
            <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <div className="rvx-perk">
            <Wallet size={16} />
            <span>
              <b>Surprise wallet cashback</b> on your scratch card · plus a chance to win a free book
            </span>
          </div>
        </Section>

        <section className="rvx-showcase">
          <ReviewsShowcase />
        </section>
      </div>

      {/* ── Sticky submit bar ── */}
      <div className="rvx-bar">
        {message ? (
          <p className="rvx-msg" role="alert">{message}</p>
        ) : (
          <div className="rvx-prog" aria-label={`${doneCount} of 4 steps done`}>
            <span className="rvx-prog-track">
              <i style={{ width: `${(doneCount / 4) * 100}%` }} />
            </span>
            <small>
              <ShieldCheck size={12} /> {doneCount}/4 done
            </small>
          </div>
        )}
        <button type="button" className="rvx-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? "Wrapping your gift…" : "Submit & unwrap your gift 🎁"}
        </button>
      </div>

      <ScratchRewardSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        eligible={won}
        reward={reward?.amount || 0}
        scratched={scratched}
        onScratch={() => {
          setScratched(true);
          if (won) burst(true);
        }}
        xmas
        badge="Your scratch card"
        loseTitle="You're in the draw! 🎁"
        loseSub={loseSub}
        wonSub="Cashback added to your TheBookX wallet"
        note={
          won ? (
            <>
              <strong>₹{reward.amount}</strong> is in your wallet now. Use it at checkout within 60 days.
            </>
          ) : (
            drawNote
          )
        }
        onViewProfile={won ? () => router.push("/wallet") : undefined}
        ctaLabel={won ? "View my wallet" : "Done"}
      />
    </div>
  );
}
