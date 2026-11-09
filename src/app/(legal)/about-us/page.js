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
    "TheBookX makes great books affordable for every Indian reader: genuine bestsellers at the lowest prices, free delivery from ₹199, Cash on Delivery, and books starting at ₹1.",
  alternates: { canonical: "https://www.thebookx.in/about-us" },
  openGraph: {
    title: "About TheBookX, India's Friendly Online Bookstore",
    description:
      "Genuine bestsellers at the lowest prices, free delivery from ₹199, Cash on Delivery, and books starting at ₹1, delivered across India.",
    url: "https://www.thebookx.in/about-us",
    type: "website",
  },
};

const PROMISES = [
  {
    icon: Tag,
    title: "Lowest prices, books from ₹1",
    text: "Bestsellers, self-help and fiction at the lowest prices, with books starting at just ₹1 in our limited-period sale.",
  },
  {
    icon: Truck,
    title: "Free delivery from ₹199",
    text: "Shipped securely via Delhivery and India Post to almost every pincode in India, free on orders of ₹199–₹1,000.",
  },
  {
    icon: Wallet,
    title: "Cash on Delivery",
    text: "Pay at your doorstep with COD (small handling fee), or pay by UPI with no extra charge.",
  },
  {
    icon: RotateCcw,
    title: "Free cancellation & 7-day replacement",
    text: "Cancel free before dispatch. Damaged, defective or wrong book? Report it within 7 days and we replace it or refund you.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine, honestly sourced",
    text: "Legitimate published paperbacks from trusted shops and distributors (never photocopies), quality-checked and carefully packed. That is how we keep prices this low.",
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
            the self-help and fiction everyone&apos;s talking about, we bring you a
            hand-picked collection at prices that make it easy to keep reading.
          </p>
        </div>
      </div>

      <section id="our-story">
        <h2>Our story</h2>
        <p>
          We started TheBookX (formerly Uskillbook) because we believe price
          should never be the reason someone stops reading. Books change how we
          think, work and live, and they should be within everyone&apos;s reach.
          That belief is why we run our headline ₹1 book sale and keep our
          everyday prices honest and low.
        </p>
        <p>
          Today, readers across India trust us for a tight, curated catalogue,
          fast and secure delivery, and friendly support that&apos;s only a WhatsApp
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
          <em>The Art of Clarity</em>. It&apos;s our way of helping you find your next
          great read.
        </p>
      </section>

      <section id="about-cta">
        <h2>Start reading for less</h2>
        <p>
          Browse the full collection, or reach out any time, we&apos;re happy to help
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
