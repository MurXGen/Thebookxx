import "./HomeAbout.styles.css";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Short "About us" on the homepage (copy mirrors /about-us), so new visitors
// see who we are right after the reader photos.
//  • Phones: a compact strip — one line of who we are + 4 tiny animated SVG
//    "characters" (flipping book, driving van, cash note, swap arrows).
//  • Tablet / desktop: the fuller card with the short story.
const POINTS = [
  { k: "₹1", t: "Books from ₹1", s: "Lowest prices on bestsellers" },
  { k: "₹249", t: "Free delivery", s: "On orders from ₹249" },
  { k: "COD", t: "Cash on Delivery", s: "Or pay by UPI" },
  { k: "7d", t: "7-day replacement", s: "Damaged or wrong book" },
];

// ── Tiny animated SVG characters (CSS-driven, reduced-motion safe) ──
const BookSvg = () => (
  <svg viewBox="0 0 48 48" className="hav-svg hav-book" aria-hidden="true">
    <path d="M6 12c6-3 12-3 18 1v25c-6-4-12-4-18-1z" fill="#fff1e6" stroke="#fb8500" strokeWidth="2" strokeLinejoin="round" />
    <path d="M42 12c-6-3-12-3-18 1v25c6-4 12-4 18-1z" fill="#fff" stroke="#fb8500" strokeWidth="2" strokeLinejoin="round" />
    <path className="hav-page" d="M24 13c5-3 10-3 15-1v24c-5-2-10-2-15 1z" fill="#ffd8b5" stroke="#fb8500" strokeWidth="1.5" strokeLinejoin="round" />
    <text x="15" y="29" textAnchor="middle" fontSize="9" fontWeight="900" fill="#c2410c">₹1</text>
  </svg>
);
const VanSvg = () => (
  <svg viewBox="0 0 48 48" className="hav-svg hav-van" aria-hidden="true">
    <g className="hav-van-body">
      <rect x="5" y="16" width="24" height="16" rx="3" fill="#e8f7f0" stroke="#1ba672" strokeWidth="2" />
      <path d="M29 21h7l6 6v5H29z" fill="#fff" stroke="#1ba672" strokeWidth="2" strokeLinejoin="round" />
      <circle className="hav-wheel" cx="13" cy="34" r="4" fill="#fff" stroke="#1ba672" strokeWidth="2" strokeDasharray="3 2" />
      <circle className="hav-wheel" cx="35" cy="34" r="4" fill="#fff" stroke="#1ba672" strokeWidth="2" strokeDasharray="3 2" />
    </g>
    <path className="hav-speed" d="M1 20h3M0 25h4M1 30h3" stroke="#1ba672" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const CashSvg = () => (
  <svg viewBox="0 0 48 48" className="hav-svg hav-cash" aria-hidden="true">
    <rect className="hav-note" x="6" y="15" width="32" height="20" rx="3" fill="#eef4ff" stroke="#2563eb" strokeWidth="2" />
    <circle cx="22" cy="25" r="5" fill="none" stroke="#2563eb" strokeWidth="2" />
    <g className="hav-coin">
      <circle cx="38" cy="14" r="7" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
      <text x="38" y="17.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#b45309">₹</text>
    </g>
  </svg>
);
const SwapSvg = () => (
  <svg viewBox="0 0 48 48" className="hav-svg hav-swap" aria-hidden="true">
    <g className="hav-arrows">
      <path d="M12 18a14 14 0 0 1 23-4" fill="none" stroke="#9333ea" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M36 9v6h-6" fill="none" stroke="#9333ea" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 30a14 14 0 0 1-23 4" fill="none" stroke="#9333ea" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 39v-6h6" fill="none" stroke="#9333ea" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <rect x="18" y="17" width="12" height="15" rx="2" fill="#f5ecff" stroke="#9333ea" strokeWidth="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#7e22ce">7d</text>
  </svg>
);
const CHARS = [
  { Svg: BookSvg, t: "From ₹1" },
  { Svg: VanSvg, t: "Free delivery" },
  { Svg: CashSvg, t: "Cash on delivery" },
  { Svg: SwapSvg, t: "7-day swap" },
];

export default function HomeAbout() {
  return (
    <>
      {/* Phones: minimal animated strip */}
      <section className="hav" aria-labelledby="hav-h">
        <div className="hav-head">
          <span className="ha-eyebrow">About us</span>
          <h2 id="hav-h" className="hav-title">
            Genuine books, honest prices, <em>delivered with care</em>
          </h2>
        </div>
        <ul className="hav-row">
          {CHARS.map(({ Svg, t }, i) => (
            <li key={t} style={{ "--i": i }}>
              <span className="hav-tile">
                <Svg />
              </span>
              <span className="hav-lbl">{t}</span>
            </li>
          ))}
        </ul>
        <Link href="/about-us" className="hav-link">
          Our story <ChevronRight size={14} />
        </Link>
      </section>

      {/* Tablet / desktop: fuller card */}
      <section className="ha" aria-labelledby="ha-h">
        <span className="ha-eyebrow">About us</span>
        <h2 id="ha-h" className="ha-title">
          Great books, priced for every reader
        </h2>
        <p className="ha-text">
          TheBookX (formerly Uskillbook) is an India-first online bookstore. We
          hand-pick genuine bestsellers, self-help and fiction, pack them with care
          and deliver them across India — with friendly help a WhatsApp message
          away.
        </p>
        <ul className="ha-points">
          {POINTS.map((p) => (
            <li key={p.t}>
              <b className="ha-k">{p.k}</b>
              <span>
                <strong>{p.t}</strong>
                <small>{p.s}</small>
              </span>
            </li>
          ))}
        </ul>
        <Link href="/about-us" className="ha-link">
          Read our story <ChevronRight size={15} />
        </Link>
      </section>
    </>
  );
}
