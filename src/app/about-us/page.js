import Link from "next/link";
import {
  BookOpen,
  Truck,
  ShieldCheck,
  RotateCcw,
  Wallet,
  Tag,
} from "lucide-react";

export const metadata = {
  title: "About TheBookX, India's Friendly Online Bookstore",
  description:
    "TheBookX makes great books affordable for every Indian reader, curated bestsellers at unbeatable prices, free delivery, Cash on Delivery, and books starting at ₹1.",
  alternates: { canonical: "https://www.thebookx.in/about-us" },
  openGraph: {
    title: "About TheBookX, India's Friendly Online Bookstore",
    description:
      "Curated bestsellers at unbeatable prices, free delivery, Cash on Delivery, and books starting at ₹1, delivered across India.",
    url: "https://www.thebookx.in/about-us",
    type: "website",
  },
};

const PROMISES = [
  {
    icon: Tag,
    title: "Unbeatable prices",
    text: "Bestsellers, self-help and fiction at everyday-low prices, plus our limited-period ₹1 book sale.",
  },
  {
    icon: Truck,
    title: "Free delivery, pan-India",
    text: "Shipped securely via Delhivery and India Post, reaching you in great condition anywhere in India.",
  },
  {
    icon: Wallet,
    title: "Cash on Delivery",
    text: "Pay at your doorstep with COD, or use fast UPI with no extra charges.",
  },
  {
    icon: RotateCcw,
    title: "Easy 7-day returns",
    text: "Not the right read? Our straightforward 7-day return policy keeps every order risk-free.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic & pristine",
    text: "Every title is genuine and carefully packed, so it arrives just as it should.",
  },
  {
    icon: BookOpen,
    title: "Hand-picked, not endless",
    text: "A curated catalogue of 500+ titles, less scrolling, more reading.",
  },
];

export default function AboutUs() {
  return (
    <main className="legal-page about-page flex flex-col gap-24">
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
          think, work and live, and they should be within everyone's reach.
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
        <div className="contact-topics-grid">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div className="contact-topic" key={title}>
              <Icon size={18} className="contact-topic-icon" />
              <div>
                <span className="contact-topic-title">{title}</span>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="reading-beyond-books">
        <h2>Reading, beyond the bookshelf</h2>
        <p>
          We also write for our readers. Our <Link href="/blogs">blog</Link>{" "}
          shares reading lists and practical ideas on clarity, focus and
          self-improvement, including writing by{" "}
          <Link href="/author/murthy-thevar">Murthy Thevar</Link>, author of{" "}
          <em>The Art of Clarity</em>. It's our way of helping you find your next
          great read.
        </p>
      </section>

      <section id="about-cta">
        <h2>Start reading for less</h2>
        <p>
          Browse the full collection, or reach out any time, we're happy to help
          you find the right book.
        </p>
        <div className="about-cta-row">
          <Link href="/books" className="pri-big-btn about-cta-btn">
            Browse all books
          </Link>
          <Link href="/contact-us" className="sec-big-btn about-cta-btn">
            Contact us
          </Link>
        </div>
        <p className="about-policy-line">
          Read our <Link href="/shipping">shipping</Link>,{" "}
          <Link href="/refund">returns &amp; refund</Link> and{" "}
          <Link href="/terms">terms</Link> policies.
        </p>
      </section>
    </main>
  );
}
