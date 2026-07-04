// app/1rupee/page.js — "Books at just ₹1" promotional landing page.
// Short, memorable route: /1rupee
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import LazyBookGrid from "@/components/UI/LazyBookGrid";
import CartBar from "@/components/CartBar";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import Link from "next/link";
import Script from "next/script";
import { Sparkles, Truck, ShieldCheck, Wallet, Clock } from "lucide-react";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CANONICAL = "https://www.thebookx.in/1rupee";

export const metadata = {
  title:
    "Buy Books at Just ₹1 Online in India | ₹1 Book Sale — TheBookX",
  description:
    "Grab bestselling books at just ₹1 on TheBookX! Limited-time ₹1 book sale with free delivery, Cash on Delivery (COD) and easy 7-day returns across India. Add one ₹1 book to every order — shop now before stock runs out.",
  keywords:
    "1 rupee books, ₹1 books, books at 1 rupee, 1 rupee book sale, cheap books online India, buy books at 1 rupee, lowest price books, free book offer, books starting at ₹1, TheBookX",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Buy Books at Just ₹1 Online in India | TheBookX ₹1 Book Sale",
    description:
      "Bestselling books at just ₹1 — limited time. Free delivery, COD and 7-day returns across India. Shop the ₹1 book sale on TheBookX now.",
    url: CANONICAL,
    siteName: "TheBookX",
    type: "website",
    images: [
      {
        url: "https://www.thebookx.in/og/1-rupee-books.jpg",
        width: 1200,
        height: 630,
        alt: "Books at just ₹1 on TheBookX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Books at Just ₹1 Online in India | TheBookX",
    description:
      "Bestselling books at just ₹1 — limited time. Free delivery + COD across India.",
  },
  robots: { index: true, follow: true },
};

export default function OneRupeePage() {
  const oneRupeeBooks = books.filter(
    (b) => b.discountedPrice === 1 && b.stock > 0,
  );
  // Everything else the shopper can add to reach a bigger, better order.
  const otherBooks = books.filter(
    (b) => b.discountedPrice !== 1 && b.stock > 0,
  );

  // A few category quick-links for browsing + internal SEO linking.
  const categories = [...new Set(books.flatMap((b) => b.catalogue || []))].slice(
    0,
    12,
  );

  const faqs = [
    {
      q: "Are these books really available at ₹1?",
      a: "Yes! Every book in this collection is genuinely priced at ₹1 for a limited time on TheBookX. One ₹1 book can be added per order.",
    },
    {
      q: "Is delivery free on ₹1 books?",
      a: "Add a few more books to your order and enjoy free delivery across India, with Cash on Delivery (COD) and easy 7-day returns.",
    },
    {
      q: "Are the ₹1 books genuine and new?",
      a: "Absolutely. Every copy is 100% authentic and brand new, shipped in secure, protective packaging via Delhivery and India Post.",
    },
  ];

  const SITE = "https://www.thebookx.in";
  const PRICE_VALID_UNTIL = "2027-12-31";
  const absImg = (img) => {
    const src = typeof img === "string" ? img : img?.src || "";
    if (!src) return undefined;
    return src.startsWith("http") ? src : `${SITE}${src}`;
  };

  // Rich ItemList: each entry is a full Product + Book with an Offer so the
  // ₹1 books are eligible for product/merchant rich results in search.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Books at just ₹1 on TheBookX",
    description:
      "A limited-time collection of bestselling books available at just ₹1 each on TheBookX.",
    numberOfItems: oneRupeeBooks.length,
    itemListElement: oneRupeeBooks.slice(0, 30).map((b, i) => {
      const url = `${SITE}/books/${slugify(b.name)}`;
      const image = absImg(b.image);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": ["Product", "Book"],
          "@id": url,
          name: b.name,
          url,
          ...(image ? { image } : {}),
          ...(b.author
            ? { author: { "@type": "Person", name: b.author } }
            : {}),
          ...(b.language ? { inLanguage: b.language } : {}),
          brand: { "@type": "Brand", name: "TheBookX" },
          sku: b.id,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            price: b.discountedPrice,
            priceValidUntil: PRICE_VALID_UNTIL,
            availability:
              b.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "TheBookX" },
          },
        },
      };
    }),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", item: "https://www.thebookx.in" },
      { name: "Books at ₹1", item: CANONICAL },
    ].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <>
      <Navbar />

      <Script
        id="one-rupee-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <Script
        id="one-rupee-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Script
        id="one-rupee-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="or-page">
        <div className="or-container">
          <div className="or-breadcrumb">
            <Breadcrumbs items={[{ label: "Books at ₹1" }]} />
          </div>

          {/* ===== Hero ===== */}
          <section className="or-hero">
            <span className="or-spark or-spark-1">✨</span>
            <span className="or-spark or-spark-2">✨</span>
            <span className="or-spark or-spark-3">✨</span>

            <div className="or-hero-badge">
              <Clock size={14} /> Limited-time offer
            </div>

            <h1 className="or-hero-title">
              Bestselling books at just{" "}
              <span className="or-price-tag">₹1</span>
            </h1>
            <p className="or-hero-sub">
              Yes, really. Pick a genuine, brand-new book for a single rupee —
              then add a few more to unlock free delivery across India.
            </p>

            <div className="or-hero-stats">
              <div className="or-stat">
                <span className="or-stat-num">{oneRupeeBooks.length}</span>
                <span className="or-stat-label">books at ₹1</span>
              </div>
              <div className="or-stat">
                <span className="or-stat-num">99%</span>
                <span className="or-stat-label">off MRP</span>
              </div>
              <div className="or-stat">
                <span className="or-stat-num">4.8★</span>
                <span className="or-stat-label">shopper rating</span>
              </div>
            </div>

            <div className="or-trust">
              <span className="or-trust-item">
                <Truck size={16} /> Free delivery*
              </span>
              <span className="or-trust-item">
                <Wallet size={16} /> Cash on Delivery
              </span>
              <span className="or-trust-item">
                <ShieldCheck size={16} /> 7-day returns
              </span>
            </div>
          </section>

          {/* ===== ₹1 books grid ===== */}
          <section className="or-section">
            <h2 className="or-section-title">
              <Sparkles size={18} className="or-section-icon" />
              Grab yours for ₹1
            </h2>
            {oneRupeeBooks.length > 0 ? (
              <div className="books-grid">
                {oneRupeeBooks.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            ) : (
              <p className="or-empty">
                Our ₹1 books are sold out for now — check back soon!
              </p>
            )}
          </section>

          {/* ===== Category quick links ===== */}
          {categories.length > 0 && (
            <section className="or-section">
              <h2 className="or-section-title">Browse by category</h2>
              <div className="or-cat-chips">
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={`/category/${slugify(c)}`}
                    className="or-cat-chip"
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== Add more books ===== */}
          <section className="or-section">
            <h2 className="or-section-title">Add more books to your order</h2>
            <p className="or-section-sub">
              Fill your bag with more great reads — free delivery kicks in as
              you add.
            </p>
            <LazyBookGrid items={otherBooks} batch={20} />
          </section>

          {/* ===== FAQ ===== */}
          <section className="or-section">
            <h2 className="or-section-title">Frequently asked questions</h2>
            <div className="or-faq-list">
              {faqs.map((f, i) => (
                <div key={i} className="or-faq-item">
                  <h3 className="or-faq-q">{f.q}</h3>
                  <p className="or-faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Sticky cart bar — appears when items are in the bag (same as home) */}
      <CartBar />
    </>
  );
}
