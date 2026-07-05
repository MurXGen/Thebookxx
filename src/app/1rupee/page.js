// app/1rupee/page.js — "Books at just ₹1" promotional landing page.
// Short, memorable route: /1rupee
import { books } from "@/utils/book";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import OneRupeeExperience from "@/components/OneRupeeExperience";
import CartBar from "@/components/CartBar";
import Script from "next/script";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CANONICAL = "https://www.thebookx.in/1rupee";

export const metadata = {
  title: "Buy Books at Just ₹1 Online in India | ₹1 Book Sale — TheBookX",
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

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Books at just ₹1 on TheBookX",
    description:
      "A limited-time collection of bestselling books available at just ₹1 each on TheBookX.",
    numberOfItems: oneRupeeBooks.length,
    itemListElement: oneRupeeBooks.slice(0, 30).map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.thebookx.in/books/${slugify(b.name)}`,
      name: b.name,
    })),
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

          {/* Promo stripe + ₹1 grid → swaps to full catalogue on add */}
          <OneRupeeExperience />

          {/* ===== FAQ (static, for SEO) ===== */}
          <section className="or-section">
            <h2 className="or-grab-title">Frequently asked questions</h2>
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

      {/* Sticky price + checkout cart bar (same as home) */}
      <CartBar />
    </>
  );
}
