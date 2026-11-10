// 2-hour device offer on book pages, logged to the "Timers" tab.
//
// GET  ?deviceId=…                                → { endsAt } from the sheet,
//      so editing "Ends At" in the tab extends or shortens that device's offer
// POST { action: "start", deviceId, startedAt, endsAt, book, page }
// POST { action: "expired", deviceId }            → Status = Expired
// POST { action: "resumed", deviceId, endsAt }    → Status = Extended (admin
//                                                   moved Ends At later)
// POST { action: "extend-request", deviceId }     → Extend Requested = time
// POST { action: "convert", deviceId, orderId, phone, priceMode }
// POST { action: "adds", deviceId, detail, card }  → Detail Adds / Card Adds
//      (bag adds from the book page vs from book cards elsewhere)
//
// Columns:
//   Device ID | Started At | Ends At | First Book | First Page | Status |
//   Expired At | Converted | Order ID | Converted At | Price Paid | Phone |
//   Extend Requested | Detail Adds | Card Adds
//
// To extend a device's offer, edit its "Ends At" cell (DD/MM/YYYY HH:MM, IST).

import { timerAppend, timerUpdate, timerRowByDevice } from "@/lib/serverSheets";
import { parseSheetTime, fmtTs } from "@/lib/sheetTime";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";


export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`timers-get:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);
  const deviceId = clip(new URL(request.url).searchParams.get("deviceId"), 60);
  if (!deviceId) return Response.json({ success: false }, { status: 400 });
  const row = await timerRowByDevice(deviceId);
  if (!row) return Response.json({ success: true, found: false });
  return Response.json(
    { success: true, found: true, endsAt: parseSheetTime(row["Ends At"]) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

const clip = (v, n = 80) => String(v || "").trim().slice(0, n);
const only10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const tsOrNow = (v) => {
  const n = Number(v);
  // Accept client times within a day of now; otherwise use the server clock.
  return Number.isFinite(n) && Math.abs(n - Date.now()) < 864e5 * 1.2 ? new Date(n) : new Date();
};

// Device IDs whose "start" this server instance handled in the last few
// minutes. The sheet read lags the append, so two near-simultaneous starts
// for one device would otherwise both add a row.
const recentStarts = new Map();
const START_DEDUPE_MS = 5 * 60 * 1000;
function claimStart(id) {
  const now = Date.now();
  for (const [k, t] of recentStarts) if (now - t > START_DEDUPE_MS) recentStarts.delete(k);
  if (recentStarts.has(id)) return false;
  recentStarts.set(id, now);
  return true;
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`timers:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }
  const action = String(body.action || "");
  const deviceId = clip(body.deviceId, 60);
  if (!deviceId || !["start", "expired", "resumed", "extend-request", "convert", "adds"].includes(action))
    return Response.json({ success: false, error: "bad request" }, { status: 400 });

  try {
    const row = await timerRowByDevice(deviceId);
    const now = fmtTs(new Date());

    if (action === "start") {
      if (row) return Response.json({ success: true, already: true });
      if (!claimStart(deviceId)) return Response.json({ success: true, already: true });
      const start = tsOrNow(body.startedAt);
      const res = await timerAppend({
        "Device ID": deviceId,
        "Started At": fmtTs(start),
        "Ends At": fmtTs(new Date(start.getTime() + 2 * 3600 * 1000)),
        "First Book": clip(body.book, 120),
        "First Page": clip(body.page, 160),
        Status: "Running",
        "Expired At": "",
        Converted: "No",
        "Order ID": "",
        "Converted At": "",
        "Price Paid": "",
        Phone: "",
        "Extend Requested": "",
      });
      if (!res?.success) {
        recentStarts.delete(deviceId); // let a retry through
        console.error("[timers] append failed", res?.error || res);
        return Response.json({ success: false, error: "sheet append failed" });
      }
      return Response.json({ success: true });
    }

    if (!row) return Response.json({ success: true, skipped: true });

    if (action === "adds") {
      // Absolute totals from the device; never lower what's already recorded.
      const n = (v, cur) => Math.max(Math.min(Math.floor(Number(v) || 0), 100000), Number(cur) || 0);
      await timerUpdate(deviceId, {
        "Detail Adds": n(body.detail, row["Detail Adds"]),
        "Card Adds": n(body.card, row["Card Adds"]),
      });
      return Response.json({ success: true });
    }

    if (action === "expired") {
      if (String(row.Status || "") === "Expired") return Response.json({ success: true, already: true });
      await timerUpdate(deviceId, { Status: "Expired", "Expired At": now });
      return Response.json({ success: true });
    }

    if (action === "resumed") {
      await timerUpdate(deviceId, { Status: "Extended" });
      return Response.json({ success: true });
    }

    if (action === "extend-request") {
      await timerUpdate(deviceId, { "Extend Requested": now });
      return Response.json({ success: true });
    }

    // convert — record the first order only
    if (String(row.Converted || "").toLowerCase() === "yes")
      return Response.json({ success: true, already: true });
    await timerUpdate(deviceId, {
      Converted: "Yes",
      "Order ID": clip(body.orderId, 40),
      "Converted At": now,
      "Price Paid": body.priceMode === "Offer" ? "Offer price" : "After +₹20",
      ...(only10(body.phone) ? { Phone: only10(body.phone) } : {}),
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error("[timers] error", e);
    return Response.json({ success: false }, { status: 200 });
  }
}
