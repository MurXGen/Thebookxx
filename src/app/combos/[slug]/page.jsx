// app/combos/[slug]/page.jsx — combo detail page (server-rendered for SEO).
// Mirrors the book-page SEO: price-led title, product Open Graph tags,
// Product + Offer + Breadcrumb + FAQ + ItemList JSON-LD in the first HTML.
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ComboDetailClient from "./ComboDetailClient";
import {
  combos,
  getComboBySlug,
  getComboBooks,
  getComboPricing,
} from "@/utils/combos";
import { SITE, slugify, FREE_DELIVERY_MIN } from "@/lib/bookSeo";

const abs = (src) => (!src ? undefined : src.startsWith("http") ? src : `${SITE}${src}`);
const comboUrl = (c) => `${SITE}/combos/${c.slug}`;

export function generateStaticParams() {
  return combos.map((c) => ({ slug: c.slug }));
}

function seoBits(combo) {
  const items = getComboBooks(combo);
  const p = getComboPricing(combo);
  const names = items.map((b) => b.name);
  const authors = [...new Set(items.map((b) => b.author).filter(Boolean))];
  return { items, ...p, names, authors };
}

function faqsFor(combo) {
  const { items, price, sum, comboOff, mrp, names } = seoBits(combo);
  const list = names.join(" and ");
  const isPair = !!combo.discountPct;
  return [
    {
      q: `What is the price of the ${combo.title} combo?`,
      a: isPair
        ? `The ${combo.title} combo costs ₹${price} on TheBookX. Bought separately the two books cost ₹${sum}, so the combo saves you ₹${comboOff} (10% off), and ₹${mrp - price} off the ₹${mrp} MRP.`
        : `The ${combo.title} combo costs ₹${price} on TheBookX (MRP ₹${mrp}).`,
    },
    {
      q: `Which books are included?`,
      a: `${items.length} paperbacks: ${items
        .map((b) => `${b.name}${b.author ? ` by ${b.author}` : ""}`)
        .join("; ")}.`,
    },
    {
      q: `How do I get the 10% combo discount?`,
      a: isPair
        ? `Tap "Add combo to bag". The 10% combo discount is applied automatically in your bag whenever The Art of Clarity and ${names[1]} are in it together. No coupon code needed.`
        : `Tap "Add combo to bag" and every book in the set is added in one tap at the combo price.`,
    },
    {
      q: `Is Cash on Delivery available for this combo?`,
      a: `Yes. You can pay online by UPI or choose Cash on Delivery anywhere in India. Delivery is free on orders from ₹${FREE_DELIVERY_MIN}.`,
    },
    {
      q: `How long does delivery take?`,
      a: `Orders ship within 1–2 business days. Most metro cities receive them in 5–9 days and the rest of India in 4–12 days; Faster delivery is available at checkout.`,
    },
    {
      q: `Are these original books?`,
      a: `Yes, ${list} are brand-new genuine paperbacks, packed securely. Wrong or damaged copies are replaced within 7 days of delivery.`,
    },
  ];
}

