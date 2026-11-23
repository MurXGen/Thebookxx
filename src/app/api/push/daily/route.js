// Timed push runs, called by the Netlify scheduled functions in
// netlify/functions/ with the x-cron-secret header and ?slot=:
//   orders (09:30 IST)  latest open order + live tracking link, daily
//   contact (11:00)     missing email / alternate number on the latest order,
//                       days 1, 3, 6 after it was placed
//   bag (13:00 IST)     bag reminder on days 1, 2, 4, 7 after it last changed
//   wishlist (20:30)    saved-book nudge on days 2, 5, 9, 14, 21, 28 — skipped
//                       on a day the bag reminder already went out
// Add &dry=1 to see what would be sent without sending anything.

import { gvizQuery, tableToObjects } from "@/lib/serverSheets";
import { pushAllRows, pushRowUpdate, sendPush, pool, prefOn, rowActive, checkCronSecret, pushConfigured } from "@/lib/webPushServer";
import { latestOrderByPhone, orderPush, contactPush, cartPush, wishlistPush, bagDue, wishlistDue } from "@/lib/pushMessages";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

async function run(request) {
  if (!checkCronSecret(request)) return Response.json({ ok: false }, { status: 401 });
  const qs = new URL(request.url).searchParams;
  const dry = qs.get("dry") === "1";
  const slot = qs.get("slot") || "";
  if (!["orders", "contact", "bag", "wishlist"].includes(slot)) {
    return Response.json({ ok: false, error: "slot must be orders | contact | bag | wishlist" }, { status: 400 });
  }

  const rows = (await pushAllRows()).filter(rowActive);
  let orders = new Map();
  if ((slot === "orders" || slot === "contact") && rows.some((r) => prefOn(r, "orders") && r.Phone)) {
    try {
      orders = latestOrderByPhone(tableToObjects(await gvizQuery({ tq: "select *" })));
    } catch {}
  }

  const plan = rows.map((r) => {
    let m = null;
    if (slot === "orders" && prefOn(r, "orders")) {
      const phone = String(r.Phone ?? "").replace(/\D/g, "").slice(-10);
      if (phone) m = orderPush(orders.get(phone), r.Name);
    } else if (slot === "contact" && prefOn(r, "orders")) {
      const phone = String(r.Phone ?? "").replace(/\D/g, "").slice(-10);
      if (phone) m = contactPush(orders.get(phone), r.Name);
    } else if (slot === "bag" && prefOn(r, "cart") && bagDue(r)) {
      m = cartPush(r);
    } else if (slot === "wishlist" && prefOn(r, "wishlist") && wishlistDue(r) && !(prefOn(r, "cart") && bagDue(r) && cartPush(r))) {
      m = wishlistPush(r);
    }
    return { row: r, msgs: m ? [m] : [] };
  });

  if (dry) {
    return Response.json({
      ok: true,
      dry: true,
      slot,
      vapid: pushConfigured(), // false → VAPID keys missing on the server, real sends would fail
      devices: rows.length,
      plan: plan.filter((p) => p.msgs.length).map((p) => ({ device: p.row["Device ID"], msgs: p.msgs })),
    });
  }

  if (!pushConfigured()) {
    console.error("push daily: VAPID keys missing — nothing sent");
    return Response.json({ ok: false, error: "VAPID keys missing on the server" }, { status: 500 });
  }
  const stats = { slot, devices: rows.length, sent: 0, failed: 0, gone: 0 };
  await pool(plan.filter((p) => p.msgs.length), 15, async ({ row, msgs }) => {
    let gone = false;
    for (const m of msgs) {
      const r = await sendPush(row, m);
      if (r === "gone") {
        gone = true;
        break;
      }
      stats[r === "sent" ? "sent" : "failed"] += 1;
    }
    if (gone) {
      stats.gone += 1;
      await pushRowUpdate(row["Device ID"], { Status: "gone", "Updated At": new Date().toISOString() });
    }
  });
  return Response.json({ ok: true, ...stats });
}

export const GET = run;
export const POST = run;
