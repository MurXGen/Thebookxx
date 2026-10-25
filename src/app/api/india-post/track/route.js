// Server route: fetch live India Post tracking for an article number and return
// the LATEST event (where the parcel currently is). Credentials stay server-side.
//
// Flow:
//   1) POST {BASE}/v1/access/login   { username, password }  -> access_token (15 min)
//   2) POST {BASE}/v1/tracking/bulk  { bulk: [article...] }  (Bearer token)
//
// GET  /api/india-post/track?id=EM123456789IN   → latest event for one article
// POST /api/india-post/track  { ids: [...] }     → latest event for many (<=500)
//
// Env (server only): INDIA_POST_BASE_URL (e.g. https://test.cept.gov.in/beextcustomer),
//                    INDIA_POST_USERNAME, INDIA_POST_PASSWORD

import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Cache the access token across warm invocations (valid ~15 min; refresh early).
let _tok = { value: "", exp: 0 };

function extractToken(json) {
  return (
    json?.data?.access_token ||
    json?.access_token ||
    json?.data?.accessToken ||
    json?.accessToken ||
    json?.token ||
    ""
  );
}

async function getToken(BASE) {
  const now = Date.now();
  if (_tok.value && now < _tok.exp) return _tok.value;
  const res = await fetch(`${BASE}/v1/access/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      username: process.env.INDIA_POST_USERNAME,
      password: process.env.INDIA_POST_PASSWORD,
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`auth ${res.status}`);
  const token = extractToken(json);
  if (!token) throw new Error("no token in login response");
  const ttl = Number(json?.data?.expires_in || json?.expires_in || 900);
  _tok = { value: token, exp: now + Math.max(60, ttl - 60) * 1000 };
  return token;
}

// Shape one article's tracking into { id, lastEvent, deliveryLocation, delivered }.
function shapeArticle(row) {
  const bd = row?.booking_details || {};
  const events = Array.isArray(row?.tracking_details) ? row.tracking_details : [];
  // API returns events newest-first; be defensive and pick the most recent date.
  const sorted = [...events].sort(
    (a, b) => new Date(b?.date || 0) - new Date(a?.date || 0),
  );
  const latest = sorted[0] || null;
  const delivered =
    !!bd.delivery_confirmed_on ||
    /deliver/i.test(String(latest?.event || ""));
  return {
    id: String(bd.article_number || "").trim(),
    lastEvent: latest
      ? {
          event: String(latest.event || "").trim(),
          office: String(latest.office || "").trim(),
          date: latest.date || "",
          remarks: String(latest.remarks || "").trim(),
        }
      : null,
    deliveryLocation: String(bd.delivery_location || "").trim(),
    delivered,
    bookedAt: String(bd.booked_at || "").trim(),
    bookedOn: bd.booked_on || "",
  };
}

async function trackIds(ids) {
  const BASE = (process.env.INDIA_POST_BASE_URL || "").replace(/\/+$/, "");
  if (!BASE || !process.env.INDIA_POST_USERNAME || !process.env.INDIA_POST_PASSWORD) {
    return { ok: false, status: 501, error: "India Post API not configured." };
  }
  const clean = [...new Set(ids.map((s) => String(s || "").trim().toUpperCase()).filter(Boolean))].slice(0, 500);
  if (!clean.length) return { ok: false, status: 400, error: "No article IDs." };

  let token;
  try {
    token = await getToken(BASE);
  } catch (e) {
    return { ok: false, status: 502, stage: "auth", error: String(e?.message || e) };
  }

  try {
    const res = await fetch(`${BASE}/v1/tracking/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bulk: clean }),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      // token may have expired between calls — clear cache so next try re-logs in.
      if (res.status === 401) _tok = { value: "", exp: 0 };
      return { ok: false, status: 502, stage: "track", response: json };
    }
    const data = Array.isArray(json?.data) ? json.data : [];
    return { ok: true, articles: data.map(shapeArticle) };
  } catch (e) {
    return { ok: false, status: 502, stage: "track", error: String(e?.message || e) };
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  const out = await trackIds([id]);
  if (!out.ok) return NextResponse.json(out, { status: out.status || 502 });
  return NextResponse.json({ ok: true, article: out.articles[0] || null });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const ids = Array.isArray(body?.ids) ? body.ids : [];
  const out = await trackIds(ids);
  return NextResponse.json(out, { status: out.ok ? 200 : out.status || 502 });
}
