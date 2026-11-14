import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Short "About us" on the homepage (copy mirrors /about-us), so new visitors
// see who we are right after the reader photos.
const POINTS = [
  { k: "₹1", t: "Books from ₹1", s: "Lowest prices on bestsellers" },
  { k: "₹199", t: "Free delivery", s: "On orders from ₹199" },
  { k: "COD", t: "Cash on Delivery", s: "Or pay by UPI" },
  { k: "7d", t: "7-day replacement", s: "Damaged or wrong book" },
];

export default function HomeAbout() {
  return (
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
  );
}
