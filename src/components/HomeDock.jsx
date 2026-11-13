"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
  Layers,
  Home,
  Camera,
  LayoutGrid,
  TrendingUp,
  Tag,
  PackagePlus,
  Library,
  Zap,
  BookOpen,
  Award,
  Sparkles,
  Baby,
  BookMarked,
  X,
} from "lucide-react";

const SUPPORT_WHATSAPP = "917710892108";
const OPEN_MS = 6500; // how long the index stays open before folding away
const PEEK_KEY = "tbx_hs_peeked";
const PARAM = "section"; // /?section=combos opens the homepage at that section

// Homepage sections, top to bottom. `id` matches the hs-* anchors in page.js;
// anything not on the page is skipped automatically.
const SECTIONS = [
  { id: "hs-top", slug: null, label: "Top", icon: Home },
  { id: "hs-reviews", slug: "reader-photos", label: "Reader photos", icon: Camera },
  { id: "hs-categories", slug: "categories", label: "Categories", icon: LayoutGrid },
  { id: "hs-rail-trending", slug: "trending", label: "Trending", icon: TrendingUp },
  { id: "hs-rail-rupee", slug: "1-rupee-books", label: "₹1 books", icon: Tag },
  { id: "hs-combos", slug: "combos", label: "Combos", icon: PackagePlus },
  { id: "hs-rail-book-sets", slug: "box-sets", label: "Box sets", icon: Library },
  { id: "hs-quickreads", slug: "quickreads", label: "QuickReads", icon: Zap },
  { id: "hs-rail-fiction", slug: "fiction", label: "Fiction", icon: BookOpen },
  { id: "hs-rail-bestsellers", slug: "bestsellers", label: "Bestsellers", icon: Award },
  { id: "hs-rail-new", slug: "new-arrivals", label: "New arrivals", icon: Sparkles },
  { id: "hs-rail-children", slug: "kids", label: "Kids & stories", icon: Baby },
  { id: "hs-allbooks", slug: "all-books", label: "All books", icon: BookMarked },
];

/**
 * How far up from the bottom of the screen the dock has to sit to clear the
 * cart bar / offer strip / bottom nav — whichever is showing right now.
 * The bars no longer hide on scroll; this only catches the cart bar appearing /
 * disappearing as the bag changes, so a gentle poll is enough.
 */
function useBottomClearance() {
  const [clear, setClear] = useState(0);
  useEffect(() => {
    let t;
    const calc = () => {
      let m = 0;
      document.querySelectorAll(".cart-bar, .tbx-bottomnav").forEach((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || r.height < 2) return;
        if (r.top >= window.innerHeight - 1) return; // slid off-screen
        m = Math.max(m, window.innerHeight - r.top);
      });
      setClear((c) => (Math.abs(c - m) > 1 ? m : c));
      t = setTimeout(calc, 600);
    };
    const onResize = () => {
      clearTimeout(t);
      calc();
    };
    calc();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return clear;
}

const navOffset = () => (document.querySelector(".navbar-wrapper")?.offsetHeight || 64) + 8;

const targetY = (id) => {
  if (id === "hs-top") return 0;
  const el = document.getElementById(id);
  return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - navOffset()) : null;
};

// behavior: "smooth" for taps, "instant" while dragging (the site sets
// scroll-behavior: smooth on <html>, so "auto" would still animate).
function scrollToSection(id, behavior = "smooth") {
  const y = targetY(id);
  if (y == null) return;
  window.scrollTo({ top: y, behavior });
  if (id === "hs-top") return;
  // Lazy sections above the target grow as we pass them — re-aim at the
  // section's new absolute position a couple of times.
  clearTimeout(scrollToSection.t1);
  clearTimeout(scrollToSection.t2);
  const settle = () => {
    const y2 = targetY(id);
    if (y2 != null && Math.abs(y2 - window.scrollY) > 16) window.scrollTo({ top: y2, behavior });
  };
  scrollToSection.t1 = setTimeout(settle, behavior === "smooth" ? 900 : 250);
  scrollToSection.t2 = setTimeout(settle, behavior === "smooth" ? 1700 : 700);
}

