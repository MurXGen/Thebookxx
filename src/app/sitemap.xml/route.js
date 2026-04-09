// app/sitemap.xml/route.js
import { books } from "@/utils/book";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const baseUrl = "https://thebookx.in";
  const booksPerSitemap = 500; // Split into chunks of 500 books per sitemap
  const totalBooks = books.length;
  const totalSitemaps = Math.ceil(totalBooks / booksPerSitemap);

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

  // Add book sitemaps
  for (let i = 0; i < totalSitemaps; i++) {
    sitemapIndex += `
  <sitemap>
    <loc>${baseUrl}/sitemap-books-${i + 1}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  sitemapIndex += `
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
