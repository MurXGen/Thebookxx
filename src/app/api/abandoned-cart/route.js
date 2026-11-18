// Abandoned-cart tracking.
//
// One row per shopper/device, keyed by "Cart Key" (their 10-digit phone when
// logged in, otherwise a persistent device id). Every cart change upserts that
// one row (update if the key exists, else append) — so a shopper never spreads
// across multiple rows. When they place an order the row is marked "Converted".
//
// POST (default: sync)  { cartKey, name, phone, deviceId, books, itemCount,
//                         cartValue, source }
// POST { action: "convert", cartKey, orderId }  → Status = Converted (+ order id)
//
// Stored in the "Abandoned Cart" tab. Columns:
//   Cart Key | Name | Phone | Device ID | Books | Item Count | Cart Value |
//   Source | First Added | Last Updated | Status | Order ID

import {
  cartAppend,
  cartUpdate,
  cartRowExists,
  cartAllRows,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

// Format in IST (Asia/Kolkata) so the sheet matches India time, regardless of
// the server's own timezone (Vercel runs in UTC).
const fmtTs = (d) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value || "";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return `${g("day")}/${g("month")}/${g("year")} ${hh}:${g("minute")}:${g("second")}`;
};

const only10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);

// ── Duplicate-row guard ────────────────────────────────────────────────────
// The "does a row exist?" check reads the sheet via gviz, which can lag a few
// seconds behind writes — so two saves close together both saw "no row" and
// both appended. Now:
//  • the browser tells us when it already has a row (`known`), and we update
//    straight away, appending only if the sheet says no row matched;
//  • this server instance remembers keys it has written (recentRows);
//  • requests for the same key are run one at a time (keyChain).
const RECENT_TTL = 30 * 60 * 1000;
const recentRows = new Map(); // cartKey → last write ms
const keyChain = new Map(); // cartKey → tail promise
const markRow = (k) => {
  recentRows.set(k, Date.now());
  if (recentRows.size > 5000) {
    const cut = Date.now() - RECENT_TTL;
    for (const [key, t] of recentRows) if (t < cut) recentRows.delete(key);
  }
};
const isRecent = (k) => {
  const t = recentRows.get(k);
  return !!t && Date.now() - t < RECENT_TTL;
};
function serial(key, fn) {
  const prev = keyChain.get(key) || Promise.resolve();
  const run = prev.catch(() => {}).then(fn);
  const tail = run.catch(() => {});
  keyChain.set(key, tail);
  tail.then(() => {
    if (keyChain.get(key) === tail) keyChain.delete(key);
  });
  return run;
}
const notFound = (r) =>
  r && r.success === false && /not\s*found|no\s*(row|match|such)|unknown\s*(id|key)|does\s*n.?t\s*exist/i.test(String(r.error || ""));
// Update the key's row, or append `appendData` when it truly doesn't exist.
async function upsertCart(key, updateData, appendData, known) {
  if (known || isRecent(key) || (await cartRowExists(key))) {
    const r = await cartUpdate(key, updateData);
    if (!notFound(r)) {
      if (r?.success !== false) markRow(key);
      return { mode: "update", ok: r?.success !== false };
    }
  }
  const r = await cartAppend(appendData);
  if (r?.success !== false) markRow(key);
  return { mode: "append", ok: r?.success !== false };
}

