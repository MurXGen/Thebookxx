// components/CategoryBooks.jsx
import ProductCard from "@/components/BookCard";
import { books } from "@/utils/book";
import HorizontalScroll from "./UI/HorizontalScroll";

const categoryConfig = {
  business: {
    title: "📈 Business & Finance",
    keywords: [
      "business",
      "finance",
      "entrepreneurship",
      "investing",
      "economics",
      "management",
    ],
    icon: "📈",
    className: "business-section",
  },
  selfhelp: {
    title: "💪 Self-Help & Motivation",
    keywords: [
      "self-help",
      "selfhelp",
      "motivation",
      "personal development",
      "inspirational",
      "mindset",
    ],
    icon: "💪",
    className: "selfhelp-section",
  },
  romance: {
    title: "💕 Romance Novels",
    keywords: ["romance", "love", "romantic", "relationship", "fiction"],
    icon: "💕",
    className: "romance-section",
  },
  trending: {
    title: "🔥 Trending Books",
    keywords: ["trending", "bestseller", "popular", "hot"],
    icon: "🔥",
    className: "trending-section",
  },
};

export default function CategoryBooks({ category = "trending" }) {
  const config = categoryConfig[category];

  if (!config) return null;

  const filteredBooks = books.filter((book) => {
    // Handle catalogue which could be string, array, or undefined
    let catalogueString = "";

    if (book.catalogue) {
      if (Array.isArray(book.catalogue)) {
        // If it's an array, join all items into a string
        catalogueString = book.catalogue.join(",").toLowerCase();
      } else if (typeof book.catalogue === "string") {
        // If it's a string, use it directly
        catalogueString = book.catalogue.toLowerCase();
      }
    }

    const nameLower = book.name?.toLowerCase() || "";

    // Check if any keyword matches either catalogue or name
    return config.keywords.some(
      (keyword) =>
        catalogueString.includes(keyword) || nameLower.includes(keyword),
    );
  });

  if (!filteredBooks.length) return null;

  return (
    <section
      className={`catalogue-section-2 ${config.className} sparkleContainer`}
      style={{ marginTop: "24px" }}
    >
      <HorizontalScroll title={config.title}>
        {filteredBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </HorizontalScroll>
    </section>
  );
}
