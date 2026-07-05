// app/list-your-books/page.js — Sell/list your books with TheBookX.
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import ListBooksForm from "@/components/ListBooksForm";
import Script from "next/script";
import {
  Users,
  IndianRupee,
  Truck,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  FileText,
  MessageCircle,
  PackageCheck,
} from "lucide-react";

const CANONICAL = "https://www.thebookx.in/list-your-books";

export const metadata = {
  title:
    "List Your Books on TheBookX | Sell Books as an Author or Publisher in India",
  description:
    "Are you an author, publisher or company? List your books in bulk on TheBookX and reach thousands of readers across India. Get book SEO, branding, better visibility and social media promotion. Submit your request and we'll get you started on WhatsApp.",
  keywords:
    "list your books, sell books online India, list books as author, publisher book listing India, bulk book listing, sell books on TheBookX, book distribution India, promote my book, author book marketing, self-publish sell online",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "List Your Books on TheBookX | Sell as an Author or Publisher",
    description:
      "Reach thousands of readers across India. List your books in bulk, add SEO, branding and social promotion. Start on WhatsApp in minutes.",
    url: CANONICAL,
    siteName: "TheBookX",
    type: "website",
    images: [
      {
        url: "https://www.thebookx.in/og/list-your-books.jpg",
        width: 1200,
        height: 630,
        alt: "List your books on TheBookX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Books on TheBookX",
    description:
      "Authors & publishers: list your books, reach readers across India, add SEO + promotion. Start on WhatsApp.",
  },
  robots: { index: true, follow: true },
};

const benefits = [
  {
    icon: Users,
    title: "Reach thousands of readers",
    desc: "Get your titles in front of a growing community of active book buyers across India.",
  },
  {
    icon: IndianRupee,
    title: "Simple, author-friendly terms",
    desc: "Transparent listing with no complicated paperwork — keep more of what you earn.",
  },
  {
    icon: Truck,
    title: "We handle delivery",
    desc: "Pan-India shipping via Delhivery & India Post, plus Cash on Delivery — we manage logistics.",
  },
  {
    icon: TrendingUp,
    title: "Book SEO that ranks",
    desc: "Your titles get optimized pages built to rank on Google and our in-store search.",
  },
  {
    icon: Megaphone,
    title: "Marketing & social reach",
    desc: "Featured placement, banners and promoted social posts to put your books in the spotlight.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted storefront",
    desc: "Sell on a bookstore readers already know and trust, with genuine ratings and reviews.",
  },
];

const steps = [
  {
    icon: FileText,
    title: "1. Share your details",
    desc: "Fill the short form below with your titles and the add-ons you want.",
  },
  {
    icon: MessageCircle,
    title: "2. Chat on WhatsApp",
    desc: "We instantly open WhatsApp with your request so we can align on pricing & scope.",
  },
  {
    icon: PackageCheck,
    title: "3. Go live & sell",
    desc: "We list, optimize and promote your books — you start receiving orders.",
  },
];

const faqs = [
  {
    q: "Who can list books on TheBookX?",
    a: "Authors, self-published writers, publishers, bookstores and companies can all list their books — whether it's a single title or a bulk catalogue.",
  },
  {
    q: "Is there a cost to list my books?",
    a: "Basic listing terms are simple and author-friendly. Optional add-ons like Book SEO, branding and social promotion are available to boost sales — we'll share full details on WhatsApp.",
  },
  {
    q: "Can I list all books by one author in bulk?",
    a: "Yes. You can list a full author catalogue or many titles at once — just choose 'All books by an author' or 'Bulk listing' in the form.",
  },
  {
    q: "How do I get started?",
    a: "Fill the form on this page. On submit, we open WhatsApp with your request neatly organised, and our team continues the conversation to get you live.",
  },
];

export default function ListYourBooksPage() {
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Book Listing & Selling for Authors and Publishers",
    provider: {
      "@type": "Organization",
      name: "TheBookX",
      url: "https://www.thebookx.in",
    },
    areaServed: "IN",
    description:
      "List and sell your books on TheBookX — bulk listing for authors, publishers and companies, with optional SEO, branding and social media promotion.",
    url: CANONICAL,
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
      { name: "List Your Books", item: CANONICAL },
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
        id="lyb-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <Script
        id="lyb-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Script
        id="lyb-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="lb-page">
        <div className="lb-container">
          <div className="lb-breadcrumb">
            <Breadcrumbs items={[{ label: "List Your Books" }]} />
          </div>

          {/* ===== Hero ===== */}
          <section className="lb-hero">
            <span className="lb-hero-badge">📚 For authors, publishers & brands</span>
            <h1 className="lb-hero-title">
              List your books on <span className="lb-accent">TheBookX</span>
            </h1>
            <p className="lb-hero-sub">
              Get your titles in front of thousands of readers across India.
              List a single book, an entire author catalogue, or your full
              publishing house — and let us handle selling, delivery and
              marketing.
            </p>
            <a href="#list-form" className="lb-hero-cta">
              Start listing — it&apos;s free to submit
            </a>
          </section>

          {/* ===== Why list with us ===== */}
          <section className="lb-section">
            <h2 className="lb-section-title">Why authors & publishers list with us</h2>
            <div className="lb-benefits">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div className="lb-benefit" key={title}>
                  <span className="lb-benefit-icon">
                    <Icon size={22} />
                  </span>
                  <h3 className="lb-benefit-title">{title}</h3>
                  <p className="lb-benefit-desc">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== How it works ===== */}
          <section className="lb-section">
            <h2 className="lb-section-title">How it works</h2>
            <div className="lb-steps">
              {steps.map(({ icon: Icon, title, desc }) => (
                <div className="lb-step" key={title}>
                  <span className="lb-step-icon">
                    <Icon size={20} />
                  </span>
                  <h3 className="lb-step-title">{title}</h3>
                  <p className="lb-step-desc">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== Form ===== */}
          <section className="lb-section lb-form-section">
            <ListBooksForm />
          </section>

          {/* ===== FAQ ===== */}
          <section className="lb-section">
            <h2 className="lb-section-title">Frequently asked questions</h2>
            <div className="lb-faq-list">
              {faqs.map((f, i) => (
                <div className="lb-faq-item" key={i}>
                  <h3 className="lb-faq-q">{f.q}</h3>
                  <p className="lb-faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
