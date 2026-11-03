"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Clock,
  RefreshCw,
  Lock,
  Plus,
  BookmarkCheck,
  ShoppingCart,
  Zap,
  Smartphone,
  Layers,
  Bookmark,
  Play,
  ChevronRight,
  Gift,
} from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import {
  quickReadBookIds,
  quickReadFrameCount,
  QUICKREAD_PRICE,
  QUICKREAD_MRP,
  QUICKREAD_FREE_FRAMES,
  SUB_MONTHLY_PRICE,
} from "@/data/quickreadsMeta";
import {
  getQuickReadProfileForPhone,
  checkSubscription,
  getLocalSubscription,
  grantBookAccess,
  getSavedPhone,
  getReadProgress,
  getSavedReads,
} from "@/lib/quickreads";
import QuickReadsReader from "@/components/quickreads/QuickReadsReader";
import QuickReadsPlans from "@/components/quickreads/QuickReadsPlans";
import MobileBottomNav from "@/components/MobileBottomNav";

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((b) => {
    const k = (b?.name || "").trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const BATCH = 8; // lazy-load step for the browse list

// Insights read so far for a book (progress stores the last frame index).
const readCount = (progress, b) => {
  const idx = progress[b.id] || 0;
  const total = quickReadFrameCount(b.id);
  return idx > 0 ? Math.min(idx + 1, total) : 0;
};

export default function MyQuickReadsPage() {
  const router = useRouter();
  const { qrCart, addQuickRead, isInQrCart } = useStore();
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState([]);
  const [pending, setPending] = useState([]);
  const [sub, setSub] = useState({ active: false });
  const [openBook, setOpenBook] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [visible, setVisible] = useState(BATCH); // how many browse cards shown
  const [progress, setProgress] = useState({}); // { [bookId]: lastFrameIndex }
  const [savedCount, setSavedCount] = useState(0);
  const [lapsed, setLapsed] = useState(null);

  const allQr = dedupe(
    quickReadBookIds()
      .map((id) => books.find((b) => b.id === id))
      .filter(Boolean),
  );

  // Reading progress + saved insights live in this browser only.
  const refreshLocal = () => {
    const map = {};
    allQr.forEach((b) => {
      const v = getReadProgress(b.id);
      if (v > 0) map[b.id] = v;
    });
    setProgress(map);
    setSavedCount(getSavedReads().length);
  };

  const load = async (p) => {
    const digits = String(p || "").replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [prof, s] = await Promise.all([
        getQuickReadProfileForPhone(digits),
        checkSubscription(digits),
      ]);
      (prof.verified || []).forEach((id) => grantBookAccess(id, digits));
      setVerified(
        dedupe(
          (prof.verified || [])
            .map((id) => books.find((b) => b.id === id))
            .filter(Boolean),
        ),
      );
      setPending(
        dedupe(
          (prof.pending || [])
            .map((id) => books.find((b) => b.id === id))
            .filter(Boolean),
        ),
      );
      setSub(s || { active: false });
      // A lapsed subscription (cached plan whose period ended) → offer renew.
      const local = getLocalSubscription();
      setLapsed(!s?.active && local && Date.now() >= local.expiresAt ? local : null);
    } catch {}
    refreshLocal();
    setLoading(false);
  };

  useEffect(() => {
    let p = "";
    try {
      p = localStorage.getItem("track_orders_phone") || getSavedPhone() || "";
    } catch {}
    refreshLocal();
    if (p) {
      setPhone(p);
      load(p);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subActive = !!sub?.active;
  const renewalDate = sub?.expiresAt
    ? new Date(sub.expiresAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  const planName = sub?.plan === "yearly" ? "Yearly" : "Monthly";

  const ownedIds = new Set(verified.map((b) => b.id));
  const activeBooks = subActive ? allQr : verified;
  const hasLibrary = subActive || verified.length > 0 || pending.length > 0;

  // Books with reading started but not finished → "Continue reading".
  const inProgress = activeBooks
    .filter((b) => {
      const r = readCount(progress, b);
      return r > 0 && r < quickReadFrameCount(b.id);
    })
    .slice(0, 6);
  const insightsTotal = activeBooks.reduce(
    (s, b) => s + quickReadFrameCount(b.id),
    0,
  );
  const insightsRead = activeBooks.reduce((s, b) => s + readCount(progress, b), 0);
  const avgInsights = allQr.length
    ? Math.round(
        allQr.reduce((s, b) => s + quickReadFrameCount(b.id), 0) / allQr.length,
      )
    : 0;

  // Every QuickRead the shopper hasn't unlocked — browse + add to cart, lazy-loaded.
  const browseAll = allQr.filter((b) => !ownedIds.has(b.id));
  const browse = browseAll.slice(0, visible);
  const hasMore = visible < browseAll.length;

  // Lazy-load more browse cards as the page nears the bottom.
  useEffect(() => {
    if (!hasMore) return;
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400;
      if (nearBottom) setVisible((v) => Math.min(v + BATCH, browseAll.length));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasMore, browseAll.length]);

  const submitPhone = () => {
    const d = phoneInput.replace(/\D/g, "").slice(0, 10);
    if (d.length !== 10) return;
    setPhone(d);
    try {
      localStorage.setItem("track_orders_phone", d);
    } catch {}
    load(d);
  };

  const scrollToBrowse = () =>
    document
      .getElementById("mqr-browse")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const Card = ({ b, owned }) => {
    const inCart = isInQrCart(b.id);
    const total = quickReadFrameCount(b.id);
    const done = owned ? readCount(progress, b) : 0;
    return (
      <div className="mqr-card">
        <button
          type="button"
          className="mqr-card-open"
          onClick={() => setOpenBook(b)}
        >
          <span className="mqr-cover">
            {b.image ? (
              <img src={b.image} alt={b.name} loading="lazy" />
            ) : (
              <BookOpen size={22} />
            )}
          </span>
          <span className="mqr-card-body">
            <span className="mqr-card-name">{b.name}</span>
            <span className="mqr-card-meta">
              {owned ? (
                done > 0 ? (
                  <>
                    {done}/{total} insights read
                  </>
                ) : (
                  <>
                    <Crown size={12} /> {total} insights · Unlocked
                  </>
                )
              ) : (
                <>
                  {total} insights · ₹{QUICKREAD_PRICE}
                </>
              )}
            </span>
            {owned && done > 0 && (
              <span className="mqx-bar" aria-hidden="true">
                <span style={{ width: `${Math.round((done / total) * 100)}%` }} />
              </span>
            )}
          </span>
        </button>
        {owned ? (
          <button
            type="button"
            className="mqr-card-cta read"
            onClick={() => setOpenBook(b)}
          >
            {done > 0 && done < total ? "Resume" : "Read"}
          </button>
        ) : inCart ? (
          <Link href="/bag?tab=quickreads" className="mqr-card-cta incart">
            <BookmarkCheck size={14} /> In bag
          </Link>
        ) : (
          <button
            type="button"
            className="mqr-card-cta"
            onClick={() => {
              addQuickRead(b.id);
              showToast("Added to your bag 🎉", "success");
            }}
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>
    );
  };

  // Intro for shoppers who don't own any QuickReads yet.
  const renderHero = () => (
    <section className="mqx-hero" aria-labelledby="mqx-hero-title">
      <div className="mqx-hero-covers" aria-hidden="true">
        {allQr.slice(0, 5).map((b, i) => (
          <span key={b.id} className={`mqx-hero-cover c${i}`}>
            {b.image && <img src={b.image} alt="" />}
          </span>
        ))}
      </div>
      <span className="mqx-kicker">
        <Zap size={13} /> QuickReads by TheBookX
      </span>
      <h2 id="mqx-hero-title" className="mqx-hero-title">
        The big ideas of a book, in minutes
      </h2>
      <p className="mqx-hero-sub">
        Each QuickRead turns a bestseller into short insight cards: the key
        lessons, frameworks and takeaways, ready to read on your phone.
      </p>
      <div className="mqx-facts">
        <span>
          <b>{allQr.length}</b> books
        </span>
        <span>
          <b>~{avgInsights}</b> insights each
        </span>
        <span>
          <b>₹{QUICKREAD_PRICE}</b> <s>₹{QUICKREAD_MRP}</s> per book
        </span>
      </div>
      <div className="mqx-hero-ctas">
        <button type="button" className="pri-big-btn" onClick={scrollToBrowse}>
          Browse QuickReads <ChevronRight size={18} />
        </button>
        <button
          type="button"
          className="mqx-ghost"
          onClick={() => setShowPlans(true)}
        >
          <Crown size={16} /> Unlimited · ₹{SUB_MONTHLY_PRICE}/mo
        </button>
      </div>
      <ol className="mqx-steps">
        <li>
          <span className="mqx-step-ic">
            <Layers size={16} />
          </span>
          <span>
            <b>Pick a book</b>
            <small>First {QUICKREAD_FREE_FRAMES} insights are free to try</small>
          </span>
        </li>
        <li>
          <span className="mqx-step-ic">
            <Gift size={16} />
          </span>
          <span>
            <b>Unlock it for ₹{QUICKREAD_PRICE}</b>
            <small>Or read every book with Unlimited</small>
          </span>
        </li>
        <li>
          <span className="mqx-step-ic">
            <Smartphone size={16} />
          </span>
          <span>
            <b>Read anytime</b>
            <small>Pick up where you left off, save the best insights</small>
          </span>
        </li>
      </ol>
    </section>
  );

  const renderPhoneLookup = () => (
    <div className="mqr-login mqx-lookup">
      <p className="mqr-login-lbl">
        Already bought QuickReads? Enter the number you used
      </p>
      <div className="mqr-login-row">
        <span className="rapido-cc">+91</span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          className="phone-card-input"
          placeholder="10-digit mobile number"
          value={phoneInput}
          onChange={(e) =>
            setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          onKeyDown={(e) => e.key === "Enter" && submitPhone()}
        />
      </div>
      <button
        type="button"
        className="pri-big-btn"
        disabled={phoneInput.length !== 10}
        onClick={submitPhone}
      >
        View my library
      </button>
    </div>
  );

  return (
    <main className="mqr-page">
      <header className="ord-head">
        <button
          type="button"
          className="ord-back"
          onClick={() => router.push("/")}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ord-head-titles">
          <h1 className="ord-head-title">My QuickReads</h1>
        </div>
      </header>

      {loading ? (
        <div className="mqr-loading">
          <RefreshCw size={18} className="cpo-spin" /> Loading your library…
        </div>
      ) : !hasLibrary ? (
        <>
          {renderHero()}
          {!phone && renderPhoneLookup()}
          {lapsed && (
            <div className="mqr-sub-banner lapsed">
              <span className="mqr-sub-ic">
                <Lock size={18} />
              </span>
              <div className="mqr-sub-txt">
                <strong>Your Unlimited plan expired</strong>
                <small>Renew to unlock every QuickRead again.</small>
              </div>
              <button
                type="button"
                className="mqr-sub-renew"
                onClick={() => setShowPlans(true)}
              >
                Renew
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Plan status */}
          {subActive ? (
            <div className="mqx-plan">
              <span className="mqx-plan-ic">
                <Crown size={20} />
              </span>
              <span className="mqx-plan-txt">
                <span className="mqx-plan-tag">Active</span>
                <strong>Unlimited · {planName}</strong>
                <small>
                  All {allQr.length} QuickReads unlocked
                  {renewalDate ? ` · Valid till ${renewalDate}` : ""}
                </small>
              </span>
            </div>
          ) : lapsed ? (
            <div className="mqr-sub-banner lapsed">
              <span className="mqr-sub-ic">
                <Lock size={18} />
              </span>
              <div className="mqr-sub-txt">
                <strong>Your Unlimited plan expired</strong>
                <small>Renew to unlock every QuickRead again.</small>
              </div>
              <button
                type="button"
                className="mqr-sub-renew"
                onClick={() => setShowPlans(true)}
              >
                Renew
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mqr-go-unlimited"
              onClick={() => setShowPlans(true)}
            >
              <Crown size={16} /> Go Unlimited · read every book for ₹
              {SUB_MONTHLY_PRICE}/mo
            </button>
          )}

          {/* At a glance */}
          <div className="mqx-stats">
            <span>
              <b>{activeBooks.length}</b>
              <small>{subActive ? "Books unlocked" : "Books owned"}</small>
            </span>
            <span>
              <b>{insightsTotal}</b>
              <small>Insights unlocked</small>
            </span>
            <span>
              <b>{insightsRead}</b>
              <small>Insights read</small>
            </span>
            <span>
              <b>{savedCount}</b>
              <small>
                <Bookmark size={10} /> Saved
              </small>
            </span>
          </div>

          {/* Continue reading */}
          {inProgress.length > 0 && (
            <section className="mqr-section">
              <h2 className="mqr-section-title">Continue reading</h2>
              <div className="mqx-resume-row">
                {inProgress.map((b) => {
                  const total = quickReadFrameCount(b.id);
                  const done = readCount(progress, b);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className="mqx-resume"
                      onClick={() => setOpenBook(b)}
                    >
                      <span className="mqx-resume-cover">
                        {b.image ? (
                          <img src={b.image} alt="" loading="lazy" />
                        ) : (
                          <BookOpen size={20} />
                        )}
                        <span className="mqx-resume-play">
                          <Play size={14} />
                        </span>
                      </span>
                      <span className="mqx-resume-name">{b.name}</span>
                      <span className="mqx-bar" aria-hidden="true">
                        <span
                          style={{ width: `${Math.round((done / total) * 100)}%` }}
                        />
                      </span>
                      <span className="mqx-resume-meta">
                        {done}/{total} insights
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Library */}
          <section className="mqr-section">
            <h2 className="mqr-section-title">
              {subActive ? "All QuickReads (Unlimited)" : "Your library"}
            </h2>
            {activeBooks.length === 0 ? (
              <p className="mqr-empty">
                Your QuickReads appear here as soon as your payment is confirmed.
              </p>
            ) : (
              <div className="mqr-grid">
                {activeBooks.map((b) => (
                  <Card key={b.id} b={b} owned />
                ))}
              </div>
            )}
          </section>

          {/* Awaiting verification */}
          {pending.length > 0 && (
            <section className="mqr-section">
              <h2 className="mqr-section-title">
                <Clock size={14} /> Awaiting confirmation
              </h2>
              <div className="mqr-grid">
                {pending.map((b) => (
                  <Card key={b.id} b={b} owned={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Browse every QuickRead — add to cart (lazy-loaded) */}
      {!loading && !subActive && browseAll.length > 0 && (
        <section className="mqr-section" id="mqr-browse">
          <h2 className="mqr-section-title">
            {hasLibrary ? "More QuickReads" : "All QuickReads"}
          </h2>
          <p className="mqx-browse-note">
            Tap any book to read its first {QUICKREAD_FREE_FRAMES} insights free.
          </p>
          <div className="mqr-grid">
            {browse.map((b) => (
              <Card key={b.id} b={b} owned={false} />
            ))}
          </div>
          {hasMore && (
            <div className="mqr-more">
              <RefreshCw size={15} className="cpo-spin" /> Loading more…
            </div>
          )}
        </section>
      )}

      {/* Sticky checkout bar — matches the main cart checkout bottom bar */}
      {qrCart.length > 0 && (
        <div className="cart-bar">
          <div className="cart-bar-main flex flex-row gap-12">
            <div className="flex flex-col width100 gap-4">
              <div className="flex flex-row justify-between items-center">
                <span className="font-14">Total amount</span>
                <span className="final weight-600">
                  ₹{qrCart.length * QUICKREAD_PRICE}
                </span>
              </div>
              <span className="font-12 green weight-600">
                {qrCart.length} QuickRead{qrCart.length === 1 ? "" : "s"} in bag
              </span>
            </div>
            <button
              type="button"
              className="pri-big-btn"
              onClick={() => router.push("/bag?tab=quickreads")}
            >
              <ShoppingCart size={16} /> Checkout
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {openBook && (
          <QuickReadsReader
            book={openBook}
            resume
            onClose={() => {
              setOpenBook(null);
              refreshLocal();
              if (phone) load(phone);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlans && (
          <QuickReadsPlans
            book={allQr[0] || null}
            variant="sheet"
            onClose={() => setShowPlans(false)}
            onSinglePaid={() => {
              setShowPlans(false);
              if (phone) load(phone);
            }}
            onSubscribed={() => {
              setShowPlans(false);
              if (phone) load(phone);
            }}
          />
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </main>
  );
}
