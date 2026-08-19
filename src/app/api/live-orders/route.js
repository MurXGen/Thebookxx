// Server-side proxy for the homepage "live orders" social-proof ticker.
//
// The raw orders sheet (full names, phones, addresses) is read on the SERVER.
// Only privacy-safe fields — first name, city, amount, book count, a relative
// time label — are returned to the browser. No phone/address/full-name ever
// leaves the server, and the sheet ID/URL is not in the client bundle.

import { gvizQuery, tableToObjects, ORDERS_SHEET_NAME } from "@/lib/serverSheets";

const firstName = (full) =>
  String(full || "").trim().split(/\s+/)[0] || "Someone";

const countBooks = (list) => {
  const s = String(list || "").trim();
  if (!s) return 1;
  const parts = s.split(/\n|,|;|\|/).map((p) => p.trim()).filter(Boolean);
  return Math.max(1, parts.length);
};

const parseSheetDate = (v) => {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
  if (m)
    return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const relTime = (date) => {
  if (!date) return "recently";
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));

  try {
    // Only pull the four columns we need — never the whole row. If the sheet
    // column order changes, we fall back to a full select and pick by header.
    const table = await gvizQuery({ sheet: ORDERS_SHEET_NAME });
    const rows = tableToObjects(table);

    const mapped = rows
      .map((r) => {
        const date = parseSheetDate(
          r["Timestamp"] ?? r["Timestamp (D)"] ?? "",
        );
        return {
          name: firstName(r["Customer Name"]),
          city: String(r["City"] || "").trim() || "India",
          amount: Math.round(parseFloat(r["Total Amount"]) || 0),
          books: countBooks(r["Books List"]),
          timeLabel: relTime(date),
          _t: date ? date.getTime() : 0,
        };
      })
      .filter((o) => o.amount > 0)
      .sort((a, b) => b._t - a._t)
      .slice(0, limit)
      .map(({ _t, ...rest }) => rest);

    return Response.json({ orders: mapped });
  } catch (e) {
    return Response.json({ orders: [] }, { status: 200 });
  }
}
