// Google Merchant Center product feed (RSS 2.0 + g: namespace).
// Add this URL in Merchant Center → Products → Feeds → Scheduled fetch:
//   https://www.thebookx.in/merchant-feed.xml
// Google re-fetches it (daily) so it always reflects the live catalogue.

import { books } from "@/utils/book";

const SITE = "https://www.thebookx.in";
export const dynamic = "force-dynamic"; // always reflect current catalogue
export const revalidate = 3600;

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// XML-escape text content
function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function imageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${SITE}${image.startsWith("/") ? "" : "/"}${image}`;
}

export async function GET() {
  const items = books
    .filter((b) => b && b.name && b.image && b.discountedPrice > 0)
    .map((b) => {
      const link = `${SITE}/books/${slugify(b.name)}`;
      const img = imageUrl(b.image);
      const availability = (b.stock ?? 1) > 0 ? "in_stock" : "out_of_stock";
      const desc = (b.description || `${b.name} — available at TheBookX.`)
        .replace(/\s+/g, " ")
        .slice(0, 4900);
      const title = b.author ? `${b.name} by ${b.author}` : b.name;
      return `    <item>
      <g:id>${esc(b.id)}</g:id>
      <g:title>${esc(title)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(img)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${b.discountedPrice}.00 INR</g:price>
      <g:condition>new</g:condition>
      <g:brand>TheBookX</g:brand>
      <g:google_product_category>784</g:google_product_category>
      <g:product_type>Books &gt; ${esc(b.catalogue?.[0] || "General")}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>TheBookX — Book Catalogue</title>
    <link>${SITE}</link>
    <description>Books from TheBookX, starting at just ₹1. Free delivery and Cash on Delivery across India.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
