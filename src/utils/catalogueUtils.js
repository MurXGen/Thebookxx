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
    fiction: "#3b82f6",
    "non-fiction": "#0ea5e9",
    romance: "#ec4899",
    thriller: "#ef4444",
    "fantasy-scifi": "#8b5cf6",
    "self-help": "#a855f7",
    business: "#06b6d4",
    finance: "#10b981",
    psychology: "#6366f1",
    biography: "#14b8a6",
    history: "#78716c",
    spirituality: "#f59e0b",
    children: "#f472b6",
    "young-adult": "#fb7185",
    humor: "#fbbf24",
    "science-tech": "#0891b2",
    health: "#22c55e",
    sports: "#84cc16",
    set: "#94a3b8",
    trending: "#f97316",
    bestseller: "#eab308",
  };
  return colorMap[category] || "#9ca3af";
};

// Get emoji for category (matching the component styles)
export const getCategoryEmoji = (category) => {
  const emojiMap = {
    fiction: "📖",
    "non-fiction": "📚",
    romance: "💖",
    thriller: "🔪",
    "fantasy-scifi": "🐉",
    "self-help": "🧠",
    business: "📊",
    finance: "💰",
    psychology: "🧩",
    biography: "👤",
    history: "📜",
    spirituality: "🕉️",
    children: "🧸",
    "young-adult": "✨",
    humor: "😄",
    "science-tech": "🔬",
    health: "🌿",
    sports: "⚽",
    set: "📦",
    trending: "📈",
    bestseller: "🏆",
  };
  return emojiMap[category] || "📘";
};

// Get formatted label for category
export const getCategoryLabel = (category) => {
  const labelMap = {
    fiction: "Fiction",
    "non-fiction": "Non-Fiction",
    romance: "Romance",
    thriller: "Thriller & Mystery",
    "fantasy-scifi": "Fantasy & Sci-Fi",
    "self-help": "Self-Help",
    business: "Business",
    finance: "Finance",
    psychology: "Psychology",
    biography: "Biography & Memoir",
    history: "History & Politics",
    spirituality: "Spirituality & Myth",
    children: "Children",
    "young-adult": "Young Adult",
    humor: "Humor",
    "science-tech": "Science & Tech",
    health: "Health & Wellness",
    sports: "Sports",
    set: "Box Sets",
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