export default function HomeDock() {
  const clear = useBottomClearance();
  const [sections, setSections] = useState([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [scrolling, setScrolling] = useState(false);
  const [openKey, setOpenKey] = useState(0); // restarts the countdown ring
  const [flash, setFlash] = useState(false); // "you've reached …" chip
  const [waTip, setWaTip] = useState(false); // WhatsApp tooltip on arrival
  const flashTimer = useRef(null);
  const lastActive = useRef(null);
  const closeTimer = useRef(null);
  const railRef = useRef(null);
  const drag = useRef({ on: false, moved: false, startY: 0 });

  // Which sections exist on this page.
  useEffect(() => {
    const find = () => setSections(SECTIONS.filter((s) => document.getElementById(s.id)));
    find();
    const t = setTimeout(find, 1500);
    return () => clearTimeout(t);
  }, []);

  // Continuous scroll position along the rail (0–100%), sprung so the fill
  // glides between stops instead of jumping. Written straight to the DOM by
  // framer-motion — no React re-render per scroll frame.
  const progTarget = useMotionValue(0);
  const prog = useSpring(progTarget, { stiffness: 260, damping: 34, mass: 0.6 });
  const progScale = useTransform(prog, (v) => Math.max(0, Math.min(1, v / 100)));
  const thumbTop = useTransform(prog, (v) => `${Math.max(0, Math.min(100, v))}%`);
  const scrollingRef = useRef(false);
  const deepLinking = useRef(false); // true while opening /?section=… (don't rewrite the URL mid-flight)

  // Track the section in view + "is scrolling" (rail brightens while you scroll).
  useEffect(() => {
    if (!sections.length) return;
    let raf = 0;
    let idle;
    const n = sections.length;
    const measure = () => {
      raf = 0;
      const line = navOffset() + window.innerHeight * 0.25;
      const tops = sections.map((s, i) => {
        if (i === 0) return -Infinity;
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top : Infinity;
      });
      let idx = 0;
      tops.forEach((t, i) => {
        if (t <= line) idx = i;
      });
      let frac = 0;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atEnd) {
        idx = n - 1;
      } else if (idx < n - 1) {
        const from = idx === 0 ? line - window.scrollY : tops[idx]; // section 0 starts at the page top
        const to = tops[idx + 1];
        if (Number.isFinite(to) && to > from) frac = Math.min(1, Math.max(0, (line - from) / (to - from)));
      }
      setActive(idx);
      if (!drag.current.on && n > 1) progTarget.set(((idx + frac) / (n - 1)) * 100);
    };
    const onScroll = () => {
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        setScrolling(true);
      }
      clearTimeout(idle);
      idle = setTimeout(() => {
        scrollingRef.current = false;
        setScrolling(false);
      }, 1100);
      if (!raf) raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    const onResize = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(idle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections, progTarget]);

  // Keep ?section=… in the address bar in step with the section in view, so the
  // link can be shared / reopened at the same spot. replaceState: no history
  // spam, no re-render. Debounced so a fast fling doesn't write every stop.
  useEffect(() => {
    if (!sections.length) return;
    const t = setTimeout(() => {
      if (deepLinking.current) return;
      try {
        const url = new URL(window.location.href);
        const slug = sections[active]?.slug;
        const cur = url.searchParams.get(PARAM);
        if ((slug || null) === cur) return;
        if (slug) url.searchParams.set(PARAM, slug);
        else url.searchParams.delete(PARAM);
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      } catch {}
    }, 450);
    return () => clearTimeout(t);
  }, [active, sections]);

  // Opened with /?section=combos → glide to that section once it's on the page.
  const deepLinked = useRef(null);
  const hasSections = sections.length > 0;
  useEffect(() => {
    if (!hasSections || deepLinked.current !== null) return;
    let slug = null;
    try {
      slug = new URL(window.location.href).searchParams.get(PARAM);
    } catch {}
    const target = slug && SECTIONS.find((s) => s.slug === slug.toLowerCase());
    deepLinked.current = !!target;
    if (!target) return;
    deepLinking.current = true;
    let tries = 0;
    let t;
    const go = () => {
      if (document.getElementById(target.id)) {
        scrollToSection(target.id, "smooth");
        // let the smooth scroll + settle passes finish before the URL follows scrolling again
        t = setTimeout(() => (deepLinking.current = false), 2200);
      } else if (tries++ < 20) {
        t = setTimeout(go, 200);
      } else {
        deepLinking.current = false;
      }
    };
    t = setTimeout(go, 350); // let the first paint / scroll restoration land
    return () => clearTimeout(t);
  }, [hasSections]);

  // Briefly name the section whenever a new one comes into view.
  useEffect(() => {
    if (lastActive.current === null) {
      lastActive.current = active;
      return;
    }
    if (lastActive.current === active) return;
    lastActive.current = active;
    clearTimeout(flashTimer.current);
    const show = setTimeout(() => setFlash(true), 0);
    flashTimer.current = setTimeout(() => setFlash(false), 1700);
    return () => clearTimeout(show);
  }, [active]);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(false);
  }, []);

  const openFor = useCallback((ms = OPEN_MS) => {
    clearTimeout(closeTimer.current);
    setOpen(true);
    setOpenKey((k) => k + 1);
    closeTimer.current = setTimeout(() => setOpen(false), ms);
  }, []);

  // WhatsApp tooltip: visible for 4s shortly after the page opens.
  useEffect(() => {
    const show = setTimeout(() => setWaTip(true), 900);
    const hide = setTimeout(() => setWaTip(false), 4900);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Show the index once per session so people see what's below.
  useEffect(() => {
    if (!sections.length) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(PEEK_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      if (deepLinked.current) return; // came for a specific section — don't cover it
      openFor();
      try {
        sessionStorage.setItem(PEEK_KEY, "1");
      } catch {}
    }, 5300); // after the WhatsApp tooltip
    return () => clearTimeout(t);
  }, [sections.length, openFor]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // ── Drag / tap on the rail ────────────────────────────────────────────
  const idxFromY = (clientY) => {
    const r = railRef.current?.getBoundingClientRect();
    if (!r || sections.length < 2) return 0;
    const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    return Math.round(p * (sections.length - 1));
  };

  const onPointerDown = (e) => {
    if (!sections.length) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { on: true, moved: false, startY: e.clientY };
    clearTimeout(closeTimer.current);
    const i = idxFromY(e.clientY);
    setDragIdx(i);
    progTarget.set(pos[i] ?? 0);
  };
  const onPointerMove = (e) => {
    if (!drag.current.on) return;
    if (Math.abs(e.clientY - drag.current.startY) > 6) drag.current.moved = true;
    const i = idxFromY(e.clientY);
    if (i !== dragIdx) {
      setDragIdx(i);
      progTarget.set(pos[i] ?? 0);
      if (drag.current.moved) scrollToSection(sections[i].id, "instant");
      if (navigator.vibrate) {
        try {
          navigator.vibrate(4);
        } catch {}
      }
    }
  };
  const onPointerUp = (e) => {
    if (!drag.current.on) return;
    const i = idxFromY(e.clientY);
    drag.current.on = false;
    setDragIdx(null);
    scrollToSection(sections[i].id, drag.current.moved ? "instant" : "smooth");
    if (open) openFor(2500); // keep labels a moment so they see where they landed
  };

  const jump = (i) => {
    scrollToSection(sections[i].id);
    openFor(1400);
  };

  const askWhatsApp = () => {
    const msg =
      "Hi TheBookX! 👋 I'm browsing your store right now.\n\n" +
      "Are there any extra discounts, combo deals or freebies running today that I shouldn't miss? " +
      "I want to grab the best offer before I order 🙏";
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const n = sections.length;
  const shown = open || dragIdx !== null; // labels visible
  const hi = dragIdx ?? active;
  const fabBottom = clear + 14;
  const railBottom = fabBottom + 58; // rail ends just above the button row
  const pos = useMemo(() => sections.map((_, i) => (n > 1 ? (i / (n - 1)) * 100 : 50)), [sections, n]);

  if (!n) return null;

  return (
    <>
      {/* Dark fade behind the open index (tap to close) */}
      <AnimatePresence>
        {shown && (
          <motion.div
            className="hd-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={close}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Section rail along the right edge */}
      <motion.nav
        className={`hd-rail${shown ? " is-open" : ""}${scrolling ? " is-scrolling" : ""}`}
        aria-label="Jump to a section"
        initial={false}
        animate={{ bottom: railBottom }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div
          ref={railRef}
          className="hd-track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="slider"
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={hi + 1}
          aria-valuetext={sections[hi]?.label}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") jump(Math.min(n - 1, active + 1));
            if (e.key === "ArrowUp") jump(Math.max(0, active - 1));
          }}
        >
          <span className="hd-line" aria-hidden="true" />
          <motion.span className="hd-progress" aria-hidden="true" style={{ scaleY: progScale }} />
          <motion.span className="hd-thumb" aria-hidden="true" style={{ top: thumbTop }} />
          {sections.map((s, i) => {
            const Icon = s.icon;
            const on = i === hi;
            return (
              <div key={s.id} className={`hd-stop${on ? " on" : ""}${i < hi ? " past" : ""}`} style={{ top: `${pos[i]}%` }}>
                <AnimatePresence>
                  {shown && (
                    <motion.button
                      type="button"
                      className="hd-label"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: open && dragIdx === null ? i * 0.025 : 0, duration: 0.22 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => jump(i)}
                    >
                      <Icon size={14} />
                      <span>{s.label}</span>
                    </motion.button>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {on && flash && !shown && (
                    <motion.span
                      key={`flash-${s.id}`}
                      className="hd-reached"
                      initial={{ opacity: 0, x: 16, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      role="status"
                    >
                      <Icon size={13} />
                      <span>{s.label}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.span
                  className="hd-dot"
                  animate={{ scale: on ? (shown ? 1.5 : 1.25) : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                />
              </div>
            );
          })}
        </div>
      </motion.nav>

      {/* Bottom-right buttons: section index + WhatsApp */}
      <motion.div
        className="hd-fabs"
        initial={false}
        animate={{ bottom: fabBottom }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <button
          type="button"
          className={`hd-stack${open ? " on" : ""}`}
          onClick={() => (open ? close() : openFor())}
          aria-label={open ? "Close section index" : "Show page sections"}
          aria-expanded={open}
        >
          {open ? <X size={16} /> : <Layers size={16} />}
          {open && (
            <svg key={openKey} className="hd-ring" viewBox="0 0 44 44" aria-hidden="true">
              <motion.circle
                cx="22"
                cy="22"
                r="20.5"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: 0 }}
                transition={{ duration: OPEN_MS / 1000, ease: "linear" }}
              />
            </svg>
          )}
        </button>
        <AnimatePresence>
          {waTip && !open && (
            <motion.span
              className="wa-tip"
              role="tooltip"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <FaWhatsapp size={18} />
              <span>
                Ask us for today&apos;s best deals
                <small>Quick replies on WhatsApp</small>
              </span>
            </motion.span>
          )}
        </AnimatePresence>
        <button type="button" className="hd-wa" onClick={() => { setWaTip(false); askWhatsApp(); }} aria-label="Ask TheBookX on WhatsApp about today's best offers">
          <FaWhatsapp size={22} />
        </button>
      </motion.div>
    </>
  );
}
