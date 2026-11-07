// Build + check an order link for an AI assistant (no order is placed).
//   GET /api/agent/order-link?books=bk-005:2,atomic-habits&name=…&phone=…&pincode=…&address=…
// → { link, items: [{id,title,qty,price}], books_total, delivery, total_estimate,
//     ready_for_payment, missing: [...], warnings: [...] }
import { parseBooksParam, buildOrderLink, cleanPhone } from "@/lib/agentOrder";
import { getDeliveryCharge, getMinCheckoutAmount } from "@/utils/cartOffers";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

export async function GET(request) {
  const rl = rateLimit(`agent-link:${clientIp(request)}`, { limit: 120, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const sp = new URL(request.url).searchParams;
  const { items, unknown, notes } = parseBooksParam(sp.get("books"));
  const name = (sp.get("name") || "").trim();
  const phone = cleanPhone(sp.get("phone") || "");
  const pincode = (sp.get("pincode") || "").replace(/\D/g, "").slice(0, 6);
  const address = (sp.get("address") || "").trim();
  const email = (sp.get("email") || "").trim();

  const booksTotal = items.reduce((s, { book, qty }) => s + Number(book.discountedPrice) * qty, 0);
  const hasRupee = items.some(({ book }) => Number(book.discountedPrice) === 1);
  const minOrder = getMinCheckoutAmount(hasRupee);
  const delivery = items.length ? getDeliveryCharge(booksTotal, false, hasRupee) : 0;

  const missing = [];
  if (!items.length) missing.push("books");
  if (name.length < 3) missing.push("name");
  if (!/^[6-9]\d{9}$/.test(phone)) missing.push("phone (10-digit Indian mobile)");
  if (pincode.length !== 6) missing.push("pincode");
  if (address.length <= 30) missing.push("address (house/flat, street, landmark — over 30 characters)");

  const warnings = [...notes];
  if (unknown.length) warnings.push(`Not found: ${unknown.join(", ")}`);
  if (items.length && booksTotal < minOrder)
    warnings.push(`Minimum order is ₹${minOrder}${hasRupee ? " when a ₹1 book is included" : ""}; add ₹${minOrder - booksTotal} more`);

  return Response.json(
    {
      link: buildOrderLink({
        books: items.map(({ book, qty }) => ({ id: book.id, qty })),
        name,
        phone,
        pincode,
        address,
        email,
      }),
      items: items.map(({ book, qty }) => ({
        id: book.id,
        title: book.name,
        qty,
        price: Number(book.discountedPrice),
      })),
      books_total: booksTotal,
      delivery_standard: delivery,
      total_estimate: booksTotal + delivery,
      payment_options: ["UPI (pay online)", "Pay in two parts", "Cash on Delivery (+ handling fee)"],
      ready_for_payment: missing.length === 0 && booksTotal >= minOrder,
      missing,
      warnings,
      note:
        "Totals are estimates before offers/coupons. Faster delivery (1–6 days) is pre-selected on the payment step and can be switched off; COD uses standard delivery (5–9 days).",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
