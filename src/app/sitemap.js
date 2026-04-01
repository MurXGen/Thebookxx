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

  // If already absolute URL
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If path starts with / (relative path)
  if (imagePath.startsWith("/")) {
    return `${baseUrl}${imagePath}`;
  }

  // If just filename, construct path to /books/
  return `${baseUrl}/books/${imagePath}`;
}

export default async function sitemap() {
  const baseUrl = "https://thebookx.in";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refunds`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic routes for all books
  const bookRoutes = books.map((book) => {
    const bookSlug = slugify(book.name);

    const route = {
      url: `${baseUrl}/books/${bookSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    };

    // Add image if book.image exists
    // book.image should already be like "/books/the-art-of-spending-money.jpeg"
    if (book.image) {
      const fullImageUrl = getFullImageUrl(book.image, baseUrl);
      route.images = [fullImageUrl];
    }

    return route;
  });

  // Get unique categories
  const allCategories = [
    ...new Set(books.flatMap((book) => book.catalogue || [])),
  ];

  const categoryRoutes = allCategories.map((category) => {
    const categorySlug = slugify(category);
    return {
      url: `${baseUrl}/category/${categorySlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...bookRoutes, ...categoryRoutes];
}
