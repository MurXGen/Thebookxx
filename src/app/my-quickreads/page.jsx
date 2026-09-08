"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Crown,
  Clock,
  RefreshCw,
  Lock,
} from "lucide-react";
import { books } from "@/utils/book";
import { quickReadBookIds, quickReadFrameCount } from "@/data/quickreadsMeta";
import {
  getQuickReadProfileForPhone,
  checkSubscription,
  getLocalSubscription,
  grantBookAccess,
  getSavedPhone,
} from "@/lib/quickreads";
import QuickReadsReader from "@/components/quickreads/QuickReadsReader";
import QuickReadsPlans from "@/components/quickreads/QuickReadsPlans";

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((b) => {
    const k = (b?.name || "").trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export default function MyQuickReadsPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState([]);
  const [pending, setPending] = useState([]);
  const [sub, setSub] = useState({ active: false });
  const [openBook, setOpenBook] = useState(null);
  const [showPlans, setShowPlans] = useState(false);

  const allQr = dedupe(
    quickReadBookIds()
      .map((id) => books.find((b) => b.id === id))
      .filter(Boolean),
  );

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
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    let p = "";
    try {
      p = localStorage.getItem("track_orders_phone") || getSavedPhone() || "";
    } catch {}
    if (p) {
      setPhone(p);
      load(p);
    } else {
      setLoading(false);
    }
  }, []);

  const subActive = !!sub?.active;
  const renewalDate = sub?.expiresAt
    ? new Date(sub.expiresAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  // A lapsed subscription (cached plan whose period ended) → offer renew.
  const lapsed = (() => {
    if (subActive) return null;
    const s = getLocalSubscription();
    return s && Date.now() >= s.expiresAt ? s : null;
  })();

  const ownedIds = new Set(verified.map((b) => b.id));
  const activeBooks = subActive ? allQr : verified;
  const youMayLike = allQr.filter((b) => !ownedIds.has(b.id)).slice(0, 6);

  const submitPhone = () => {
    const d = phoneInput.replace(/\D/g, "").slice(0, 10);
    if (d.length !== 10) return;
    setPhone(d);
    try {
      localStorage.setItem("track_orders_phone", d);
    } catch {}
    load(d);
  };

  const Card = ({ b, owned }) => (
    <button type="button" className="mqr-card" onClick={() => setOpenBook(b)}>
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
            <>
              <Crown size={12} /> {quickReadFrameCount(b.id)} insights · Unlocked
            </>
          ) : (
            <>{quickReadFrameCount(b.id)} insights</>
          )}
        </span>
      </span>
      <span className={`mqr-card-cta${owned ? " read" : ""}`}>
        {owned ? "Read" : "Preview"}
      </span>
    </button>
  );

  return (
    <main className="mqr-page">
      <header className="ord-head">
        <button
          type="button"
          className="ord-back"
          onClick={() => router.push("/profile")}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ord-head-titles">
          <h1 className="ord-head-title">
            <Sparkles size={18} /> My QuickReads
          </h1>
        </div>
      </header>

      {!phone ? (
        <div className="mqr-login">
          <p className="mqr-login-lbl">
            Enter the number you used for QuickReads
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
      ) : loading ? (
        <div className="mqr-loading">
          <RefreshCw size={18} className="cpo-spin" /> Loading your library…
        </div>
      ) : (
        <>
          {/* Subscription banner */}
          {subActive ? (
            <div className="mqr-sub-banner active">
              <span className="mqr-sub-ic">
                <Crown size={20} />
              </span>
              <div className="mqr-sub-txt">
                <strong>Unlimited active</strong>
                <small>
                  Every QuickRead is unlocked · Renews {renewalDate}
                </small>
              </div>
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
              <Crown size={16} /> Go Unlimited — read every book from ₹99/mo
            </button>
          )}

          {/* Active / purchased */}
          <section className="mqr-section">
            <h2 className="mqr-section-title">
              {subActive ? "All QuickReads (Unlimited)" : "Your books"}
            </h2>
            {activeBooks.length === 0 ? (
              <p className="mqr-empty">
                No QuickReads yet. Unlock any book below to start reading.
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

          {/* You may like — only when not on Unlimited */}
          {!subActive && youMayLike.length > 0 && (
            <section className="mqr-section">
              <h2 className="mqr-section-title">You may like</h2>
              <div className="mqr-grid">
                {youMayLike.map((b) => (
                  <Card key={b.id} b={b} owned={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AnimatePresence>
        {openBook && (
          <QuickReadsReader
            book={openBook}
            resume
            onClose={() => {
              setOpenBook(null);
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
    </main>
  );
}
