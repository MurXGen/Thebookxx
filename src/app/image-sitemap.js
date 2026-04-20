// app/image-sitemap.js
import { authorData } from "@/utils/author";
import { books } from "@/utils/book";

function getFullImageUrl(imagePath, baseUrl) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${baseUrl}${imagePath}`;
  return `${baseUrl}/books/${imagePath}`;
}

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function imageSitemap() {
  const baseUrl = "https://thebookx.in";
  const now = new Date();

  const imageEntries = [];

  // Add author images
  if (authorData && authorData.authorImages) {
    authorData.authorImages.forEach((img, index) => {
      imageEntries.push({
        url: `${baseUrl}/author/${authorData.slug}`,
        lastModified: now,
        images: [
          {
            loc: `${baseUrl}${img.url}`,
            title: img.alt || `${authorData.name} - ${img.caption}`,
            caption: img.caption,
            geo_location: "Mumbai, India",
            license: "https://thebookx.in",
          },
        ],
      });
    });
  }

  // Add book cover images
  books.forEach((book) => {
    if (book.image) {
      imageEntries.push({
        url: `${baseUrl}/books/${slugify(book.name)}`,
        lastModified: now,
        images: [
          {
            loc: getFullImageUrl(book.image, baseUrl),
            title: `${book.name} book cover by ${book.author || "Unknown"}`,
            caption: `Buy ${book.name} online at TheBookX - ${book.description?.substring(0, 100)}`,
            geo_location: "India",
            license: "https://thebookx.in",
          },
        ],
      });
    }
  });

  // Add reviewer images from reviews
  const { reviewsData } = await import("@/utils/reviews");
  if (reviewsData && reviewsData.length > 0) {
    const uniqueReviewerImages = new Map();
    reviewsData.forEach((review) => {
      if (
        review.reviewerImage &&
        !uniqueReviewerImages.has(review.reviewerImage)
      ) {
        uniqueReviewerImages.set(review.reviewerImage, {
          url: review.reviewerImage,
          reviewer: review.reviewerName,
          book: review.bookName,
        });
      }
    });

    uniqueReviewerImages.forEach((img, path) => {
      imageEntries.push({
        url: `${baseUrl}/author/${slugify(img.reviewer)}`,
        lastModified: now,
        images: [
          {
            loc: path.startsWith("http") ? path : `${baseUrl}${path}`,
            title: `${img.reviewer} reviewing ${img.book}`,
            caption: `Verified review of ${img.book} by ${img.reviewer}`,
            geo_location: "India",
            license: "https://thebookx.in",
          },
        ],
      });
    });
  }

  return imageEntries;
}
