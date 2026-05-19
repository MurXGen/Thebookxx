"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HorizontalScroll({
  title,
  children,
  itemWidth = 160, // approx width of card
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;

    if (!el) return;

    el.addEventListener("scroll", updateScrollState);
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
      {/* HEADER */}
      <div className="h-scroll-header">
        <h3>{title}</h3>
        {/* <span className="scroll-hint">Scroll →</span> */}
      </div>

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
