// Google Merchant Center product feed (RSS 2.0 + g: namespace).
// Submit this URL as a feed in Merchant Center to power free Shopping listings
// (the "Books" / Shopping tab) and Shopping ads:  https://thebookx.in/product-feed.xml
import { books } from "@/utils/book";

const SITE = "https://www.thebookx.in";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const items = books
    .filter((b) => b.name && b.discountedPrice)
    .map((b) => {
      const slug = slugify(b.name);
      const link = `${SITE}/books/${slug}`;
      const image = b.image ? `${SITE}${b.image}` : "";
      const inStock = (b.stock ?? 1) > 0;
      const desc = (b.description || `${b.name} available at TheBookX.`).slice(
        0,
        4900,
      );
      const brand = b.author && b.author !== "Unknown" ? b.author : "TheBookX";
      const category =
        (b.catalogue || []).find((c) => c === "children")
          ? "Media > Books > Children's Books"
          : "Media > Books";
      const salePrice =
        b.originalPrice && b.originalPrice > b.discountedPrice
          ? `<g:sale_price>${b.discountedPrice} INR</g:sale_price>`
          : "";
      const listPrice =
        b.originalPrice && b.originalPrice > b.discountedPrice
          ? b.originalPrice
          : b.discountedPrice;
      return `    <item>
      <g:id>${esc(b.id)}</g:id>
      <g:title>${esc(b.name)}${b.author ? ` by ${esc(b.author)}` : ""}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(image)}</g:image_link>
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${listPrice} INR</g:price>
      ${salePrice}
      <g:condition>new</g:condition>
      <g:brand>${esc(brand)}</g:brand>
      <g:google_product_category>${category}</g:google_product_category>
      <g:product_type>${esc((b.catalogue || [])[0] || "books")}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>TheBookX — Buy Books Online in India</title>
    <link>${SITE}</link>
    <description>Books at the lowest prices in India, starting at ₹1. Free delivery and Cash on Delivery.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=21600",
    },
  });
}
