// app/sitemap.js
import { books } from "@/utils/book";

// Helper function to slugify book names (same as in your components)
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function sitemap() {
  const baseUrl = "https://thebookx.in";

  // Static routes (pages that don't change)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // {
    //   url: `${baseUrl}/books`,
    //   lastModified: new Date(),
    //   changeFrequency: "daily",
    //   priority: 0.9,
    // },
    // {
    //   url: `${baseUrl}/categories`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.8,
    // },
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
  ];

  // Dynamic routes for all books
  const bookRoutes = books.map((book) => {
    const bookSlug = slugify(book.name);
    return {
      url: `${baseUrl}/books/${bookSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      // Optional: Add images for Google Image Search
      images: book.image ? [book.image] : [],
    };
  });

  // Get unique categories from all books for category pages
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
