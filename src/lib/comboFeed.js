// Google Merchant Center items for book combos (bundles). Shared by
// /merchant-feed.xml and /product-feed.xml so combos show in Google Shopping
// alongside single books. Uses the combo's combined-cover share image as the
// main picture and each book cover as an additional image.
import { combos, getComboBooks, getComboPricing } from "@/utils/combos";

const abs = (site, src) =>
  !src ? "" : src.startsWith("http") ? src : `${site}${src.startsWith("/") ? "" : "/"}${src}`;

export function comboFeedItems(site, esc, freeFrom = 199) {
  return combos
    .map((c) => {
      const items = getComboBooks(c);
      if (items.length < 2) return "";
      const { price, mrp, sum, comboOff, count } = getComboPricing(c);
      if (!(price > 0)) return "";
      const isPair = !!c.discountPct;
      const list = isPair ? sum : mrp;
      const link = `${site}/combos/${c.slug}`;
      const inStock = items.every((b) => (b.stock ?? 1) > 0);
      const names = items.map((b) => b.name);
      const title = `${c.title} Book Combo (${count} Paperbacks)${isPair ? ` – ${c.discountPct}% Off` : ""}`.slice(0, 150);
      const desc = [
        c.seoDescription || c.tagline,
        `Includes: ${items.map((b) => `${b.name}${b.author ? ` by ${b.author}` : ""}`).join("; ")}.`,
        !c.seoDescription && "Brand-new genuine paperbacks, Cash on Delivery and 7-day replacement across India.",
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .slice(0, 4900);
      const extra = items
        .map((b) => abs(site, b.image))
        .filter(Boolean)
        .slice(0, 10)
        .map((u) => `      <g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join("\n");
      const highlights = [
        isPair ? `Save ₹${comboOff}: ${c.discountPct}% off when bought together` : `${count} books in one order`,
        `Includes ${names.join(" + ")}`.slice(0, 150),
        "Cash on Delivery and 7-day replacement",
        `Free delivery on orders from ₹${freeFrom}`,
      ]
        .map((h) => `      <g:product_highlight>${esc(h)}</g:product_highlight>`)
        .join("\n");
      return `    <item>
      <g:id>${esc(c.id)}</g:id>
      <g:title>${esc(title)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(`${link}/opengraph-image`)}</g:image_link>
${extra}
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${list}.00 INR</g:price>
      ${list > price ? `<g:sale_price>${price}.00 INR</g:sale_price>` : ""}
      <g:condition>new</g:condition>
      <g:brand>TheBookX</g:brand>
      <g:is_bundle>yes</g:is_bundle>
      <g:google_product_category>784</g:google_product_category>
      <g:product_type>Books &gt; Book Combos &gt; ${esc(c.category)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
${highlights}
      <g:custom_label_0>combo</g:custom_label_0>
      <g:custom_label_1>${esc(c.category)}</g:custom_label_1>
      <g:custom_label_2>${c.category === "Art of Clarity Combos" ? "art-of-clarity-pair" : isPair ? "two-book-pair" : "curated-set"}</g:custom_label_2>
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>${price >= freeFrom ? 0 : 69}.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .filter(Boolean)
    .join("\n");
}
