// GET /api/checkout/catalog/collections?page=1&limit=100 — Shiprocket Checkout "Fetch Collections"
import { checkAuth, listCollections, ok, pageParams } from "@/lib/srCatalog";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = checkAuth(req);
  if (denied) return denied;
  const { page, limit } = pageParams(req);
  return ok(listCollections(page, limit));
}
