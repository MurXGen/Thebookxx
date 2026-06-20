import Link from "next/link";
import {
  BookOpen,
  Truck,
  ShieldCheck,
  RotateCcw,
  Wallet,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About TheBookX — India's Friendly Online Bookstore",
  description:
    "TheBookX makes great books affordable for every Indian reader — curated bestsellers at unbeatable prices, free delivery, Cash on Delivery, and books starting at ₹1.",
  alternates: { canonical: "https://www.thebookx.in/about-us" },
  openGraph: {
    title: "About TheBookX — India's Friendly Online Bookstore",
    description:
      "Curated bestsellers at unbeatable prices, free delivery, Cash on Delivery, and books starting at ₹1 — delivered across India.",
    url: "https://www.thebookx.in/about-us",
    type: "website",
  },
};

export default function AboutUs() {
  const promises = [
    {
      icon: Wallet,
      title: "Unbeatable prices",
      text: "Bestsellers, self-help and fiction at prices made for everyday readers — plus our limited-period ₹1 book sale.",
    },
    {
      icon: Truck,
      title: "Free delivery, pan-India",
      text: "Shipped securely via Delhivery and India Post so your books reach you in great condition, anywhere in India.",
    },
    {
      icon: Wallet,
      title: "Cash on Delivery",
      text: "Prefer to pay at your doorstep? COD is available alongside fast, no-extra-charge UPI.",
    },
    {
      icon: RotateCcw,
      title: "Easy 7-day returns",
      text: "Not the right read? Our straightforward 7-day return policy keeps every order risk-free.",
    },
    {
      icon: ShieldCheck,
      title: "Authentic & in pristine condition",
      text: "Every title is genuine and carefully packed, so it arrives just as it should.",
    },
    {
      icon: BookOpen,
      title: "Hand-picked, not endless",
      text: "A curated catalogue of 500+ titles means less scrolling and more reading — only books worth your time.",
    },
  ];

  return (
    <main className="legal-page">
      <div className="legal-header">
        <h1>About TheBookX</h1>
        <div className="legal-header-meta">
          <p className="legal-intro">
            TheBookX is an India-first online bookstore on a simple mission: make
            great books affordable for every reader. From timeless classics to
            the self-help and fiction everyone's talking about, we bring you a
            hand-picked collection at prices that make it easy to keep reading.
          </p>
        </div>
      </div>

      <section id="our-story">
        <h2>Our story</h2>
        <p>
          We started TheBookX (formerly Uskillbook) because we believe price
          should never be the reason someone stops reading. Books change how we
          think, work and live — and they should be within everyone's reach.
          That belief is why we run our headline ₹1 book sale and keep our
          everyday prices honest and low.
        </p>
        <p>
          Today, readers across India trust us for a tight, curated catalogue,
          fast and secure delivery, and friendly support that's only a WhatsApp
          message away.
        </p>
      </section>

      <section id="why-thebookx">
        <h2>Why readers choose TheBookX</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {promises.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              style={{
                background: "var(--surface-2, #faf9f7)",
                border: "1px solid var(--hairline, #ececec)",
                borderRadius: "14px",
                padding: "18px",
              }}
            >
              <Icon size={20} style={{ color: "var(--tertiary, #fb8500)" }} />
              <h3 className="font-16 weight-600" style={{ margin: "10px 0 6px" }}>
                {title}
              </h3>
              <p className="font-13 dark-50" style={{ margin: 0, lineHeight: 1.6 }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="reading-beyond-books">
        <h2>Reading, beyond the bookshelf</h2>
        <p>
          We also write for our readers. Our{" "}
          <Link href="/blogs" style={{ color: "var(--tertiary)" }}>
            blog
          </Link>{" "}
          shares reading lists and practical ideas on clarity, focus and
          self-improvement — including writing by{" "}
          <Link
            href="/author/murthy-thevar"
            style={{ color: "var(--tertiary)" }}
          >
            Murthy Thevar
          </Link>
          , author of <em>The Art of Clarity</em>. It's our way of helping you
          find your next great read.
        </p>
      </section>

      <section id="about-cta">
        <h2>Start reading for less</h2>
        <p>
          Browse the full collection, or reach out any time — we're happy to
          help you find the right book.
        </p>
        <div
          className="flex flex-row gap-12 flex-wrap"
          style={{ marginTop: "16px" }}
        >
          <Link href="/books" className="pri-big-btn">
            <Sparkles size={16} /> Browse all books
          </Link>
          <Link href="/contact-us" className="sec-big-btn">
            Contact us
          </Link>
        </div>
        <p className="font-12 dark-50" style={{ marginTop: "20px" }}>
          Read our{" "}
          <Link href="/shipping" style={{ color: "var(--tertiary)" }}>
            shipping
          </Link>
          ,{" "}
          <Link href="/refund" style={{ color: "var(--tertiary)" }}>
            returns &amp; refund
          </Link>{" "}
          and{" "}
          <Link href="/terms" style={{ color: "var(--tertiary)" }}>
            terms
          </Link>{" "}
          policies.
        </p>
      </section>
    </main>
  );
}
