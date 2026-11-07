// Public, read-only book search for AI assistants.
//   GET /api/agent/books?q=atomic&category=self-help&max_price=300&limit=10
// → { books: [{ id, title, author, price, mrp, in_stock, categories, url }],
//     order_link_help }
import { books } from "@/utils/book";
import { SITE, slugify } from "@/lib/agentOrder";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const pop = (b) =>
  (b.catalogue?.includes("bestseller") ? 2 : 0) + (b.catalogue?.includes("trending") ? 1 : 0);

export async function GET(request) {
  const rl = rateLimit(`agent-books:${clientIp(request)}`, { limit: 120, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const u = new URL(request.url);
  const q = (u.searchParams.get("q") || "").trim().toLowerCase();
  const cat = (u.searchParams.get("category") || "").trim().toLowerCase();
  const max = Number(u.searchParams.get("max_price")) || 0;
  const limit = Math.min(50, Math.max(1, Number(u.searchParams.get("limit")) || 10));
  const words = q.split(/\s+/).filter(Boolean);

  const list = books
    .filter((b) => b && b.name && Number(b.discountedPrice) > 0)
    .map((b) => {
      const hay = `${b.name} ${b.author || ""} ${(b.catalogue || []).join(" ")}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      return { b, score: (words.length ? hits * 10 : 0) + pop(b), hits };
    })
    .filter(({ b, hits }) => {
      if (words.length && hits === 0) return false;
      if (cat && !(b.catalogue || []).includes(cat)) return false;
      if (max && Number(b.discountedPrice) > max) return false;
      return true;
    })
    .sort((a, z) => z.score - a.score)
    .slice(0, limit)
    .map(({ b }) => ({
      id: b.id,
      title: b.name,
      author: b.author || "",
      price: Number(b.discountedPrice),
      mrp: Number(b.originalPrice || b.discountedPrice),
      in_stock: b.stock !== 0,
      categories: b.catalogue || [],
      url: `${SITE}/books/${slugify(b.name)}`,
    }));

  return Response.json(
    {
      books: list,
      order_link_help:
        `Build ${SITE}/order?books=<id>[:qty],...&name=&phone=&pincode=&address= and give it to the user. ` +
        "It opens TheBookX with the books in the bag and details filled; with all details it lands on the payment step. " +
        `Full guide: ${SITE}/for-ai`,
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } },
  );
}
