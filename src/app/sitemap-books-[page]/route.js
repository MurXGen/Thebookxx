// app/sitemap-books-1/route.js
import { books } from "@/utils/book";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getFullImageUrl(imagePath, baseUrl) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${baseUrl}${imagePath}`;
  return `${baseUrl}/books/${imagePath}`;
}

export async function GET() {
  const baseUrl = "https://thebookx.in";
  const start = 0;
  const end = 500;
  const booksChunk = books.slice(start, end);

  const urls = booksChunk
    .map((book) => {
      const bookSlug = slugify(book.name);
      let urlEntry = `
    <url>
      <loc>${baseUrl}/books/${bookSlug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>`;

      if (book.image) {
        const fullImageUrl = getFullImageUrl(book.image, baseUrl);
        urlEntry += `
      <image:image>
        <image:loc>${fullImageUrl}</image:loc>
        <image:title>${escapeXml(book.name)} book cover</image:title>
        <image:caption>Buy ${escapeXml(book.name)} online at TheBookX</image:caption>
      </image:image>`;
      }

      urlEntry += `
    </url>`;
      return urlEntry;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
