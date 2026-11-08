// Shared book-page data: used by the server page (metadata + JSON-LD, so
// crawlers get everything in the first HTML) and by the client page (so the
// visible FAQ, rating and related lists match the structured data exactly).

import { books } from "@/utils/book";
import { getReviewsByBook, getAverageRating } from "@/utils/reviews";
import { BASE_FREE_BOOKMARKS } from "@/utils/orderRewards";

export const SITE = "https://www.thebookx.in";
export const FREE_DELIVERY_MIN = 199; // mirrors getDeliveryCharge (normal carts)

// Offer deadline for the countdown on book pages. Set a REAL end time here
// (site-wide sale) or as `offerEndsAt` on a book, e.g. "2026-11-15T23:59:00+05:30".
// When the time passes the timer disappears. Leave null for no timer.
export const SALE_ENDS_AT = null;

export function offerEndFor(book) {
  const raw = book.offerEndsAt || SALE_ENDS_AT;
  const t = raw ? new Date(raw).getTime() : NaN;
  return Number.isFinite(t) && t > Date.now() ? t : null;
}

export function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const titleCase = (s) =>
  String(s || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const bookUrl = (book) => `${SITE}/books/${slugify(book.name)}`;
export const authorPath = (book) =>
  `/author/${book.authorSlug || slugify(book.author)}`;

// Series tagging: when a volume's own title doesn't name its series, carry
// the series into titles and schema so "<series> <volume>" searches find it.
export function seoNameOf(book) {
  const inName =
    book.series && book.name.toLowerCase().includes(book.series.toLowerCase());
  const seriesTag = book.series && !inName ? book.series : "";
  return { seriesTag, seoName: seriesTag ? `${book.name} (${seriesTag})` : book.name };
}

export function discountOf(book) {
  const mrp = Number(book.originalPrice) || 0;
  const price = Number(book.discountedPrice) || 0;
  const save = mrp > price ? mrp - price : 0;
  return { mrp, price, save, pct: save ? Math.round((save / mrp) * 100) : 0 };
}

function hash(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

// Ratings: real reviews when a title has them. Otherwise the stable fallback
// numbers the site already showed; `real` tells the schema whether it may
// publish them (Google only allows ratings backed by genuine reviews).
export function ratingOf(book) {
  const reviews = getReviewsByBook(book.id);
  const real = reviews.length > 0;
  const rating = real
    ? Number(getAverageRating(reviews))
    : book.rating || Number((4 + (hash(book.id) % 10) / 10).toFixed(1));
  const count = real
    ? Math.max(reviews.length, book.reviewCount || 0)
    : book.reviewCount || (hash(book.id) % 281) + 20;
  return { reviews, real, rating, count };
}

// One-line summary of what the book is: the first sentence of the blurb,
// minus the store boilerplate some descriptions carry.
export function aboutLine(book) {
  const first = String(book.description || "")
    .split(/(?<=[.!?])\s+/)
    .find((s) => !/thebookx|delivers|shipped|grab your copy|₹/i.test(s));
  return first ? first.trim() : "";
}

export function relatedOf(book, limit = 30) {
  if (!book.catalogue?.length) return [];
  return books
    .filter((b) => b.id !== book.id && b.stock !== 0 && b.catalogue?.some((c) => book.catalogue.includes(c)))
    .slice(0, limit);
}

export function moreByAuthor(book, limit = 8) {
  if (!book.author) return [];
  const a = book.author.toLowerCase();
  return books
    .filter((b) => b.id !== book.id && b.author && b.author.toLowerCase() === a)
    .slice(0, limit);
}

// "Frequently bought together": The Art of Clarity pairs with Atomic Habits,
// other self-help titles pair with The Art of Clarity, the rest with a
// related book.
export function companionOf(book, related = relatedOf(book)) {
  const ART = books.find((b) => b.id === "bk-002");
  const ATOMIC = books.find((b) => b.id === "bk-005");
  if (book.id === "bk-002") return ATOMIC || related[0] || null;
  if (book.catalogue?.includes("self-help"))
    return (ART && ART.id !== book.id ? ART : ATOMIC) || related[0] || null;
  return related[0] || null;
}

// Visible FAQ + FAQPage schema share this list. Answers stay factual and in
// line with the real delivery rules (free above ₹199, COD fee applies).
export function faqsOf(book) {
  const { price, mrp, pct } = discountOf(book);
  const by = book.author ? ` by ${book.author}` : "";
  const about = aboutLine(book);
  const freeLine =
    price >= FREE_DELIVERY_MIN
      ? `Delivery is free for this book`
      : `Delivery is free on orders above ₹${FREE_DELIVERY_MIN}`;
  const list = [
    {
      q: `What is the price of ${book.name}?`,
      a: `${book.name}${by} costs ₹${price} on TheBookX${
        pct ? `, ${pct}% off the ₹${mrp} MRP` : ""
      }. ${freeLine}, and every order includes ${BASE_FREE_BOOKMARKS} free bookmarks.`,
    },
    about && {
      q: `What is ${book.name} about?`,
      a: about,
    },
    book.author && {
      q: `Who wrote ${book.name}?`,
      a: `${book.name} is written by ${book.author}.${
        book.pages ? ` The ${String(book.size || "paperback").toLowerCase()} edition runs ${book.pages} pages` : ""
      }${book.language ? ` in ${book.language}.` : book.pages ? "." : ""}`,
    },
    {
      q: `How fast is delivery for ${book.name}?`,
      a: `Orders ship within a day. Most of India receives them in 4–9 days, Maharashtra in 1–5 days, and Faster delivery brings it to 1–6 days. ${freeLine}.`,
    },
    {
      q: `Can I buy ${book.name} with Cash on Delivery?`,
      a: `Yes. You can pay by UPI or choose Cash on Delivery at checkout (a small COD fee applies).`,
    },
    {
      q: `Is this an original copy, and can I return it?`,
      a: `Every copy is new and genuine, packed in protective wrapping. If something is wrong you can return it within 7 days of delivery.`,
    },
  ];
  return list.filter(Boolean);
}

// The full JSON-LD graph for a book page, rendered on the server.
export function bookJsonLd(book) {
  const url = bookUrl(book);
  const { seoName, seriesTag } = seoNameOf(book);
  const { price } = discountOf(book);
  const r = ratingOf(book);
  const cat = book.catalogue?.[0];
  const related = relatedOf(book, 10);
  const inStock = book.stock !== 0;

  const product = {
    "@type": ["Product", "Book"],
    "@id": `${url}#book`,
    url,
    name: seoName,
    ...(seriesTag && {
      alternateName: book.name,
      isPartOf: { "@type": "BookSeries", name: seriesTag },
    }),
    description: aboutLine(book) || book.description,
    image: book.image ? [book.image] : undefined,
    sku: book.id,
    mpn: book.id,
    ...(book.isbn && { isbn: book.isbn, gtin13: book.isbn }),
    brand: { "@type": "Brand", name: book.author || "TheBookX" },
    author: { "@type": "Person", name: book.author || "Various Authors" },
    ...(book.pages && /^\d+$/.test(String(book.pages)) && { numberOfPages: Number(book.pages) }),
    inLanguage: book.language || "English",
    bookFormat: `https://schema.org/${/hard/i.test(book.size || "") ? "Hardcover" : "Paperback"}`,
    ...(cat && { genre: titleCase(cat), category: `Books > ${titleCase(cat)}` }),
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: "INR",
      price,
      priceValidUntil: "2027-12-31",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE}/#organization` },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnPolicyUrl: `${SITE}/refund`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: price >= FREE_DELIVERY_MIN ? 0 : 69,
          currency: "INR",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 9, unitCode: "DAY" },
        },
      },
    },
    // How an AI assistant can order this book for a user (no login).
    potentialAction: {
      "@type": "BuyAction",
      name: "Order via a one-tap order link (no login)",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/order?books=${book.id}:{qty}&name={name}&phone={phone}&pincode={pincode}&address={address}`,
      },
    },
    // Ratings only when backed by genuine reviews.
    ...(r.real && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: r.rating,
        reviewCount: r.count,
        bestRating: 5,
        worstRating: 1,
      },
      review: r.reviews.slice(0, 10).map((rv) => ({
        "@type": "Review",
        author: { "@type": "Person", name: rv.reviewerName },
        datePublished: new Date(rv.date).toString() !== "Invalid Date"
          ? new Date(rv.date).toISOString().slice(0, 10)
          : undefined,
        reviewBody: rv.comment,
        reviewRating: { "@type": "Rating", ratingValue: rv.rating, bestRating: 5, worstRating: 1 },
      })),
    }),
  };

  const crumbs = [
    { name: "Home", item: SITE },
    { name: "Books", item: `${SITE}/books` },
    ...(cat ? [{ name: titleCase(cat), item: `${SITE}/category/${cat}` }] : []),
    { name: book.name, item: url },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "TheBookX",
        url: SITE,
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${seoName}${book.author ? ` by ${book.author}` : ""}`,
        mainEntity: { "@id": `${url}#book` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: book.image || undefined,
      },
      product,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.item,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqsOf(book).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      ...(related.length
        ? [
            {
              "@type": "ItemList",
              "@id": `${url}#related`,
              name: `Books like ${book.name}`,
              itemListElement: related.map((b, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: bookUrl(b),
                name: b.name,
              })),
            },
          ]
        : []),
    ],
  };
}
