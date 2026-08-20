// Server-side proxy for a customer's order lookup.
//
// The browser calls `/api/orders?phone=XXXXXXXXXX` and this handler talks to
// Google on the server, so the sheet ID/URL never ships to the browser, and
// Google filters by phone on its side — only THIS customer's rows are fetched.

import {
  gvizQuery,
  tableToObjects,
  findColumn,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`orders:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const phone = String(searchParams.get("phone") || "").trim();

  if (!/^\d{10}$/.test(phone)) {
    return Response.json(
      { error: "A valid 10-digit phone number is required." },
      { status: 400 },
    );
  }

  try {
    // Step 1 — column metadata only (zero data rows → no PII) to locate the
    // Phone Number column.
    const meta = await gvizQuery({ tq: "select * limit 0" });
    const phoneCol = findColumn(meta, "Phone Number");

    // Step 2 — fetch ONLY this phone's rows (filter runs on Google's side).
    let where = "";
    if (phoneCol) {
      where =
        phoneCol.type === "number"
          ? `where ${phoneCol.id} = ${phone}`
          : `where ${phoneCol.id} = '${phone}'`;
    }
    const table = await gvizQuery({ tq: `select * ${where}`.trim() });
    const serverFiltered = !!phoneCol;

    const orders = tableToObjects(table).filter((o) =>
      serverFiltered ? true : String(o["Phone Number"]).trim() === phone,
    );

    return Response.json({ orders });
  } catch (e) {
    return Response.json(
      { error: "Could not fetch orders right now." },
      { status: 502 },
    );
  }
}
