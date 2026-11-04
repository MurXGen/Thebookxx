// GET /api/checkout/catalog/products?page=1&limit=100 — Shiprocket Checkout "Fetch Products"
import { checkAuth, listProducts, ok, pageParams } from "@/lib/srCatalog";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = checkAuth(req);
  if (denied) return denied;
  const { page, limit } = pageParams(req);
  return ok(listProducts(page, limit));
}
