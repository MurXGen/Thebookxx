// Blog view counter backed by Upstash Redis (atomic INCR — accurate even under
// concurrent readers). Uses the Upstash REST API directly (no SDK dependency).
//
// Setup (one-time): create a free database at https://upstash.com, then add
// these to your environment (.env.local / hosting env vars):
//   UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
//   UPSTASH_REDIS_REST_TOKEN=<your-token>
//
// Until those are set, the endpoint returns { count: null, disabled: true }
// and the on-page counter simply hides itself — nothing breaks.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const key = (slug) => `blogviews:${String(slug || "").slice(0, 120)}`;

async function redis(command) {
  // command is a path like "incr/blogviews:my-slug" or "get/blogviews:my-slug"
  const res = await fetch(`${URL}/${command}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = await res.json();
  return data.result;
}

function disabled() {
  return Response.json({ count: null, disabled: true });
}

// Read the current count.
export async function GET(_req, { params }) {
  if (!URL || !TOKEN) return disabled();
  try {
    const { slug } = await params;
    const raw = await redis(`get/${encodeURIComponent(key(slug))}`);
    const count = raw == null ? 0 : parseInt(raw, 10) || 0;
    return Response.json({ count });
  } catch (e) {
    return Response.json({ count: null, error: true });
  }
}

// Increment and return the new count.
export async function POST(_req, { params }) {
  if (!URL || !TOKEN) return disabled();
  try {
    const { slug } = await params;
    const count = await redis(`incr/${encodeURIComponent(key(slug))}`);
    return Response.json({ count: parseInt(count, 10) || 0 });
  } catch (e) {
    return Response.json({ count: null, error: true });
  }
}
