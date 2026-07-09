// app/combos/page.jsx — Combo offers landing page (server component for SEO)
import Navbar from "@/components/Navbar";
import CartBar from "@/components/CartBar";
import CombosClient from "./CombosClient";
import { combos, getComboBooks, getComboPricing } from "@/utils/combos";

const PAGE_URL = "https://www.thebookx.in/combos";

export async function generateMetadata() {
  // Root layout appends " | TheBookX" via the title template.
  const title =
    "Book Combo Offers — Buy 3+ Books from ₹1 | Bestseller, Romance & More";
  const description = `Shop ${combos.length}+ curated book combos on TheBookX. Bundles of 3–4 handpicked books across bestsellers, romance, thrillers, business, self-help and author collections — added to your cart in one tap. Lowest prices online, books from ₹1, free delivery, Cash on Delivery and easy 7-day returns across India.`;

  return {
    title,
    description,
    keywords:
      "book combos, book bundles, combo offers, buy books online, book set offers, bestseller book bundle, romance book combo, thriller book bundle, self-help book pack, business books combo, author collection books, cheap books online India, books from ₹1, TheBookX combos",
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title: "Book Combo Offers — Buy 3+ Books & Save Big | TheBookX",
      description,
      url: PAGE_URL,
      siteName: "TheBookX",
      type: "website",
      images: [
        {
          url: "https://www.thebookx.in/books/manifest.png",
          width: 1200,
          height: 630,
          alt: "TheBookX book combo offers",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Book Combo Offers from ₹1 | TheBookX",
      description,
    },
    robots: { index: true, follow: true },
  };
}

function buildJsonLd() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TheBookX Book Combo Offers",
    description:
      "Curated multi-book combo bundles across every genre, available at the lowest prices on TheBookX.",
    numberOfItems: combos.length,
    itemListElement: combos.map((combo, i) => {
      const { price } = getComboPricing(combo);
      const books = getComboBooks(combo);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: `${combo.title} (Combo of ${books.length} Books)`,
          description: combo.seoDescription,
          category: combo.category,
          brand: { "@type": "Brand", name: "TheBookX" },
          url: `${PAGE_URL}#${combo.slug}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: String(price),
            availability: "https://schema.org/InStock",
            url: PAGE_URL,
          },
        },
      };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.thebookx.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Combo Offers",
        item: PAGE_URL,
      },
    ],
  };

  return [itemList, breadcrumb];
}

export default function CombosPage() {
  const jsonLd = buildJsonLd();
  return (
    <>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <Navbar />
      <CombosClient />
      <CartBar />
    </>
  );
}
