// OpenAPI spec for the AI shopping endpoints (for custom GPT Actions & agents).
import { SITE } from "@/lib/agentOrder";

export const dynamic = "force-static";

export function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "TheBookX shopping for AI assistants",
      version: "1.0.0",
      description:
        "Search TheBookX books and build an order link for the user. No login needed. The link puts the books in the bag with the user's details filled and opens the payment step; the user pays (UPI) or chooses Cash on Delivery themselves.",
    },
    servers: [{ url: SITE }],
    paths: {
      "/api/agent/books": {
        get: {
          operationId: "searchBooks",
          summary: "Search books by title, author or genre",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" }, description: "Words from title/author/genre" },
            { name: "category", in: "query", schema: { type: "string" }, description: "e.g. self-help, fiction, romance, thriller, finance, children" },
            { name: "max_price", in: "query", schema: { type: "number" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 50 } },
          ],
          responses: { 200: { description: "Matching books with id, title, author, price, url" } },
        },
      },
      "/api/agent/order-link": {
        get: {
          operationId: "buildOrderLink",
          summary: "Price an order and get the ready-to-pay order link (does not place an order)",
          parameters: [
            { name: "books", in: "query", required: true, schema: { type: "string" }, description: "Comma list of <id>[:qty], e.g. bk-005:2,bk-002" },
            { name: "name", in: "query", schema: { type: "string" } },
            { name: "phone", in: "query", schema: { type: "string" }, description: "10-digit Indian mobile" },
            { name: "pincode", in: "query", schema: { type: "string" } },
            { name: "address", in: "query", schema: { type: "string" }, description: "House/flat, street, landmark (over 30 characters)" },
            { name: "email", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Order link, items, totals, missing fields and warnings" } },
        },
      },
    },
  };
  return Response.json(spec, { headers: { "Access-Control-Allow-Origin": "*" } });
}
