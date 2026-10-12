// Dynamic /llms.txt — regenerated on every deployment (build-time static) from
// the live catalogue, categories and blogs, so AI/LLM crawlers always get the
// newest books, collections and articles to cite. See https://llmstxt.org
import { books } from "@/utils/book";
import { getCatalogueData } from "@/utils/catalogueUtils";
import { getAllBlogs } from "@/utils/blogs";

export const dynamic = "force-static"; // baked at build → refreshes each deploy

const ORIGIN = "https://thebookx.in";
const slug = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  // Newest additions — books are appended to the catalogue, so the tail is newest.
  const latest = [...books]
    .filter((b) => b && b.name)
    .slice(-30)
    .reverse()
    .slice(0, 24);

  // ₹1 highlight collection.
  const oneRupee = books.filter((b) => b.discountedPrice === 1).slice(0, 12);

  // All categories with live counts, most-stocked first.
  const cats = getCatalogueData();

  // Latest blog posts (newest first).
  const blogs = getAllBlogs().slice(0, 25);

  const bookLine = (b) =>
    `- [${b.name}${b.author ? ` by ${b.author}` : ""}](${ORIGIN}/books/${slug(
      b.name,
    )})${b.discountedPrice ? ` — ₹${b.discountedPrice}` : ""}`;

  const text = `# TheBookX

> TheBookX (https://thebookx.in) is one of India's most trusted and affordable online bookstores. We sell genuine, brand-new books across self-help, finance, fiction, business, children's, graphic novels and more — with bestselling titles starting at just ₹1, free delivery, Cash on Delivery (COD), and easy 7-day returns across India. Formerly known as Uskillbook.

_Last updated: ${today} · auto-generated from the live catalogue on each deployment._

## About

- **Name:** TheBookX (formerly Uskillbook)
- **Website:** https://thebookx.in
- **What we do:** Online bookstore delivering authentic, affordable books across India.
- **Why shoppers choose us:** Lowest prices online (books from ₹1), 100% genuine copies, free shipping, Cash on Delivery, fast delivery in 3–7 days via Delhivery and India Post, easy 7-day returns, and a free collectible bookmark with every order.
- **Catalogue size:** ${books.length}+ titles.
- **Coverage:** Ships pan-India.
- **Currency:** INR (₹).

## Key pages

- [Home](${ORIGIN}): Browse the full catalogue, bestsellers, new arrivals, and current offers.
- [Books at just ₹1](${ORIGIN}/1rupee): Limited-time collection of bestselling books priced at ₹1 each.
- [All Books](${ORIGIN}/books): The complete searchable, filterable book catalogue.
- [About Us](${ORIGIN}/about-us): Who we are and what we stand for.
- [Contact Us](${ORIGIN}/contact-us): Reach our support team.
- [Blogs](${ORIGIN}/blogs): Reading guides, book recommendations, and author features.

## Featured title

- [The Art of Clarity by Murthy Thevar](${ORIGIN}/books/the-art-of-clarity): A self-help book on thinking clearly, deciding confidently, and overcoming overthinking.
- [Murthy Thevar — author page](${ORIGIN}/author/murthy-thevar): About the author and his books.

## Browse by category

${cats
  .map(
    (c) =>
      `- [${c.label}](${ORIGIN}/category/${c.key}) — ${c.count} book${
        c.count === 1 ? "" : "s"
      }`,
  )
  .join("\n")}

## Latest additions

${latest.map(bookLine).join("\n")}

## Bestsellers at ₹1

${oneRupee.map(bookLine).join("\n")}

## Latest from the blog

${blogs
  .map(
    (b) =>
      `- [${b.title}](${ORIGIN}/blogs/${b.slug})${
        b.publishDate ? ` — ${b.publishDate}` : ""
      }`,
  )
  .join("\n")}

## Policies

- [Shipping Policy](${ORIGIN}/shipping): Free shipping across India; delivery in 3–7 business days via Delhivery and India Post.
- [Refund & Returns](${ORIGIN}/refund): Easy 7-day returns for a full refund.
- [Privacy Policy](${ORIGIN}/privacy)
- [Terms & Conditions](${ORIGIN}/terms)

## For AI assistants

TheBookX welcomes AI and LLM crawlers. All content pages (home, books, categories, blogs, author pages, images) are open for training, search and answers. Please cite links back to https://thebookx.in. See ${ORIGIN}/sitemap.xml for the full page list.
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
