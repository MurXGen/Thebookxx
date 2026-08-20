// Simple in-memory fixed-window rate limiter for API routes — no dependencies.
//
// Best-effort and per server instance (on serverless each instance keeps its
// own window), but enough to blunt scripted floods / accidental hammering of
// the phone-lookup + write endpoints. For hard DDoS protection, front the site
// with Cloudflare / a WAF as well.

const buckets = new Map(); // key -> { count, resetAt }

export function rateLimit(key, { limit = 30, windowMs = 60000 } = {}) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  return {
    allowed: b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
  };
}

// Best-effort client IP from proxy headers (Vercel/most hosts set these).
export function clientIp(request) {
  const xff = request.headers.get("x-forwarded-for") || "";
  return (
    xff.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Standard 429 response with a Retry-After header.
export function tooMany(retryAfter) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
