"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const STEPS = [
  { t: "Tap Proceed", s: "Review your books and tap Proceed to pay" },
  { t: "Add your address", s: "Pincode fills your city — just add house & phone" },
  { t: "Choose how to pay", s: "UPI, pay in two parts, or Cash on Delivery" },
  { t: "Order placed!", s: "Ships within a day — track it from Orders" },
];

/**
 * Small looping demo on the bag: a mini phone walks through
 * Bag → Address → Payment → Order placed, with a tap animation on each step.
 */
export default function CheckoutGuide() {
  const [f, setF] = useState(0);
  // Collapsed by default; opens by itself the first time it scrolls into view.
  const [open, setOpen] = useState(false);
  const touched = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !touched.current) {
          touched.current = true;
          setOpen(true);
          setF(0);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setF((x) => (x + 1) % 4), 2200);
    return () => clearInterval(id);
  }, [open]);

  const toggle = () => {
    touched.current = true;
    setOpen((v) => !v);
    setF(0);
  };

  return (
    <section ref={ref} className={`cg${open ? " open" : ""}`} aria-label="How checkout works">
      <button type="button" className="cg-head" onClick={toggle} aria-expanded={open} aria-controls="cg-body">
        <span className="cg-label">How to checkout · 3 taps</span>
        <ChevronDown size={18} className="cg-chev" aria-hidden="true" />
      </button>
      <div className="cg-wrap" id="cg-body">
      <div className="cg-body">
        {/* Mini phone */}
        <div className="cg-phone" aria-hidden="true" data-f={f}>
          <div className="cg-notch" />
          {/* 0 · Bag */}
          <div className={`cg-fr${f === 0 ? " on" : ""}`}>
            <span className="cg-ttl">Your Bag</span>
            <span className="cg-item"><i /><b /><em /></span>
            <span className="cg-item"><i /><b /><em /></span>
            <span className="cg-btn or">Proceed<span className="cg-tap" /></span>
          </div>
          {/* 1 · Address */}
          <div className={`cg-fr${f === 1 ? " on" : ""}`}>
            <span className="cg-ttl">Address</span>
            <span className="cg-in"><b /></span>
            <span className="cg-in"><b /></span>
            <span className="cg-in half"><b /></span>
            <span className="cg-btn or">Proceed<span className="cg-tap" /></span>
          </div>
          {/* 2 · Payment */}
          <div className={`cg-fr${f === 2 ? " on" : ""}`}>
            <span className="cg-ttl">Payment</span>
            <span className="cg-opt sel"><b />UPI<span className="cg-tick"><Check size={8} strokeWidth={4} /></span></span>
            <span className="cg-opt"><b />2 parts</span>
            <span className="cg-opt"><b />COD</span>
            <span className="cg-btn gr">Pay<span className="cg-tap" /></span>
          </div>
          {/* 3 · Done */}
          <div className={`cg-fr cg-done${f === 3 ? " on" : ""}`}>
            <span className="cg-badge">
              <span className="cg-badge-bg" />
              <Check size={22} strokeWidth={3.5} className="cg-badge-ic" />
            </span>
            <span className="cg-ok">Order placed!</span>
          </div>
        </div>
        {/* Steps, synced with the phone */}
        <ol className="cg-steps">
          {STEPS.map((st, i) => (
            <li key={st.t} className={i === f ? "on" : i < f ? "done" : ""}>
              <button type="button" onClick={() => setF(i)}>
                <span className="cg-n">{i < f ? <Check size={11} strokeWidth={3.5} /> : i + 1}</span>
                <span className="cg-t">
                  <b>{st.t}</b>
                  <small>{st.s}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      </div>
    </section>
  );
}
