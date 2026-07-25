// Batch read of blog view counts: GET /api/views?slugs=a,b,c
// Returns { counts: { slug: number } }. Used by the "Popular posts" widget.
// Falls back to { counts: {}, disabled: true } when Upstash isn't configured.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL_BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function GET(req) {
  if (!URL_BASE || !TOKEN) return Response.json({ counts: {}, disabled: true });

  const { searchParams } = new URL(req.url);
  const slugs = (searchParams.get("slugs") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (!slugs.length) return Response.json({ counts: {} });

  try {
    const path = slugs
      .map((s) => encodeURIComponent(`blogviews:${s.slice(0, 120)}`))
      .join("/");
    const res = await fetch(`${URL_BASE}/mget/${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json();
    const arr = Array.isArray(data.result) ? data.result : [];
    const counts = {};
    slugs.forEach((s, i) => {
      counts[s] = parseInt(arr[i], 10) || 0;
    });
    return Response.json({ counts });
  } catch (e) {
    return Response.json({ counts: {}, error: true });
  }
}
