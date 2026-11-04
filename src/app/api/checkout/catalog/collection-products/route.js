// GET /api/checkout/catalog/collection-products?collection_id=3000005&page=1&limit=100
// Shiprocket Checkout "Fetch Products by Collection"
import { NextResponse } from "next/server";
import { checkAuth, listCollectionProducts, ok, pageParams } from "@/lib/srCatalog";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = checkAuth(req);
  if (denied) return denied;
  const { u, page, limit } = pageParams(req);
  const cid = u.searchParams.get("collection_id") || u.searchParams.get("id");
  if (!cid) {
    return NextResponse.json({ error: "collection_id is required" }, { status: 400 });
  }
  return ok(listCollectionProducts(cid, page, limit));
}
