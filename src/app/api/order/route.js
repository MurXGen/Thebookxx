// Server-side proxy for a single order lookup by Order ID.
//
// Used by the invoice / merchant-confirm flows and by the UPI confirmation
// poller. The sheet is read on the server (scoped to the given Order ID), so
// the sheet URL never ships to the browser.

import { gvizQuery, tableToObjects, findColumn } from "@/lib/serverSheets";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = String(searchParams.get("orderId") || "").trim();
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

    return Response.json({ order, found: !!order, confirmed });
  } catch (e) {
    return Response.json(
      { order: null, found: false, confirmed: false },
      { status: 502 },
    );
  }
}
