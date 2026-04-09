// app/sitemap.js
import { books } from "@/utils/book";

// Helper function to slugify book names
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to get full image URL
function getFullImageUrl(imagePath, baseUrl) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${baseUrl}${imagePath}`;
  return `${baseUrl}/books/${imagePath}`;
}

// Get last modified date from book (using a consistent date for now)
// In production, you'd use actual book update timestamps
const getLastModified = (book) => {
  // If your books have an updatedAt field, use that
  // Otherwise use current date to force recrawl
  return book.updatedAt ? new Date(book.updatedAt) : new Date();
};

export default async function sitemap() {
  const baseUrl = "https://thebookx.in";
  const now = new Date();

  // Get unique categories
  const allCategories = [
    ...new Set(books.flatMap((book) => book.catalogue || [])),
  ];

  // Static routes with higher priority for main pages
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refunds`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic routes for all books - using current date to force recrawl
  const bookRoutes = books.map((book) => {
    const bookSlug = slugify(book.name);
    const route = {
      url: `${baseUrl}/books/${bookSlug}`,
      lastModified: now, // Use current date to encourage recrawling
      changeFrequency: "daily", // Changed from weekly to daily for faster indexing
      priority: 0.9,
    };

    // Add image if book.image exists
    if (book.image) {
      const fullImageUrl = getFullImageUrl(book.image, baseUrl);
      route.images = [fullImageUrl];
    }

    return route;
  });

  // Category routes
  const categoryRoutes = allCategories.map((category) => {
    const categorySlug = slugify(category);
    return {
      url: `${baseUrl}/category/${categorySlug}`,
      lastModified: now,
      changeFrequency: "daily", // Changed from weekly to daily
      priority: 0.8,
    };
  });

  // Add paginated routes if you have pagination
  const totalBooks = books.length;
  const booksPerPage = 20;
  const totalPages = Math.ceil(totalBooks / booksPerPage);

  const paginatedRoutes = [];
  for (let i = 1; i <= totalPages; i++) {
    paginatedRoutes.push({
      url: `${baseUrl}/books?page=${i}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return [
    ...staticRoutes,
    ...bookRoutes,
    ...categoryRoutes,
    ...paginatedRoutes,
  ];
}
