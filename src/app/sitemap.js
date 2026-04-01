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

  // Remove any leading slash to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // If the path already includes 'bookImages' or 'images', use as is
  if (cleanPath.includes("bookImages") || cleanPath.includes("images")) {
    return `${baseUrl}/${cleanPath}`;
  }

  // Default: assume images are in the bookImages directory
  // Adjust this based on your actual image folder structure
  return `${baseUrl}/bookImages/${cleanPath}`;
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

  // Dynamic routes for all books with corrected image URLs
  const bookRoutes = books.map((book) => {
    const bookSlug = slugify(book.name);
    const fullImageUrl = getFullImageUrl(book.image, baseUrl);

    const route = {
      url: `${baseUrl}/books/${bookSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    };

    // Only add images property if image exists
    if (fullImageUrl) {
      route.images = [fullImageUrl];

      // Optional: Add image title and caption for better SEO
      route.imageTitle = `${book.name} book cover - Buy at TheBookX`;
      route.imageCaption = `Shop ${book.name} by ${book.author || "Various Authors"} online at TheBookX. Free shipping across India.`;
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
