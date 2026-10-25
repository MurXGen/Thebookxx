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
      const rows = await cartAllRows();
      const row = rows.find(
        (r) => String(r["Cart Key"] ?? "").trim() === cartKey,
      );
      if (row) {
        const cur = Number(row[col] || 0) || 0;
        await cartUpdate(cartKey, { [col]: cur + 1, "Last Updated": now });
      } else {
        await cartAppend({
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
        });
      }
      return Response.json({ success: true, event: true });
    }

    // Fill in Name / Phone on an existing row when the shopper logs in or
    // enters their details later (login modal, scratch-card modal, checkout).
    // Only touches the identity columns — never the Books snapshot.
    if (action === "identity") {
      const exists = await cartRowExists(cartKey);
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

    const exists = await cartRowExists(cartKey);
    if (exists) {
      // Keep First Added + any prior Converted status untouched.
      await cartUpdate(cartKey, common);
      return Response.json({ success: true, mode: "update" });
    }
    await cartAppend({
      "Cart Key": cartKey,
      ...common,
      "First Added": now,
      Status: "Active",
      "Order ID": "",
    });
    return Response.json({ success: true, mode: "append" });
  } catch (e) {
    return Response.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
