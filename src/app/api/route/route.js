// Server-side road-route proxy — uses OSRM's free public router to return an
// actual driving polyline between two coordinates (instead of a straight line
// on the tracking map). Falls back to null so the client can draw a straight
// line if routing is unavailable.
//
// Query: /api/route?from=lat,lng&to=lat,lng
// Returns: { coords: [[lat,lng], ...], distance, duration } | { coords: null }

const cache = new Map(); // "from|to" -> payload

function parsePair(v) {
  const m = String(v || "").split(",");
  const lat = parseFloat(m[0]);
  const lng = parseFloat(m[1]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = parsePair(searchParams.get("from"));
  const to = parsePair(searchParams.get("to"));
  if (!from || !to) {
    return Response.json({ error: "from/to required" }, { status: 400 });
  }

  const key = `${from.lat.toFixed(4)},${from.lng.toFixed(4)}|${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
  if (cache.has(key)) {
    return Response.json({ ...cache.get(key), cached: true });
  }

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`osrm HTTP ${res.status}`);
    const json = await res.json();
    const r = json.routes && json.routes[0];
    if (!r || !r.geometry || !Array.isArray(r.geometry.coordinates)) {
      throw new Error("no route");
    }
    // GeoJSON is [lng,lat] — flip to [lat,lng] for Leaflet.
    const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const payload = { coords, distance: r.distance, duration: r.duration };
    cache.set(key, payload);
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return Response.json(payload);
  } catch (e) {
    return Response.json({ coords: null }, { status: 200 });
  }
}
