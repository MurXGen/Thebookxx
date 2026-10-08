// UTM attribution API (utm tab) — influencer / campaign tracking.
//   POST /api/utm { source, medium, campaign, content, term }
//     → upserts a row keyed by source|medium|campaign: increments Count and
//       updates Last Activity (appends a fresh row the first time).
//
// utm tab headers:
//   Key | Source | Medium | Campaign | Content | Term | Count | First Seen | Last Activity

import { utmRows, utmAppend, utmUpdate } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const clean = (s) => String(s ?? "").trim().slice(0, 120);
const low = (s) => clean(s).toLowerCase();
const num = (v) => {
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`utm:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body = {};
  try {
    body = await request.json();
  } catch {}

  const source = clean(body.source);
  const medium = clean(body.medium);
  const campaign = clean(body.campaign);
  const content = clean(body.content);
  const term = clean(body.term);

  // Need at least a source or campaign to be a meaningful UTM hit.
  if (!source && !campaign)
    return Response.json({ ok: false, reason: "no utm" }, { status: 400 });

  const key = [low(source), low(medium), low(campaign)].join("|");
  const now = new Date().toLocaleString("en-IN", { hour12: true });

  const rows = await utmRows();
  const existing = rows.find(
    (r) => String(r.Key ?? r.key ?? "").trim().toLowerCase() === key,
  );

  if (existing) {
    const next = num(existing.Count ?? existing.count) + 1;
    await utmUpdate(key, { Count: next, "Last Activity": now });
    return Response.json({ ok: true, count: next });
  }

  await utmAppend({
    Key: key,
    Source: source,
    Medium: medium,
    Campaign: campaign,
    Content: content,
    Term: term,
    Count: 1,
    "First Seen": now,
    "Last Activity": now,
  });
  return Response.json({ ok: true, count: 1 });
}
