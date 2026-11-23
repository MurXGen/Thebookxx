// Instant order pushes from manage-orders: when an order's status changes
// (shipped / in transit / out for delivery / delivered) or a tracking ID is
// pushed, send it to every device saved under that customer's phone with
// "Order & tracking updates" on. Admin only (x-admin-code).
// POST { items: [{ orderId, phone, name, status, shippingId }], dry? }

import { isValidAdminCode } from "@/lib/adminCode";
import { pushAllRows, pushRowUpdate, sendPush, pool, prefOn, rowActive, pushConfigured } from "@/lib/webPushServer";
import { statusPush } from "@/lib/pushMessages";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

const digits = (v) => String(v ?? "").replace(/\D/g, "").slice(-10);

export async function POST(request) {
  if (!isValidAdminCode(request.headers.get("x-admin-code")))
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let b;
  try {
    b = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const items = Array.isArray(b?.items) ? b.items.slice(0, 200) : [];
  if (!pushConfigured()) return Response.json({ ok: false, error: "VAPID keys missing on the server" }, { status: 500 });

  const byPhone = new Map();
  for (const r of (await pushAllRows()).filter((r) => rowActive(r) && prefOn(r, "orders"))) {
    const p = digits(r.Phone);
    if (p.length !== 10) continue;
    if (!byPhone.has(p)) byPhone.set(p, []);
    byPhone.get(p).push(r);
  }

  const jobs = [];
  const seen = new Set();
  for (const it of items) {
    const msg = statusPush(it);
    if (!msg) continue;
    const key = `${it.orderId}|${msg.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const row of byPhone.get(digits(it.phone)) || []) jobs.push({ row, msg, orderId: it.orderId });
  }
  if (b?.dry) return Response.json({ ok: true, dry: true, devices: jobs.length, plan: jobs.map((j) => ({ orderId: j.orderId, title: j.msg.title })) });

  const stats = { devices: jobs.length, sent: 0, failed: 0, gone: 0, orders: [] };
  const hit = new Set();
  await pool(jobs, 10, async ({ row, msg, orderId }) => {
    const r = await sendPush(row, msg);
    stats[r] += 1;
    if (r === "sent") hit.add(orderId);
    if (r === "gone") await pushRowUpdate(row["Device ID"], { Status: "gone", "Updated At": new Date().toISOString() });
  });
  stats.orders = [...hit];
  return Response.json({ ok: true, ...stats });
}