function aboutFor(combo) {
  const { items } = seoBits(combo);
  return items
    .map((b) => {
      const d = String(b.description || "")
        .split(/(?<=\.)\s+/)
        .filter((x) => !/TheBookX|₹|Delhivery|Indian Post|shop now|contact us/i.test(x))
        .slice(0, 2)
        .join(" ");
      return d ? `${b.name}${b.author ? ` by ${b.author}` : ""}: ${d}` : "";
    })
    .filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const combo = getComboBySlug(decodeURIComponent(slug).toLowerCase());
  if (!combo) return { title: "Combo Not Found", robots: { index: false } };
  const { items, price, mrp, sum, comboOff, names, authors } = seoBits(combo);
  const url = comboUrl(combo);
  const isPair = !!combo.discountPct;

  // "| TheBookX" is appended by the root title template.
  const title = combo.seoTitle || `${combo.title} Combo: ₹${price}`;
  const description =
    combo.seoDescription ||
    `Buy ${names.join(", ")} together for ₹${price} (MRP ₹${mrp}) on TheBookX. Cash on Delivery and 7-day replacement across India.`;

  const keywords = [
    `${combo.title} combo`,
    ...names.map((n) => `${n} book`),
    ...names.map((n) => `buy ${n} online`),
    ...names.map((n) => `${n} price`),
    ...authors.map((a) => `${a} books`),
    isPair && `${names[0]} and ${names[1]}`,
    isPair && `${names[1]} combo`,
    isPair && "The Art of Clarity combo",
    isPair && "Murthy Thevar books",
    "book combo offer",
    "books combo pack",
    "self help book combo",
    "buy books online India",
    "TheBookX",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title,
    description,
    keywords,
    category: "Books",
    alternates: { canonical: url },
    openGraph: {
      title: `${combo.title} Combo — ₹${price}${isPair ? ` (Save ₹${comboOff})` : ""}`,
      description,
      url,
      siteName: "TheBookX",
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${combo.title} Combo — ₹${price}`,
      description,
    },
    other: {
      "product:brand": "TheBookX",
      "product:availability": items.every((b) => b.stock !== 0) ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:price:amount": String(price),
      "product:price:currency": "INR",
      "og:price:amount": String(price),
      "og:price:currency": "INR",
      "product:original_price:amount": String(isPair ? sum : mrp),
      "product:original_price:currency": "INR",
      "product:retailer_item_id": combo.id,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

function comboJsonLd(combo) {
  const { items, price, sum, mrp, names } = seoBits(combo);
  const url = comboUrl(combo);
  const isPair = !!combo.discountPct;
  const inStock = items.every((b) => b.stock !== 0);
  const images = [`${url}/opengraph-image`, ...items.map((b) => abs(b.image)).filter(Boolean)];

  const product = {
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: `${combo.title} (Combo of ${items.length} Books)`,
    alternateName: names.join(" + "),
    description: combo.seoDescription || combo.tagline,
    image: images,
    sku: combo.id,
    mpn: combo.id,
    brand: { "@type": "Brand", name: "TheBookX" },
    category: "Books > Book Combos",
    isRelatedTo: items.map((b) => ({ "@id": `${SITE}/books/${slugify(b.name)}#book` })),
    hasPart: items.map((b) => ({
      "@type": "Book",
      name: b.name,
      author: b.author ? { "@type": "Person", name: b.author } : undefined,
      url: `${SITE}/books/${slugify(b.name)}`,
      image: abs(b.image),
      bookFormat: "https://schema.org/Paperback",
      inLanguage: b.language || "English",
    })),
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: "INR",
      price,
      priceValidUntil: "2027-12-31",
      priceSpecification: [
        { "@type": "UnitPriceSpecification", price, priceCurrency: "INR" },
        {
          "@type": "UnitPriceSpecification",
          priceType: "https://schema.org/StrikethroughPrice",
          price: isPair ? sum : mrp,
          priceCurrency: "INR",
        },
      ],
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
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 12, unitCode: "DAY" },
        },
      },
    },
    potentialAction: {
      "@type": "BuyAction",
      name: "Order this combo via a one-tap order link (no login)",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/order?books=${items.map((b) => b.id).join(",")}&name={name}&phone={phone}&pincode={pincode}&address={address}`,
      },
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE}/#organization`, name: "TheBookX", url: SITE },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${combo.title} Combo`,
        mainEntity: { "@id": `${url}#product` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: images[0],
      },
      product,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { name: "Home", item: SITE },
          { name: "Combo Offers", item: `${SITE}/combos` },
          { name: combo.title, item: url },
        ].map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqsFor(combo).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#books`,
        name: `Books in the ${combo.title} combo`,
        itemListElement: items.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/books/${slugify(b.name)}`,
          name: b.name,
        })),
      },
    ],
  };
}

export default async function ComboDetailPage({ params }) {
  const { slug } = await params;
  const combo = getComboBySlug(decodeURIComponent(slug).toLowerCase());
  if (!combo) notFound();

  // Related: other combos from the same family (clarity pairs first).
  const related = combos
    .filter((c) => c.id !== combo.id && c.category === combo.category)
    .slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(comboJsonLd(combo)).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <ComboDetailClient
        combo={combo}
        related={related}
        faqs={faqsFor(combo)}
        about={aboutFor(combo)}
      />
    </>
  );
}
