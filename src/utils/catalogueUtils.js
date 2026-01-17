import { books } from "./book";

// Function to extract all unique categories from books
export const getAllUniqueCategories = () => {
  const allCategories = new Set();

  books.forEach((book) => {
    book.catalogue.forEach((category) => {
      allCategories.add(category);
    });
  });

  return Array.from(allCategories);
};

// Function to get books by category
export const getBooksByCategory = (category) => {
  return books.filter((book) => book.catalogue.includes(category));
};

// Function to get catalogue card data with icons
export const getCatalogueData = () => {
  const uniqueCategories = getAllUniqueCategories();

  // Map category names to icons (you can customize this)
  const categoryIcons = {
    // Self-help & Personal Development
    "self-help": "💪",
    "self-improvement": "📈",
    "personal-growth": "🌱",
    mindset: "🧠",
    productivity: "⚡",

    // Psychology & Mental Health
    psychology: "🧠",
    "mental-health": "🧘",
    mindfulness: "🌸",
    emotional: "💖",
    "stress-management": "😌",
    anxiety: "😥",
    wellness: "🌿",
    healing: "❤️🩹",
    "emotional-intelligence": "🤝",

    // Finance & Business
    finance: "💰",
    "money-management": "💳",
    business: "💼",
    entrepreneurship: "🚀",
    leadership: "👑",

    // Fiction & Literature
    fiction: "📖",
    novel: "📚",
    romance: "💕",
    thriller: "🔪",
    mystery: "🔍",
    suspense: "🎭",
    contemporary: "🏙️",
    "historical-fiction": "🏛️",
    mythology: "🏺",
    "indian-literature": "🇮🇳",
    "japanese-literature": "🇯🇵",
    "slice-of-life": "🍵",

    // Relationships & Social
    relationships: "💑",
    friendship: "👫",
    dating: "💘",
    breakup: "💔",
    communication: "💬",

    // Special Categories
    trending: "🔥",
    bestseller: "🏆",
    series: "📚📚",
    "true-crime": "🕵️",
    criminology: "🔍",
    philosophy: "🤔",
    sociology: "👥",
    "human-behavior": "👤",
    "power-dynamics": "⚔️",
    strategy: "♟️",
    personality: "🎭",
    "body-language": "👀",
    "behavioral-economics": "📊",
    adlerian: "🎯",
    cbt: "📝",
    solitude: "🌌",
    "modern-life": "📱",
    spirituality: "✨",
    "life-advice": "💡",
    poetry: "✍️",
    biography: "📓",
    "non-fiction": "📰",

    // Fallback icons
    default: "📚",
  };

  return uniqueCategories
    .map((category) => ({
      key: category,
      label: formatCategoryLabel(category),
      icon: categoryIcons[category] || categoryIcons["default"],
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
