// Server-side proxy for a single order lookup by Order ID.
//
// Used by the invoice / merchant-confirm flows and by the UPI confirmation
// poller. The sheet is read on the server (scoped to the given Order ID), so
// the sheet URL never ships to the browser.

import { gvizQuery, tableToObjects, findColumn } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`order:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const id = String(searchParams.get("orderId") || "").trim();
  // Optional ownership check: when the caller supplies the phone number (the
  // logged-in customer's own number), the full row is returned ONLY if it
  // belongs to that number. This scopes the customer-facing order-detail page
  // so an enumerable Order ID can't reveal another customer's PII.
  const phone = String(searchParams.get("phone") || "").replace(/\D/g, "").slice(-10);
  if (!id) {
    return Response.json(
      { order: null, found: false, confirmed: false },
      { status: 400 },
    );
  }

  try {
    const meta = await gvizQuery({ tq: "select * limit 0" });
    const idCol = findColumn(meta, "Order ID");
    // Order IDs are text; escape single quotes defensively.
    const safe = id.replace(/'/g, "");
    const where = idCol ? `where ${idCol.id} = '${safe}'` : "";
    const table = await gvizQuery({ tq: `select * ${where}`.trim() });

    const rows = tableToObjects(table).filter((o) =>
      idCol ? true : String(o["Order ID"] ?? "").trim() === id,
    );
    const order = rows.length ? rows[rows.length - 1] : null; // keep last

    let confirmed = false;
    if (order) {
      const nm = String(order["Customer Name"] ?? "");
      const st = String(order["Order Status"] ?? "");
      if (!/unconfirmed/i.test(nm) || /received|confirmed|paid/i.test(st)) {
        confirmed = true;
      }
    }

    // Enforce ownership when a phone number was supplied: never return another
    // customer's row. Status flags are safe to return (used by the poller).
    if (order && /^\d{10}$/.test(phone)) {
      const rowPhone = String(order["Phone Number"] ?? "")
        .replace(/\D/g, "")
        .slice(-10);
      if (rowPhone !== phone) {
        return Response.json({
          order: null,
          found: false,
          confirmed: false,
          denied: true,
        });
      }
    }

    return Response.json({ order, found: !!order, confirmed });
  } catch (e) {
    return Response.json(
      { order: null, found: false, confirmed: false },
      { status: 502 },
    );
  }
}
