// app/sitemap.js
import { books } from "@/utils/book";
import { authorData, getAllAuthors } from "@/utils/author";
import { reviewsData } from "@/utils/reviews";

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

// Get all authors from books data and custom author data
function getAllAuthorsFromBooks() {
  const authorMap = new Map();

  // Get authors from books
  books.forEach((book) => {
    if (book.author && !authorMap.has(book.author)) {
      authorMap.set(book.author, {
        name: book.author,
        slug: slugify(book.author),
        hasDetailedPage: book.author === "Murthy Thevar",
      });
    }
  });

  // Add detailed author data if available
  if (authorData) {
    authorMap.set(authorData.name, {
      name: authorData.name,
      slug: authorData.slug,
      hasDetailedPage: true,
      images: authorData.authorImages,
      bookCount: authorData.publishedBooks?.length || 1,
    });
  }

  return Array.from(authorMap.values());
}

// Get all unique reviewer images for sitemap
function getAllReviewerImages(baseUrl) {
  const reviewerImages = [];
  const uniqueImages = new Map();

  reviewsData.forEach((review) => {
    if (review.reviewerImage && !uniqueImages.has(review.reviewerImage)) {
      uniqueImages.set(review.reviewerImage, {
        url: review.reviewerImage.startsWith("http")
          ? review.reviewerImage
          : `${baseUrl}${review.reviewerImage}`,
        reviewerName: review.reviewerName,
        rating: review.rating,
      });
    }
  });

  return Array.from(uniqueImages.values());
}

// Get last modified date
const getLastModified = () => {
  return new Date();
};

export default async function sitemap() {
  const baseUrl = "https://thebookx.in";
  const now = getLastModified();

  // Get unique categories
  const allCategories = [
    ...new Set(books.flatMap((book) => book.catalogue || [])),
  ];

  // Get all authors
  const allAuthors = getAllAuthorsFromBooks();

  // Get all reviewer images
  const allReviewerImages = getAllReviewerImages(baseUrl);

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
      url: `${baseUrl}/author`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
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
    {
      url: `${baseUrl}/review`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Dynamic routes for all books
  const bookRoutes = books.map((book) => {
    const bookSlug = slugify(book.name);
    const route = {
      url: `${baseUrl}/books/${bookSlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    };

    if (book.image) {
      const fullImageUrl = getFullImageUrl(book.image, baseUrl);
      route.images = [fullImageUrl];
    }

    return route;
  });

  // Author routes with enhanced metadata
  const authorRoutes = allAuthors.map((author) => {
    const route = {
      url: `${baseUrl}/author/${author.slug}`,
      lastModified: now,
      changeFrequency: author.hasDetailedPage ? "daily" : "weekly",
      priority: author.hasDetailedPage ? 0.9 : 0.7,
    };

    if (author.hasDetailedPage && author.images && author.images.length > 0) {
      route.images = author.images.map((img) =>
        img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`,
      );
    }

    return route;
  });

  // Category routes
  const categoryRoutes = allCategories.map((category) => {
    const categorySlug = slugify(category);
    return {
      url: `${baseUrl}/category/${categorySlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  // Add paginated routes for books
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

  // Author image routes with new descriptive filenames
  const authorImageRoutes = [];
  if (authorData && authorData.authorImages) {
    authorData.authorImages.forEach((img) => {
      authorImageRoutes.push({
        url: `${baseUrl}/author/${authorData.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        images: [`${baseUrl}${img.url}`],
      });
    });
  }

  // Reviewer image routes for Google Image Search
  const reviewerImageRoutes = allReviewerImages.map((reviewer) => ({
    url: `${baseUrl}/author/${authorData?.slug || "murthy-thevar"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
    images: [reviewer.url],
  }));

  return [
    ...staticRoutes,
    ...bookRoutes,
    ...authorRoutes,
    ...categoryRoutes,
    ...paginatedRoutes,
    ...authorImageRoutes,
    ...reviewerImageRoutes,
  ];
}
