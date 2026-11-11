// app/book-sets/page.jsx — 3–4 book sets landing page (server-rendered for SEO).
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartBar from "@/components/CartBar";
import CombosClient from "../combos/CombosClient";
import { bookSets, mixedBookSets, getComboBooks, getComboPricing } from "@/utils/combos";
import { FREE_DELIVERY_MIN } from "@/lib/bookSeo";

const SITE = "https://www.thebookx.in";
const PAGE_URL = `${SITE}/book-sets`;
const abs = (src) => (!src ? undefined : src.startsWith("http") ? src : `${SITE}${src}`);

const cats = [...new Set(bookSets.map((c) => c.category))];
const priced = bookSets.map((c) => ({ c, ...getComboPricing(c) }));
const minPrice = Math.min(...priced.map((p) => p.price));
const authorSets = bookSets.filter((c) => c.category === "Author Packs");

export const metadata = {
  // " | TheBookX" is appended by the root title template.
  title: `Book Sets Online — ${bookSets.length} Sets of 3 & 4 Books from ₹${minPrice}`,
  description: `Buy complete book sets online in India: ${bookSets.length} handpicked sets of 3–4 paperbacks across ${cats
    .slice(0, 8)
    .join(", ")
    .toLowerCase()} and author collections (${authorSets
    .slice(0, 4)
    .map((c) => c.title.replace(/ Collection$/, ""))
    .join(", ")}). Sets from ₹${minPrice}, Cash on Delivery, free delivery from ₹${FREE_DELIVERY_MIN} and 7-day replacement.`,
  keywords: [
    "book sets",
    "book set online",
    "book sets India",
    "buy book sets online",
    "book box set",
    "book bundle",
    "set of 3 books",
    "set of 4 books",
    "book combo set",
    "author book collection",
    ...authorSets.map((c) => `${c.title.replace(/ Collection$/, "")} books set`),
    "romance book set",
    "thriller book set",
    "self help book set",
    "children's book set",
    "TheBookX book sets",
  ].join(", "),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `Book Sets — 3 & 4 Book Bundles from ₹${minPrice} | TheBookX`,
    description: `${bookSets.length} handpicked book sets by genre and author. Cash on Delivery across India.`,
    url: PAGE_URL,
    siteName: "TheBookX",
    type: "website",
    locale: "en_IN",
    images: mixedBookSets.slice(0, 1).map((c) => ({
      url: `${SITE}/combos/${c.slug}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: `${c.title} book set`,
    })),
  },
  twitter: { card: "summary_large_image", title: `Book Sets from ₹${minPrice} | TheBookX` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const faqs = [
  {
    q: "What is a book set on TheBookX?",
    a: `A book set is 3 or 4 handpicked paperbacks sold together — by genre (romance, thrillers, self-help, business and more) or by author. One tap adds every book in the set to your bag.`,
  },
  {
    q: "How much do book sets cost?",
    a: `Sets start at ₹${minPrice}. Each set page shows the set price next to the books' combined MRP so you can see exactly how much you save.`,
  },
  {
    q: "Which author collections are available?",
    a: `${authorSets.map((c) => c.title).join(", ")}.`,
  },
  {
    q: "Is Cash on Delivery available on book sets?",
    a: `Yes. Pay by UPI or choose Cash on Delivery anywhere in India. Delivery is free on orders from ₹${FREE_DELIVERY_MIN}, and wrong or damaged copies are replaced within 7 days.`,
  },
  {
    q: "Can I mix a book set with other books?",
    a: "Yes. Adding a set keeps everything already in your bag, so you can add more books or 2-book combos before checkout.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": PAGE_URL,
        url: PAGE_URL,
        name: "Book Sets — 3 & 4 Book Bundles",
        isPartOf: { "@type": "WebSite", name: "TheBookX", url: SITE },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        mainEntity: { "@id": `${PAGE_URL}#sets` },
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#sets`,
        name: "TheBookX book sets",
        numberOfItems: mixedBookSets.length,
        itemListElement: mixedBookSets.map((c, i) => {
          const books = getComboBooks(c);
          const { price, mrp } = getComboPricing(c);
          return {
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE}/combos/${c.slug}`,
            item: {
              "@type": "Product",
              "@id": `${SITE}/combos/${c.slug}#product`,
              name: `${c.title} (Set of ${books.length} Books)`,
              url: `${SITE}/combos/${c.slug}`,
              image: [`${SITE}/combos/${c.slug}/opengraph-image`, ...books.map((b) => abs(b.image)).filter(Boolean)],
              description: c.seoDescription || c.tagline,
              category: `Books > Book Sets > ${c.category}`,
              brand: { "@type": "Brand", name: "TheBookX" },
              sku: c.id,
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price,
                priceSpecification: [
                  { "@type": "UnitPriceSpecification", price, priceCurrency: "INR" },
                  { "@type": "UnitPriceSpecification", priceType: "https://schema.org/StrikethroughPrice", price: mrp, priceCurrency: "INR" },
                ],
                availability: books.every((b) => b.stock !== 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                url: `${SITE}/combos/${c.slug}`,
              },
            },
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { name: "Home", item: SITE },
          { name: "Combo Offers", item: `${SITE}/combos` },
          { name: "Book Sets", item: PAGE_URL },
        ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}

export default function BookSetsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <CombosClient
        items={mixedBookSets}
        eyebrow="Book sets"
        heading="Book Sets — 3 & 4 Books, One Tap"
        intro={`${bookSets.length} handpicked sets across ${cats.length} genres and author collections, from ₹${minPrice}. Every set adds all its books to your bag in one tap, with Cash on Delivery and free delivery from ₹${FREE_DELIVERY_MIN}. Want just two? See our 2-book combos at 10% off.`}
      >
        <section className="sets-seo">
          <h2>Shop book sets by genre</h2>
          <ul className="sets-seo-links">
            {cats.map((cat) => {
              const list = mixedBookSets.filter((c) => c.category === cat);
              return (
                <li key={cat}>
                  <strong>{cat}</strong>
                  <span>
                    {list.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && " · "}
                        <Link href={`/combos/${c.slug}`}>{c.title}</Link>
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="sets-seo-more">
            Looking for two books instead? <Link href="/combos">Browse 2-book combos at 10% off</Link>.
          </p>

          <h2>Book sets — frequently asked questions</h2>
          <div className="cd-faq">
            {faqs.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </CombosClient>
      <CartBar />
    </>
  );
}
