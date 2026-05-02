import { books } from "./book";

// Function to extract all unique categories from books
export const getAllUniqueCategories = () => {
  const allCategories = new Set();

  books.forEach((book) => {
    book.catalogue?.forEach((category) => {
      allCategories.add(category);
    });
  });

  return Array.from(allCategories);
};

// Function to get books by category
export const getBooksByCategory = (category) => {
  return books.filter((book) => book.catalogue?.includes(category));
};

// Get color for category (matching the component styles)
export const getCategoryColor = (category) => {
  const colorMap = {
    "self-help": "#8b5cf6",
    romance: "#ec4899",
    fiction: "#3b82f6",
    thriller: "#ef4444",
    mystery: "#6b7280",
    mythology: "#f59e0b",
    biography: "#14b8a6",
    history: "#78716c",
    finance: "#10b981",
    business: "#06b6d4",
    psychology: "#a855f7",
    philosophy: "#6366f1",
    classic: "#78350f",
    fantasy: "#8b5cf6",
    science: "#0891b2",
    trending: "#f97316",
    bestseller: "#eab308",
  };
  return colorMap[category] || "#9ca3af";
};

// Get emoji for category (matching the component styles)
export const getCategoryEmoji = (category) => {
  const emojiMap = {
    "self-help": "🧠",
    romance: "💖",
    fiction: "📖",
    thriller: "🔪",
    mystery: "🕵️",
    mythology: "🏛️",
    biography: "👤",
    history: "📜",
    finance: "💰",
    business: "📊",
    psychology: "🧠",
    philosophy: "💭",
    classic: "📚",
    fantasy: "🐉",
    science: "🔬",
    trending: "📈",
    bestseller: "🏆",
  };
  return emojiMap[category] || "📘";
};

// Get formatted label for category
export const getCategoryLabel = (category) => {
  const labelMap = {
    "self-help": "Self Help",
    romance: "Romance",
    fiction: "Fiction",
    thriller: "Thriller",
    mystery: "Mystery",
    mythology: "Mythology",
    biography: "Biography",
    history: "History",
    finance: "Finance",
    business: "Business",
    psychology: "Psychology",
    philosophy: "Philosophy",
    classic: "Classics",
    fantasy: "Fantasy",
    science: "Science",
    trending: "Trending",
    bestseller: "Bestseller",
  };
  return labelMap[category] || formatCategoryLabel(category);
};

// Function to get catalogue card data
export const getCatalogueData = () => {
  const uniqueCategories = getAllUniqueCategories();

  return uniqueCategories
    .map((category) => ({
      key: category,
      label: getCategoryLabel(category),
      emoji: getCategoryEmoji(category),
      color: getCategoryColor(category),
      count: getBooksByCategory(category).length,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count (most books first)
};

// Format category label for display (capitalize and add spaces)
const formatCategoryLabel = (category) => {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
