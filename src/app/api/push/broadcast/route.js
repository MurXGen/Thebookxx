// Send one push to everyone who has a topic on — new arrivals or offers.
// POST (header x-cron-secret) { topic: "arrivals" | "offers", title, body,
//   url?, image?, dry?, force? } — dry: true only counts who would get it.
// Best sent 19:00–21:00 IST; refused 22:00–08:00 unless force: true.

import { inQuietHours } from "@/lib/pushMessages";
import { pushAllRows, pushRowUpdate, sendPush, pool, prefOn, rowActive, checkCronSecret } from "@/lib/webPushServer";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export async function POST(request) {
  if (!checkCronSecret(request)) return Response.json({ ok: false }, { status: 401 });
  let b;
  try {
    b = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const topic = String(b?.topic || "");
  if (!["arrivals", "offers"].includes(topic) || !b?.title) {
    return Response.json({ ok: false, error: "topic + title required" }, { status: 400 });
  }
  const payload = {
    title: String(b.title).slice(0, 80),
    body: String(b.body || "").slice(0, 200),
    url: String(b.url || "https://www.thebookx.in/"),
    image: b.image ? String(b.image) : undefined,
    tag: topic,
  };
  if (inQuietHours() && !b?.dry && !b?.force) {
    return Response.json({ ok: false, error: "quiet hours (22:00–08:00 IST) — send after 8 AM or pass force: true" }, { status: 409 });
  }
  const rows = (await pushAllRows()).filter((r) => rowActive(r) && prefOn(r, topic));
  if (b?.dry) return Response.json({ ok: true, dry: true, recipients: rows.length, payload });

  const stats = { recipients: rows.length, sent: 0, failed: 0, gone: 0 };
  await pool(rows, 15, async (row) => {
    const r = await sendPush(row, payload);
    stats[r] = (stats[r] || 0) + 1;
    if (r === "gone") await pushRowUpdate(row["Device ID"], { Status: "gone", "Updated At": new Date().toISOString() });
  });
  return Response.json({ ok: true, ...stats });
}
