"use client";

import { useEffect, useState } from "react";
import { List, ChevronUp, X } from "lucide-react";

// Mobile/tablet table of contents: a fixed bar at the bottom that always shows
// the section you're currently reading (scrollspy). Tap it to expand the full
// list upward; tap an item to jump to that section. Hidden on desktop (the
// sidebar TOC handles that).
export default function MobileTOC({ items = [] }) {
  const [active, setActive] = useState(items[0]?.id || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!items.length) return;
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  // Lock body scroll while the panel is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!items || items.length < 2) return null;

  const activeText = items.find((i) => i.id === active)?.text || items[0].text;

  const go = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 72,
        behavior: "smooth",
      });
      setActive(id);
    }
    setOpen(false);
  };

  return (
    <div className="mtoc">
      {open && (
        <div className="mtoc-backdrop" onClick={() => setOpen(false)} />
      )}

      {open && (
        <div className="mtoc-panel" role="dialog" aria-label="Table of contents">
          <div className="mtoc-panel-head">
            <span>
              <List size={15} /> On this page
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <ul>
            {items.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => go(e, it.id)}
                  className={active === it.id ? "active" : ""}
                >
                  {it.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="mtoc-bar"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="mtoc-bar-left">
          <List size={16} />
          <span className="mtoc-bar-text">
            <span className="mtoc-bar-label">On this page</span>
            <span key={active} className="mtoc-bar-current">
              {activeText}
            </span>
          </span>
        </span>
        <ChevronUp size={18} className={`mtoc-chev${open ? " open" : ""}`} />
      </button>
    </div>
  );
}
