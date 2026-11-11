// app/book-sets/page.jsx — box sets & series sets (server-rendered for SEO).
import Link from "next/link";
import CategoryListing from "@/components/CategoryListing";
import { BOX_SETS, BOX_SET_GENRES } from "@/utils/boxSets";
import { FREE_DELIVERY_MIN, slugify } from "@/lib/bookSeo";

const SITE = "https://www.thebookx.in";
const PAGE_URL = `${SITE}/book-sets`;
const abs = (src) => (!src ? undefined : src.startsWith("http") ? src : `${SITE}${src}`);
const bookUrl = (b) => `${SITE}/books/${slugify(b.name)}`;
const shortName = (n) => String(n).replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();

const minPrice = Math.min(...BOX_SETS.map((b) => b.discountedPrice));
const top = BOX_SETS.slice(0, 6).map((b) => shortName(b.name));

export const metadata = {
  // " | TheBookX" is appended by the root title template.
  title: `Book Box Sets Online India — ${BOX_SETS.length} Complete Series Sets from ₹${minPrice}`,
  description: `Buy book box sets and complete series sets online in India: ${top.join(", ")} and more. ${BOX_SETS.length} sets from ₹${minPrice} with Cash on Delivery, free delivery from ₹${FREE_DELIVERY_MIN} and 7-day replacement.`,
  keywords: [
    "book box set",
    "book box sets India",
    "book sets online",
    "complete book series set",
    "series box set",
    "buy box set books online",
    "trilogy box set",
    "manga box set India",
    ...BOX_SETS.slice(0, 20).map((b) => `${shortName(b.name)} price`),
    "TheBookX book sets",
  ].join(", "),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `Book Box Sets — ${BOX_SETS.length} Complete Series from ₹${minPrice} | TheBookX`,
    description: `${top.slice(0, 4).join(", ")} and more complete series sets. Cash on Delivery across India.`,
    url: PAGE_URL,
    siteName: "TheBookX",
    type: "website",
    locale: "en_IN",
    images: BOX_SETS.slice(0, 1).map((b) => ({ url: abs(b.image), alt: `${b.name} box set` })),
  },
  twitter: { card: "summary_large_image", title: `Book Box Sets from ₹${minPrice} | TheBookX` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const faqs = [
  {
    q: "What book box sets can I buy on TheBookX?",
    a: `${BOX_SETS.length} complete series and box sets, including ${BOX_SETS.slice(0, 10)
      .map((b) => shortName(b.name))
      .join(", ")}.`,
  },
  {
    q: "How much does a book box set cost?",
    a: `Box sets start at ₹${minPrice}. Every set shows its price next to the MRP, so you can see the saving before you add it to your bag.`,
  },
  {
    q: "Is a box set one product or several books?",
    a: "Each box set is a single item that contains every book in the series, packed and shipped together in one parcel.",
  },
  {
    q: "Is Cash on Delivery available on box sets?",
    a: `Yes. Pay by UPI or choose Cash on Delivery anywhere in India. Delivery is free on orders from ₹${FREE_DELIVERY_MIN}, and wrong or damaged copies are replaced within 7 days.`,
  },
  {
    q: "Are these box sets original?",
    a: "Yes. All box sets are brand-new genuine copies, packed securely for delivery.",
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
        name: "Book Box Sets & Complete Series Sets",
        isPartOf: { "@id": `${SITE}/#website` },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        mainEntity: { "@id": `${PAGE_URL}#sets` },
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#sets`,
        name: "Book box sets at TheBookX",
        numberOfItems: BOX_SETS.length,
        itemListElement: BOX_SETS.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: bookUrl(b),
          name: b.name,
          image: abs(b.image),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { name: "Home", item: SITE },
          { name: "Books", item: `${SITE}/books` },
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
      <CategoryListing
        books={BOX_SETS}
        displayName="Book Sets"
        slug="set"
        heading="Book Box Sets & Complete Series"
        crumbs={[{ label: "Books", href: "/books" }, { label: "Book Sets" }]}
      >
        <section className="section-1200 sets-seo">
          <p className="sets-seo-intro">
            Get the whole series in one box. {BOX_SETS.length} box sets from ₹{minPrice} —
            fantasy, romance, thrillers, manga, children&apos;s favourites and Indian mythology —
            with Cash on Delivery and free delivery from ₹{FREE_DELIVERY_MIN}. Want two
            bestsellers instead? <Link href="/combos">See 2-book combos at 10% off</Link>.
          </p>

          <h2>Shop box sets by genre</h2>
          <ul className="sets-seo-links">
            {BOX_SET_GENRES.map((g) => (
              <li key={g.key}>
                <strong>{g.label}</strong>
                <span>
                  {g.books.map((b, i) => (
                    <span key={b.id}>
                      {i > 0 && " · "}
                      <Link href={`/books/${slugify(b.name)}`}>{shortName(b.name)}</Link>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>

          <h2>Book box sets — frequently asked questions</h2>
          <div className="cd-faq">
            {faqs.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </CategoryListing>
    </>
  );
}
