"use client";

// Bookmark achievements: 2 free bookmarks on every order → 3 at ₹500 → 4 at
// ₹1000 → the Mystery Box at ₹3000.
//   variant="strip" — progress bar for the bag (tap for the full list); shows
//                      a small pop-up when the bag crosses a new milestone
//   variant="full"  — compact list for the payment step

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock, Package } from "lucide-react";
import {
  BASE_FREE_BOOKMARKS,
  REWARD_LEVELS,
  rewardProgress,
} from "@/utils/orderRewards";

const LEVEL_KEY = "tbx_bm_level";
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// A row of bookmark ribbons; the last `fresh` ones drop in.
function Ribbons({ count, fresh = 0, size = "md" }) {
  return (
    <span className={`bmk-row bmk-${size}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`bmk${i >= count - fresh ? " bmk-new" : ""}`}
          style={{ animationDelay: `${(i - (count - fresh)) * 0.12 + 0.15}s` }}
        />
      ))}
    </span>
  );
}

// Stops sit at fixed spots (not to scale) so the early ones aren't cramped:
// 0 bookmarks → 2 free (every order, always reached) → ₹500 → ₹1000 → Box.
const STOPS = [
  { id: "zero", at: -1, pos: 0, top: "0", reward: "" },
  { id: "base", at: 0, pos: 18, top: `${BASE_FREE_BOOKMARKS} free`, reward: "every order" },
  ...REWARD_LEVELS.map((l, i, all) => ({
    id: l.id,
    at: l.at,
    pos: i === all.length - 1 ? 100 : 18 + ((i + 1) * (100 - 18)) / (all.length + 0.75),
    top: inr(l.at),
    reward: l.mystery ? "Mystery Box" : `${l.bookmarks} free`,
    box: l.mystery,
  })),
];

// Fill between stops in proportion to the amount within that segment.
function fillPct(amount) {
  const real = STOPS.slice(1);
  for (let i = real.length - 1; i >= 0; i--) {
    if (amount >= real[i].at) {
      const cur = real[i];
      const nxt = real[i + 1];
      if (!nxt) return 100;
      const t = (amount - cur.at) / (nxt.at - cur.at);
      return cur.pos + t * (nxt.pos - cur.pos);
    }
  }
  return 0;
}

// `fx` = { k, id }: a bookmark (or the box) pops up out of that stop and fades,
// the same motion as the Bookmarks add-on at checkout.
function Track({ amount, fx, onFxDone }) {
  const fxStop = fx && STOPS.find((st) => st.id === fx.id);
  return (
    <div className="orw-track" aria-hidden="true">
      <span className="orw-fill" style={{ width: `${fillPct(amount)}%` }} />
      <AnimatePresence>
        {fxStop && (
          <motion.span
            key={fx.k}
            className={`bm-fly orw-fly${fxStop.box ? " box" : ""}`}
            style={{ left: `${fxStop.pos}%` }}
            initial={{ y: 18, opacity: 0, scale: 0.5, rotate: -14 }}
            animate={{
              y: [18, -46, -38],
              opacity: [0, 1, 0],
              scale: [0.5, 1.1, 1],
              rotate: [-14, 8, 4],
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            onAnimationComplete={onFxDone}
          >
            {fxStop.box ? (
              <Package size={26} strokeWidth={1.8} />
            ) : (
              <>
                <span className="bm-fly-tassel" />
                <span className="bm-fly-body" />
              </>
            )}
          </motion.span>
        )}
      </AnimatePresence>
      {STOPS.map((st) => {
        const on = amount >= st.at;
        return (
          <span
            key={st.id}
            className={`orw-dot${on ? " on" : ""}${st.box ? " box" : ""}${st.id === "zero" ? " first zero" : ""}`}
            style={{ left: `${st.pos}%` }}
          >
            {on && st.id !== "zero" && <Check size={9} strokeWidth={4} />}
            <small>
              <b>{st.top}</b>
              {st.reward}
            </small>
          </span>
        );
      })}
    </div>
  );
}

function LevelList({ amount }) {
  return (
    <ol className="orw-list">
      <li className="orw-lvl on">
        <span className="orw-lvl-ic">
          <Check size={13} strokeWidth={3} />
        </span>
        <span className="orw-lvl-body">
          <span className="orw-lvl-top">
            <b>{BASE_FREE_BOOKMARKS} free bookmarks</b>
            <em>Every order</em>
          </span>
        </span>
      </li>
      {REWARD_LEVELS.map((l) => {
        const on = amount >= l.at;
        return (
          <li key={l.id} className={`orw-lvl${on ? " on" : ""}`}>
            <span className="orw-lvl-ic">
              {on ? <Check size={13} strokeWidth={3} /> : <Lock size={12} />}
            </span>
            <span className="orw-lvl-body">
              <span className="orw-lvl-top">
                <b>{l.title}</b>
                <em>{inr(l.at)}</em>
              </span>
              {l.mystery &&
                l.perks.map((p) => (
                  <span key={p} className="orw-perk">
                    {p}
                  </span>
                ))}
              {!on && <span className="orw-away">{inr(l.at - amount)} away</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderRewards({
  amount = 0,
  variant = "strip",
  celebrate = true,
  claimed = null, // checkout: bookmarks already added
  onClaim, // checkout: add the free ones in one tap
}) {
  const [open, setOpen] = useState(false);
  const [fx, setFx] = useState(null); // { k, id } of the stop just reached
  const p = rewardProgress(amount);
  const ready = useRef(false);

  // Animate only when the level goes UP compared with what they've already
  // seen (stored per visit), so reloads and removing books stay quiet.
  useEffect(() => {
    if (variant !== "strip" || !celebrate) return;
    let seen = 0;
    try {
      seen = Number(sessionStorage.getItem(LEVEL_KEY) || 0);
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      if (ready.current && p.level > seen && p.current)
        setFx({ k: Date.now(), id: p.current.id });
      ready.current = true;
      try {
        sessionStorage.setItem(LEVEL_KEY, String(Math.max(seen, p.level)));
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.level, variant, celebrate]);

  const headline = p.next
    ? p.next.mystery
      ? `${p.bookmarks} free bookmarks · ${inr(p.gap)} more for the Mystery Box`
      : `${p.bookmarks} free bookmarks · ${inr(p.gap)} more for ${p.next.short}`
    : "4 free bookmarks + the Mystery Box unlocked";

  const head = (
    <>
      <Ribbons count={p.bookmarks} size="sm" />
      <span className="orw-strip-txt">
        <span className="orw-kicker">Bookmark achievements</span>
        <b>{headline}</b>
      </span>
    </>
  );

  if (variant === "strip") {
    return (
      <div className={`orw orw-strip${p.level ? " has" : ""}`}>
        <button
          type="button"
          className="orw-strip-head"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {head}
          <ChevronDown size={16} className={`orw-chev${open ? " open" : ""}`} />
        </button>
        <Track amount={p.amount} fx={fx} onFxDone={() => setFx(null)} />
        {/* Short nudge: free, but only if they claim them. */}
        {p.amount > 0 && (
          <p className="orw-claim">
            Claim your {p.bookmarks} free bookmarks at checkout.
          </p>
        )}
        {open && (
          <div className="orw-more">
            <LevelList amount={p.amount} />
            <p className="orw-foot">Based on your books total. Pick your bookmarks at checkout.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="orw orw-full">
      <div className="orw-full-head">{head}</div>
      <Track amount={p.amount} />
      {claimed != null &&
        (claimed >= p.bookmarks ? (
          <p className="orw-claim done">
            <Check size={13} strokeWidth={3} /> {p.bookmarks} free bookmarks added
          </p>
        ) : (
          <div className="orw-claim-row">
            <span>
              {claimed > 0
                ? `${p.bookmarks - claimed} more free, still unclaimed`
                : `${p.bookmarks} free bookmarks, still unclaimed`}
            </span>
            {onClaim && (
              <button type="button" className="orw-claim-btn" onClick={() => onClaim(p.bookmarks)}>
                Add {p.bookmarks - claimed} free
              </button>
            )}
          </div>
        ))}
    </section>
  );
}