// Admin list — every tracked cart, newest activity first.
export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`abcart-get:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  try {
    const rows = await cartAllRows();
    const toMs = (s) => {
      // Sheet stores "DD/MM/YYYY HH:mm:ss" (IST) — parse for sorting.
      const m = String(s || "").match(
        /(\d{2})\/(\d{2})\/(\d{4})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
      );
      if (!m) return 0;
      return new Date(
        +m[3],
        +m[2] - 1,
        +m[1],
        +m[4],
        +m[5],
        +(m[6] || 0),
      ).getTime();
    };
    const carts = rows
      .map((r) => ({
        cartKey: String(r["Cart Key"] ?? "").trim(),
        name: String(r["Name"] ?? "").trim(),
        phone: only10(r["Phone"]),
        deviceId: String(r["Device ID"] ?? "").trim(),
        books: String(r["Books"] ?? "").trim(),
        itemCount: Number(r["Item Count"] ?? 0) || 0,
        cartValue: Number(r["Cart Value"] ?? 0) || 0,
        source: String(r["Source"] ?? "").trim(),
        firstAdded: String(r["First Added"] ?? "").trim(),
        lastUpdated: String(r["Last Updated"] ?? "").trim(),
        status: String(r["Status"] ?? "Active").trim() || "Active",
        orderId: String(r["Order ID"] ?? "").trim(),
        suggestClicks: Number(r["Suggest Me Clicks"] ?? 0) || 0,
        viewBillClicks: Number(r["View Bill Clicks"] ?? 0) || 0,
        handlingInfoClicks: Number(r["Handling Info Clicks"] ?? 0) || 0,
      }))
      .filter((c) => c.cartKey)
      .sort((a, b) => toMs(b.lastUpdated) - toMs(a.lastUpdated));
    return Response.json({ carts });
  } catch {
    return Response.json({ carts: [] }, { status: 200 });
  }
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`abcart:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }

  const action = String(body.action || "sync");
  const cartKey = String(body.cartKey || "").trim();
  if (!cartKey)
    return Response.json(
      { success: false, error: "missing cartKey" },
      { status: 400 },
    );

  try {
    // Engagement events — increment a per-device click counter (Suggest me,
    // View bill, Handling & Care info). Creates a row if none exists yet so the
    // signal is never lost.
    if (action === "event") {
      const COL_BY_EVENT = {
        suggest: "Suggest Me Clicks",
        viewbill: "View Bill Clicks",
        handlinginfo: "Handling Info Clicks",
      };
      const col = COL_BY_EVENT[String(body.event || "").toLowerCase()];
      if (!col)
        return Response.json(
          { success: false, error: "unknown event" },
          { status: 400 },
        );
      const now = fmtTs(new Date());
      const known = !!body.known;
      const res = await serial(cartKey, async () => {
        // Need the current count to increment, so read the row (if any).
        const rows = await cartAllRows();
        const row = rows.find(
          (r) => String(r["Cart Key"] ?? "").trim() === cartKey,
        );
        const cur = Number(row?.[col] || 0) || 0;
        return upsertCart(
          cartKey,
          { [col]: cur + 1, "Last Updated": now },
          {
            "Cart Key": cartKey,
            Name: "",
            Phone: only10(body.phone),
            "Device ID": String(body.deviceId || cartKey).trim(),
            Books: "",
            "Item Count": 0,
            "Cart Value": 0,
            Source: String(body.source || "").trim(),
            "First Added": now,
            "Last Updated": now,
            Status: "Active",
            "Order ID": "",
            [col]: 1,
          },
          known || !!row,
        );
      });
      return Response.json({ success: res.ok, event: true, row: res.ok });
    }

    // Fill in Name / Phone on an existing row when the shopper logs in or
    // enters their details later (login modal, scratch-card modal, checkout).
    // Only touches the identity columns — never the Books snapshot.
    if (action === "identity") {
      const exists =
        !!body.known || isRecent(cartKey) || (await cartRowExists(cartKey));
      if (!exists) return Response.json({ success: true, skipped: true });
      const upd = { "Last Updated": fmtTs(new Date()) };
      const nm = String(body.name || "").trim();
      const ph = only10(body.phone);
      if (nm) upd["Name"] = nm;
      if (ph) upd["Phone"] = ph;
      await cartUpdate(cartKey, upd);
      return Response.json({ success: true, identity: true });
    }

    // Mark a cart as converted once the shopper places an order.
    if (action === "convert") {
      await cartUpdate(cartKey, {
        Status: "Converted",
        "Order ID": String(body.orderId || "").trim(),
        "Last Updated": fmtTs(new Date()),
      });
      return Response.json({ success: true, converted: true });
    }

    // sync: upsert the live cart snapshot.
    const now = fmtTs(new Date());
    const common = {
      Name: String(body.name || "").trim(),
      Phone: only10(body.phone),
      "Device ID": String(body.deviceId || "").trim(),
      Books: String(body.books || "").trim(),
      "Item Count": Number(body.itemCount || 0) || 0,
      "Cart Value": Number(body.cartValue || 0) || 0,
      Source: String(body.source || "").trim(),
      "Last Updated": now,
    };

    // Keep First Added + any prior Converted status untouched on update.
    const res = await serial(cartKey, () =>
      upsertCart(
        cartKey,
        common,
        {
          "Cart Key": cartKey,
          ...common,
          "First Added": now,
          Status: "Active",
          "Order ID": "",
        },
        !!body.known,
      ),
    );
    return Response.json({ success: res.ok, mode: res.mode, row: res.ok });
  } catch (e) {
    return Response.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
