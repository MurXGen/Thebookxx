// Physical-copy tracking-ID pool API (tracking_ids tab: ids | status).
//   GET  /api/tracking-ids?status=unused&prefix=E&limit=50
//        → { ids: [...], all: [{ids,status}] }   (unused, optional prefix filter)
//   POST /api/tracking-ids { action:"append", ids:[...] }
//        → append each id as a new row with status "Not Used" (deduped)
//   POST /api/tracking-ids { action:"markUsed", ids:[...] }
//        → flip each matching row's status to "Used"

import {
  trackingIdsRows,
  trackingIdAppend,
  trackingIdUpdate,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const clean = (s) => String(s || "").trim().toUpperCase();
const isUsed = (s) => /used/i.test(String(s || "")) && !/not\s*used/i.test(String(s || ""));

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`trk-get:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const wantStatus = (searchParams.get("status") || "").toLowerCase();
  const prefix = clean(searchParams.get("prefix"));
  const limit = Math.min(Number(searchParams.get("limit")) || 500, 2000);

  const rows = await trackingIdsRows();
  let list = rows
    .map((r) => ({ id: clean(r.ids ?? r.IDs ?? r.Ids), status: r.status ?? r.Status ?? "" }))
    .filter((r) => r.id);

  if (wantStatus === "unused") list = list.filter((r) => !isUsed(r.status));
  else if (wantStatus === "used") list = list.filter((r) => isUsed(r.status));

  if (prefix) list = list.filter((r) => r.id.startsWith(prefix));

  return Response.json({
    ids: list.slice(0, limit).map((r) => r.id),
    all: rows,
  });
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`trk-post:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body = {};
  try {
    body = await request.json();
  } catch {}

  const action = String(body.action || "").toLowerCase();
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.map(clean).filter(Boolean))]
    : [];
  if (!ids.length)
    return Response.json({ success: false, error: "no ids" }, { status: 400 });

  if (action === "append") {
    // Dedupe against IDs already in the sheet so re-uploads stay "fresh".
    const existing = new Set(
      (await trackingIdsRows())
        .map((r) => clean(r.ids ?? r.IDs ?? r.Ids))
        .filter(Boolean),
    );
    const fresh = ids.filter((id) => !existing.has(id));
    let added = 0;
    for (const id of fresh) {
      const r = await trackingIdAppend(id);
      if (r.success) added += 1;
    }
    return Response.json({
      success: true,
      added,
      skipped: ids.length - fresh.length,
    });
  }

  if (action === "markused") {
    let updated = 0;
    for (const id of ids) {
      const r = await trackingIdUpdate(id, "Used");
      if (r.success) updated += 1;
    }
    return Response.json({ success: true, updated });
  }

  return Response.json({ success: false, error: "bad action" }, { status: 400 });
}
