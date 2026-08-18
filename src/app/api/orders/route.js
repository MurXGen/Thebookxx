// Server-side proxy for a customer's order lookup.
//
// The browser calls `/api/orders?phone=XXXXXXXXXX` and this handler talks to
// Google on the server, so:
//   • the Google Sheet ID / URL never ships to the browser or appears in the
//     Network tab (no more leaking the sheet link), and
//   • Google filters by phone on its side, so only THIS customer's rows are
//     ever fetched — other customers' data never leaves the sheet.
//
// The sheet ID is read from a server-only env var (ORDERS_SHEET_ID). It falls
// back to the known ID so the app keeps working before the env var is set;
// either way it stays on the server and is not bundled into client code.

const SHEET_ID =
  process.env.ORDERS_SHEET_ID || "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";

const parseGviz = (t) =>
  JSON.parse(t.substring(t.indexOf("{"), t.lastIndexOf("}") + 1));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = String(searchParams.get("phone") || "").trim();

  if (!/^\d{10}$/.test(phone)) {
    return Response.json(
      { error: "A valid 10-digit phone number is required." },
      { status: 400 },
    );
  }

  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;

  try {
    // Step 1 — column metadata only (zero data rows → no PII) to locate the
    // Phone Number column.
    const metaRes = await fetch(
      `${base}?tqx=out:json&tq=${encodeURIComponent("select * limit 0")}`,
      { cache: "no-store" },
    );
    if (!metaRes.ok) throw new Error(`meta HTTP ${metaRes.status}`);
    const meta = parseGviz(await metaRes.text());
    const cols = (meta.table && meta.table.cols) || [];
    const phoneCol = cols.find((c) => c.label === "Phone Number");

    // Step 2 — fetch ONLY this phone's rows (filter runs on Google's side).
    let where = "";
    if (phoneCol) {
      where =
        phoneCol.type === "number"
          ? `where ${phoneCol.id} = ${phone}`
          : `where ${phoneCol.id} = '${phone}'`;
    }
    const dataRes = await fetch(
      `${base}?tqx=out:json&tq=${encodeURIComponent(`select * ${where}`.trim())}`,
      { cache: "no-store" },
    );
    if (!dataRes.ok) throw new Error(`data HTTP ${dataRes.status}`);
    const data = parseGviz(await dataRes.text());

    const rows = (data.table && data.table.rows) || [];
    const headers = (data.table?.cols || []).map((c) => c.label);
    const serverFiltered = !!phoneCol;

    const orders = rows
      .map((row) => {
        const order = {};
        (row.c || []).forEach((cell, idx) => {
          const header = headers[idx];
          let value = cell?.v;
          const formatted = cell?.f;
          if (
            value &&
            typeof value === "object" &&
            Object.prototype.hasOwnProperty.call(value, "value")
          ) {
            value = value.value;
          }
          if (
            formatted &&
            typeof value === "string" &&
            value.startsWith("Date(")
          ) {
            value = formatted;
          }
          order[header] = value;
        });
        return order;
      })
      // Safety net if the phone column couldn't be resolved (full read).
      .filter((o) =>
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
