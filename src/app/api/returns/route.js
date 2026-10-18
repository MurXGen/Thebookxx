// Return / exchange pickup requests.
//
// GET  /api/returns?orderId=ORD...         → requests for one order
// GET  /api/returns?phone=XXXXXXXXXX       → requests for one phone
// POST { action: "create", ... }           → raise a request (customer)
// POST { action: "receive", requestId }    → admin: mark books received,
//        idempotently credit the approved refund to the wallet, mark released.
//
// Refunds always go to the TheBookX wallet, and ONLY when an admin marks the
// request "received" here — never on a manual sheet edit.

import {
  exchangeAppend,
  exchangeUpdate,
  exchangeAllRows,
  exchangeRowsForOrder,
  creditWalletForReturn,
  RETURN_TO_ADDRESS,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const digits10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`returns-get:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const orderId = String(searchParams.get("orderId") || "").trim();
  const phone = digits10(searchParams.get("phone"));
  const all = searchParams.get("all") === "1"; // admin console: every request

  try {
    let rows = [];
    if (orderId) rows = await exchangeRowsForOrder(orderId);
    else if (phone)
      rows = (await exchangeAllRows()).filter(
        (r) => digits10(r["Phone Number"]) === phone,
      );
    else if (all) rows = await exchangeAllRows();
    else return Response.json({ requests: [] }, { status: 400 });

    const requests = rows.map((r) => ({
      requestId: String(r["Request ID"] ?? "").trim(),
      orderId: String(r["Order ID"] ?? r["Order Id"] ?? "").trim(),
      customerName: String(r["Customer Name"] ?? ""),
      phone: digits10(r["Phone Number"]),
      returnBooks: String(r["Return Books"] ?? ""),
      extraBooks: String(r["Extra Books"] ?? ""),
      estimatedRefund: num(r["Estimated Refund"]),
      approvedRefund: num(r["Approved Refund Amount"]),
      status: String(r["Status"] ?? "Requested"),
      moneyReleased: /^\s*yes/i.test(String(r["Money Released"] ?? "")),
      pickupFrom: String(r["Pickup From"] ?? ""),
      updatedAt: String(r["Updated At"] ?? r["Timestamp"] ?? ""),
    }));
    return Response.json({ requests });
  } catch {
    return Response.json({ requests: [] }, { status: 200 });
  }
}

const fmtTs = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`returns-post:${ip}`, { limit: 15, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }
  const action = body?.action;

  // ── Customer raises a request ────────────────────────────────────────────
  if (action === "create") {
    const orderId = String(body.orderId || "").trim();
    const phone = digits10(body.phone);
    if (!orderId || phone.length !== 10)
      return Response.json(
        { success: false, error: "orderId + phone required" },
        { status: 400 },
      );

    // One open request per order: block a duplicate while one is still active.
    try {
      const existing = await exchangeRowsForOrder(orderId);
      const open = existing.find(
        (r) => !/reject/i.test(String(r["Status"] ?? "")),
      );
      if (open) {
        return Response.json({
          success: true,
          duplicate: true,
          requestId: String(open["Request ID"] ?? "").trim(),
        });
      }
    } catch {
      /* fall through — better to allow than to lose the request */
    }

    const returnBooks = Array.isArray(body.returnBooks)
      ? body.returnBooks.filter(Boolean)
      : [];
    const extraBooks = Array.isArray(body.extraBooks)
      ? body.extraBooks.filter(Boolean)
      : [];
    if (returnBooks.length === 0 && extraBooks.length === 0)
      return Response.json(
        { success: false, error: "pick at least one book" },
        { status: 400 },
      );

    const requestId = `RET${Date.now()}`;
    const now = new Date();
    const fields = {
      "Request ID": requestId,
      Timestamp: fmtTs(now),
      "Order ID": orderId,
      "Phone Number": phone,
      "Customer Name": String(body.customerName || ""),
      "Return Books": returnBooks.join(" | "),
      "Extra Books": extraBooks.join(" | "),
      "Estimated Refund": String(Math.max(0, Math.round(num(body.estimated)))),
      "Approved Refund Amount": "",
      Status: "Requested",
      "Money Released": "No",
      "Pickup From": String(body.pickupFrom || ""),
      "Pickup To": RETURN_TO_ADDRESS,
      Notes: String(body.notes || ""),
      "Updated At": fmtTs(now),
    };
    try {
      await exchangeAppend(fields);
      return Response.json({ success: true, requestId });
    } catch {
      return Response.json({ success: false }, { status: 502 });
    }
  }

  // ── Admin marks books received → credit the approved refund to the wallet ──
  if (action === "receive") {
    const requestId = String(body.requestId || "").trim();
    if (!requestId)
      return Response.json(
        { success: false, error: "requestId required" },
        { status: 400 },
      );
    try {
      const rows = await exchangeAllRows();
      const row = rows.find(
        (r) => String(r["Request ID"] ?? "").trim() === requestId,
      );
      if (!row)
        return Response.json(
          { success: false, error: "not found" },
          { status: 404 },
        );

      // Approved amount: prefer the amount passed from the admin UI, else the
      // value the team typed into the sheet column.
      const approved =
        body.amount != null && body.amount !== ""
          ? Math.max(0, Math.round(num(body.amount)))
          : Math.max(0, Math.round(num(row["Approved Refund Amount"])));
      if (approved <= 0)
        return Response.json(
          { success: false, error: "set an approved refund amount first" },
          { status: 400 },
        );

      const phone = digits10(row["Phone Number"]);
      const now = new Date();
      // Idempotent credit (keyed by Request ID) — safe to call again.
      const credit = await creditWalletForReturn({
        phone,
        requestId,
        amount: approved,
        reason: `Return refund · Order ${String(row["Order ID"] ?? "").trim()}`,
      });
      await exchangeUpdate(requestId, {
        "Approved Refund Amount": String(approved),
        Status: "Refunded",
        "Money Released": "Yes",
        "Updated At": fmtTs(now),
      });
      return Response.json({
        success: true,
        approved,
        credited: credit.wrote === true,
        already: credit.already === true,
      });
    } catch {
      return Response.json({ success: false }, { status: 502 });
    }
  }

  return Response.json(
    { success: false, error: "invalid action" },
    { status: 400 },
  );
}
