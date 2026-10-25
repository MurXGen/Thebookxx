"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HorizontalScroll({
  title,
  children,
  itemWidth = 160, // approx width of card
  onReachEnd, // called once each time the user scrolls near the right end
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  // Keep the latest callback without re-binding the scroll listener.
  const onReachEndRef = useRef(onReachEnd);
  useEffect(() => {
    onReachEndRef.current = onReachEnd;
  }, [onReachEnd]);
  const nearEndRef = useRef(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);

    // Lazy-load trigger: fire once when entering the last ~500px of the rail.
    const near = el.scrollLeft + el.clientWidth >= el.scrollWidth - 500;
    if (near && !nearEndRef.current) {
      nearEndRef.current = true;
      onReachEndRef.current && onReachEndRef.current();
    } else if (!near && nearEndRef.current) {
      nearEndRef.current = false;
    }
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;

    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = itemWidth * 2.5;

    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="h-scroll-wrapper">
      {/* HEADER (skipped when no title — callers can render their own) */}
      {title ? (
        <div className="h-scroll-header">
          <h3>{title}</h3>
          {/* <span className="scroll-hint">Scroll →</span> */}
        </div>
      ) : null}

      {/* BODY */}
      <div className="h-scroll-container">
        {/* LEFT BUTTON */}
        <button
          className="scroll-btn left"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
        >
          <ChevronLeft size={18} />
        </button>

        {/* SCROLL AREA */}
        <div ref={scrollRef} className="h-scroll-track">
          {children}
        </div>

        {/* RIGHT BUTTON */}
        <button
          className="scroll-btn right"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
