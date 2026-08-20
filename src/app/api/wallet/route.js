// Server-side proxy for a customer's wallet ledger entries.
//
// Browser calls `/api/wallet?phone=XXXXXXXXXX`; the server reads the sheet
// (scoped to that phone via a gviz `where`) and returns only that customer's
// raw {date, amount} wallet rows. Balance/expiry math stays on the client.

import { gvizQuery, tableToObjects, findColumn } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const parseSheetDate = (input) => {
  if (!input) return null;
  const str = String(input).trim();
  if (!str) return null;
  const m = str.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
  if (m)
    return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  const dmy = str.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i,
  );
  if (dmy) {
    let h = dmy[4] ? +dmy[4] : 0;
    const mer = (dmy[7] || "").toLowerCase();
    if (mer === "pm" && h < 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
    return new Date(+dmy[3], +dmy[2] - 1, +dmy[1], h, dmy[5] ? +dmy[5] : 0, 0);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`wallet:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const digits = String(searchParams.get("phone") || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (digits.length !== 10) {
    return Response.json({ entries: [] }, { status: 400 });
  }

  try {
    const meta = await gvizQuery({ tq: "select * limit 0" });
    const phoneCol = findColumn(meta, "Phone Number");
    let where = "";
    if (phoneCol) {
      where =
        phoneCol.type === "number"
          ? `where ${phoneCol.id} = ${digits}`
          : `where ${phoneCol.id} = '${digits}'`;
    }
    const table = await gvizQuery({ tq: `select * ${where}`.trim() });
    const serverFiltered = !!phoneCol;

    const entries = tableToObjects(table)
      .filter((o) =>
        serverFiltered
          ? true
          : String(o["Phone Number"] ?? "").replace(/\D/g, "").slice(-10) ===
            digits,
      )
      .map((o) => {
        const amt = parseFloat(o["Wallet"] ?? o["wallet"] ?? 0);
        const date =
          parseSheetDate(
            o["Timestamp (D)"] || o["Timestamp"] || o["Timestamp(D)"],
          ) || new Date();
        return { date: date.getTime(), amount: amt };
      })
      .filter((e) => !isNaN(e.amount) && e.amount !== 0);

    return Response.json({ entries });
  } catch (e) {
    return Response.json({ entries: [] }, { status: 200 });
  }
}
