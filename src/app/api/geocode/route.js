// Server-side geocoder — proxies OpenStreetMap Nominatim (free, no key).
//
// Nominatim's usage policy needs a valid User-Agent/Referer and low volume,
// so we run it on the server with a UA + an in-memory cache. Returns
// { lat, lng, label } for a free-text address / pincode.

const cache = new Map(); // q -> { lat, lng, label } | null
const CONTACT = process.env.NOMINATIM_CONTACT || "orders@thebookx.in";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return Response.json({ error: "query too short" }, { status: 400 });
  }

  const key = q.toLowerCase();
  if (cache.has(key)) {
    return Response.json({ result: cache.get(key), cached: true });
  }

  try {
    const url =
      "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=" +
      encodeURIComponent(q);
    const res = await fetch(url, {
      headers: {
        "User-Agent": `TheBookX/1.0 (${CONTACT})`,
        "Accept-Language": "en",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`nominatim HTTP ${res.status}`);
    const arr = await res.json();
    const first = Array.isArray(arr) && arr[0];
    const result = first
      ? {
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon),
          label: first.display_name || "",
        }
      : null;
    cache.set(key, result);
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
    return Response.json({ result });
  } catch (e) {
    return Response.json({ result: null }, { status: 200 });
  }
}
