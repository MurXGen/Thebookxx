"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  Download,
  ChevronLeft,
  ChevronRight,
  Lock,
  Crown,
  Trash2,
  Volume2,
  Square,
  RotateCcw,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { getQuickRead, QUICKREAD_FREE_FRAMES, QUICKREAD_PRICE } from "@/data/quickreads";
import { showToast } from "@/context/ToastContext";
import {
  getSavedReads,
  toggleSavedRead,
  isBookUnlocked,
  buildQuickReadImage,
  checkApproval,
  grantBookAccess,
  revokeBookAccess,
  getSavedPhone,
  getReadProgress,
  setReadProgress,
} from "@/lib/quickreads";
import QuickReadsCheckout from "./QuickReadsCheckout";

export default function QuickReadsReader({
  book,
  onClose,
  onUnlock,
  startIndex = 0,
  resume = false,
}) {
  const data = book ? getQuickRead(book.id) : null;
  const frames = data?.frames || [];
  const total = frames.length;

  // Resume where they left off unless an explicit start frame was requested.
  const initialIndex = resume
    ? Math.min(getReadProgress(book?.id), Math.max(0, total - 1))
    : startIndex || 0;
  const [index, setIndex] = useState(initialIndex);
  const [dir, setDir] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [saved, setSaved] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(false);
  const movedRef = useRef(false); // true after a drag, to suppress the tap
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const validatingRef = useRef(false);
  const voicesRef = useRef([]);
  useEffect(() => setMounted(true), []);

  // Load and keep the list of available speech voices (they populate async).
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices() || [];
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Verify access against the QuickReads sheet. This is authoritative: it will
  // GRANT if the sheet shows the payment verified, and REVOKE if the row is
  // gone / still unverified — so removing "unverified" in the sheet re-locks.
  const verifyApproval = async () => {
    if (!book?.id) return;
    const phone = getSavedPhone();
    if (!phone) {
      setUnlocked(isBookUnlocked(book.id));
      return;
    }
    if (validatingRef.current) return;
    validatingRef.current = true;
    try {
      const status = await checkApproval(phone, book.id);
      if (status === "approved") {
        grantBookAccess(book.id, phone);
        setUnlocked(true);
      } else if (status === "pending" || status === "none") {
        // Sheet no longer confirms this book → pull access back.
        revokeBookAccess(book.id);
        setUnlocked(false);
      }
      // "error" (network) → leave the current state untouched.
    } finally {
      validatingRef.current = false;
    }
  };

  useEffect(() => {
    setUnlocked(isBookUnlocked(book?.id));
    setSaved(getSavedReads());
    verifyApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  // Re-check when the tab regains focus (e.g. after you change the sheet).
  useEffect(() => {
    const onFocus = () => verifyApproval();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  // Whenever the reader enters locked territory (past the free frames),
  // re-validate against the sheet — grants or revokes as appropriate.
  useEffect(() => {
    if (index >= QUICKREAD_FREE_FRAMES) verifyApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Paywall CTA — unlock if approved, else guide to checkout.
  const handleUnlockAttempt = async () => {
    const phone = getSavedPhone();
    if (phone) {
      const status = await checkApproval(phone, book.id);
      if (status === "approved") {
        grantBookAccess(book.id, phone);
        setUnlocked(true);
        return;
      }
      if (status === "pending") {
        showToast(
          "Payment received — your access unlocks once verified.",
          "info",
        );
        return;
      }
      if (status === "error") {
        showToast("Couldn't check right now. Please try again.", "error");
        return;
      }
    }
    setShowCheckout(true);
  };

  const locked = (i) => !unlocked && i >= QUICKREAD_FREE_FRAMES;
  const current = frames[index];
  const isLockedFrame = locked(index);

  const go = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= total) return;
    setDir(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
  };

  const savedCount = saved.length;
  const currentSaved =
    current && isSavedFrame(saved, book?.id, current.id);

  const handleSave = () => {
    if (!current) return;
    if (isLockedFrame) {
      handleUnlockAttempt();
      return;
    }
    const next = toggleSavedRead({
      bookId: book.id,
      bookName: book.name,
      frameId: current.id,
      title: current.title,
      content: current.content,
    });
    setSaved(next);
  };

  const handleDownload = async () => {
    if (!current) return;
    if (isLockedFrame) {
      handleUnlockAttempt();
      return;
    }
    try {
      await buildQuickReadImage({
        bookName: book.name,
        cover: book.image,
        title: current.title,
        content: current.content,
      });
    } catch (e) {
      console.error("QuickRead download failed", e);
      showToast("Couldn't generate image. Try again.", "error");
    }
  };

  // Share the link to this QuickRead (the /quickreads/<slug> page).
  const handleShare = async () => {
    const slug = (book.name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://www.thebookx.in";
    const url = `${origin}/quickreads/${slug}`;
    const shareData = {
      title: `${book.name} QuickReads — TheBookX`,
      text: `Read the key insights from ${book.name} in minutes on TheBookX QuickReads.`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard", "success");
      }
    } catch {
      /* user dismissed */
    }
  };

  // Pick a warm, clear female English voice from whatever the device offers.
  const pickFemaleVoice = () => {
    const voices =
      voicesRef.current.length
        ? voicesRef.current
        : window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    const find = (needle) =>
      voices.find((v) => v.name.toLowerCase().includes(needle));
    // Ordered by how pleasant/natural they tend to sound, female first.
    const preferred = [
      "google uk english female",
      "google us english", // Google's default US voice is female
      "samantha", // Apple, warm female
      "karen",
      "tessa",
      "victoria",
      "moira",
      "fiona",
      "microsoft aria",
      "microsoft zira",
      "microsoft jenny",
      "female",
    ];
    for (const p of preferred) {
      const v = find(p);
      if (v) return v;
    }
    // Prefer an Indian-English voice next, then any English voice.
    return (
      voices.find((v) => /en[-_]in/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      voices[0] ||
      null
    );
  };

  // Clean text so it's pronounced naturally (₹ → rupees, drop dashes/asterisks).
  const speechText = (frame) => {
    if (!frame) return "";
    return `${frame.title}. ${frame.content}`
      .replace(/₹\s?(\d[\d,]*)/g, "$1 rupees")
      .replace(/\s[—–-]\s/g, ", ") // spaced dashes → pause
      .replace(/[—–]/g, ", ")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Low-level: speak a string with the chosen voice; onEnd fires when done.
  const speakText = (text, onEnd) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return false;
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickFemaleVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang || "en-US";
    utter.rate = 0.95; // a touch slower = clearer
    utter.pitch = 1.25; // slightly higher = softer, cuter
    utter.volume = 1;
    utter.onend = () => onEnd && onEnd();
    utter.onerror = () => onEnd && onEnd();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    return true;
  };

  const stopAllSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    autoPlayRef.current = false;
    setAutoPlay(false);
    setSpeaking(false);
  };

  // Read ONLY the current frame aloud. Tap again to stop.
  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      showToast("Text-to-speech isn't supported on this device.", "info");
      return;
    }
    if (isLockedFrame) {
      handleUnlockAttempt();
      return;
    }
    if (speaking || autoPlay) {
      stopAllSpeech();
      return;
    }
    if (!current) return;
    setSpeaking(true);
    speakText(speechText(current), () => setSpeaking(false));
  };

  // Play every frame back-to-back, auto-advancing until the paywall / last frame.
  const toggleAutoPlay = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      showToast("Text-to-speech isn't supported on this device.", "info");
      return;
    }
    if (isLockedFrame) {
      handleUnlockAttempt();
      return;
    }
    if (autoPlayRef.current) {
      stopAllSpeech();
      return;
    }
    autoPlayRef.current = true;
    setAutoPlay(true);
  };

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      try {
        localStorage.setItem("qr_dark", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  // Restore the saved dark-mode preference on open.
  useEffect(() => {
    try {
      setDark(localStorage.getItem("qr_dark") === "1");
    } catch {}
  }, []);

  // Stop any narration when the frame changes, and remember reading progress.
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    if (book?.id) setReadProgress(book.id, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Drive auto-play: speak the current frame, then advance when it finishes.
  useEffect(() => {
    if (!autoPlay) return;
    if (!current || isLockedFrame) {
      stopAllSpeech();
      return;
    }
    setSpeaking(true);
    speakText(speechText(current), () => {
      setSpeaking(false);
      if (!autoPlayRef.current) return;
      if (index < total - 1 && !locked(index + 1)) {
        go(index + 1);
      } else {
        autoPlayRef.current = false;
        setAutoPlay(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoPlay]);

  useEffect(() => {
    return () => {
      autoPlayRef.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (showSaved) return;
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, showSaved]);

  if (!book || !data) return null;

  // Quick, clean horizontal slide in/out — no tilt, no bounce.
  const variants = {
    enter: (d) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -70 : 70, opacity: 0 }),
  };

  if (!mounted) return null;

  return createPortal(
    <>
    <motion.div
      className={`qr-overlay${dark ? " qr-dark" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="qr-modal"
        initial={{ scale: 0.92, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="qr-head">
          <button className="qr-icon-btn" onClick={onClose} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="qr-head-title">
            <span className="qr-head-name">{book.name}</span>
            {unlocked ? (
              <span className="qr-premium-badge">
                <Crown size={11} /> Premium access
              </span>
            ) : (
              <span className="qr-head-sub">QuickReads by TheBookX</span>
            )}
          </div>
          <div className="qr-head-actions">
            <button
              className="qr-icon-btn"
              onClick={toggleDark}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="qr-icon-btn" onClick={handleShare} aria-label="Share">
              <Share2 size={18} />
            </button>
            <button
              className="qr-icon-btn qr-saved-btn"
              onClick={() => setShowSaved(true)}
              aria-label="Saved reads"
            >
              <Bookmark size={18} />
              {savedCount > 0 && (
                <span className="qr-saved-count">{savedCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Reading area */}
        <div className="qr-body">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={index}
              className={`qr-card${isLockedFrame ? " locked" : ""}`}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragStart={() => {
                movedRef.current = false;
              }}
              onDrag={(e, info) => {
                if (Math.abs(info.offset.x) > 6) movedRef.current = true;
              }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -60) go(index + 1);
                else if (info.offset.x > 60) go(index - 1);
              }}
              onClick={(e) => {
                // Ignore the click that follows a drag/swipe.
                if (movedRef.current) {
                  movedRef.current = false;
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) go(index - 1);
                else go(index + 1);
              }}
            >
              <span className="qr-card-kicker">
                Insight {index + 1}
              </span>
              {isLockedFrame ? (
                <>
                  <h3 className="qr-card-title">Premium insight locked</h3>
                  <p className="qr-card-text">
                    Unlock QuickReads to continue reading all {total} insights
                    from {book.name}.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="qr-card-title">{current.title}</h3>
                  <p className="qr-card-text">{current.content}</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Paywall overlay */}
          {isLockedFrame && (
            <motion.div
              className="qr-paywall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="qr-lock-ic">
                <Lock size={26} />
              </div>
              <h4 className="qr-paywall-title">
                You&apos;ve unlocked the first {QUICKREAD_FREE_FRAMES} QuickReads!
              </h4>
              <p className="qr-paywall-sub">
                Continue reading the remaining {total - QUICKREAD_FREE_FRAMES}{" "}
                insights from {book.name}. Unlock the complete QuickReads
                experience for just ₹{QUICKREAD_PRICE}.
              </p>
              <button className="qr-unlock-btn" onClick={handleUnlockAttempt}>
                Unlock QuickReads – ₹{QUICKREAD_PRICE}
              </button>
            </motion.div>
          )}
        </div>

        {/* Action buttons */}
        <div className="qr-actions">
          <button className="qr-action" onClick={handleDownload}>
            <Download size={16} /> Download
          </button>
          <button
            className={`qr-action${currentSaved ? " on" : ""}`}
            onClick={handleSave}
          >
            {currentSaved ? (
              <>
                <BookmarkCheck size={16} /> Saved
              </>
            ) : (
              <>
                <Bookmark size={16} /> Save
              </>
            )}
          </button>
          <button
            className={`qr-action qr-action-icon${autoPlay ? " on" : ""}`}
            onClick={toggleAutoPlay}
            aria-label={autoPlay ? "Stop reading" : "Read all insights aloud"}
            title={autoPlay ? "Stop reading" : "Listen — read each insight aloud"}
          >
            {autoPlay ? <Square size={16} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="qr-nav">
          <button
            className="qr-nav-btn"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="qr-nav-pos">
            {index + 1} / {total}
          </span>
          <button
            className="qr-nav-btn"
            onClick={() => go(index + 1)}
            disabled={index >= total - 1}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
          <button
            className="qr-nav-btn qr-nav-restart"
            onClick={() => go(0)}
            disabled={index === 0}
            aria-label="Restart from the first insight"
            title="Restart"
          >
            <RotateCcw size={17} />
          </button>
        </div>

        {/* Saved Reads sheet */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              className="qr-saved-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <div className="qr-saved-head">
                <span className="weight-700 font-16">
                  Saved reads ({savedCount})
                </span>
                <button
                  className="qr-icon-btn"
                  onClick={() => setShowSaved(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="qr-saved-list">
                {saved.length === 0 && (
                  <p className="qr-saved-empty">
                    No saved reads yet. Tap “Save” on any insight to keep it here.
                  </p>
                )}
                {saved.map((s) => (
                  <div key={`${s.bookId}-${s.frameId}`} className="qr-saved-item">
                    <div className="qr-saved-item-main">
                      <span className="qr-saved-item-title">{s.title}</span>
                      <span className="qr-saved-item-text">{s.content}</span>
                      <span className="qr-saved-item-book">{s.bookName}</span>
                    </div>
                    <button
                      className="qr-saved-del"
                      onClick={() => setSaved(toggleSavedRead(s))}
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>

      <AnimatePresence>
        {showCheckout && (
          <QuickReadsCheckout
            items={[book]}
            variant="sheet"
            onClose={() => setShowCheckout(false)}
            onPaid={() => {
              setUnlocked(true);
            }}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}

function isSavedFrame(list, bookId, frameId) {
  return list.some((s) => s.bookId === bookId && s.frameId === frameId);
}
