// SERVER-ONLY configuration for Google Sheets / Apps Script.
//
// Import this ONLY from route handlers under src/app/api/** (server code).
// Never import it from a client component ("use client") or it will be bundled
// into the browser and defeat the purpose.
//
// Values come from environment variables (set them in .env.local and in your
// host's env). Fallbacks keep the app working before the env vars are set, but
// for real protection set the env vars so the IDs/URLs are not in the source at
// all.

export const ORDERS_SHEET_ID =
  process.env.ORDERS_SHEET_ID || "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";

export const ORDERS_SHEET_NAME =
  process.env.ORDERS_SHEET_NAME || "Form responses 1";

// Apps Script web apps (writes/edits). Keep these on the server so nobody can
// call them directly to forge/modify sheet rows.
export const APPSCRIPT_ORDER_URL =
  process.env.APPSCRIPT_ORDER_URL ||
  "https://script.google.com/macros/s/AKfycbzHQ2gs25qh7stuSdWWV_g4r3Im_6HUgUxxcbahkyWsY6d-VjO0ppwgiezokxHd5fqzKA/exec";

export const APPSCRIPT_EDIT_URL =
  process.env.APPSCRIPT_EDIT_URL ||
  "https://script.google.com/macros/s/AKfycbzYyEYufYZBP4pV-sJvgTvTBrcIb3iNUH3BgDD31zCL9xiULoKWnATFfad2awNMgvyC/exec";

const gvizBase = (sheetName) =>
  `https://docs.google.com/spreadsheets/d/${ORDERS_SHEET_ID}/gviz/tq?tqx=out:json${
    sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ""
  }`;

// Parse a gviz JSON-with-prefix response body into an object.
export const parseGviz = (t) =>
  JSON.parse(t.substring(t.indexOf("{"), t.lastIndexOf("}") + 1));

// Run a gviz query (optionally a `tq` SQL string) against the orders sheet on
// the server and return the raw table. `tq` runs on Google's side so we can
// scope by phone without ever pulling the whole sheet.
export async function gvizQuery({ tq = "", sheet = "" } = {}) {
  const url = `${gvizBase(sheet)}${tq ? `&tq=${encodeURIComponent(tq)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`gviz HTTP ${res.status}`);
  const data = parseGviz(await res.text());
  return data.table || { cols: [], rows: [] };
}

// Map a gviz table into an array of {header: value} row objects.
export function tableToObjects(table) {
  const headers = (table.cols || []).map((c) => c.label);
  return (table.rows || []).map((row) => {
    const obj = {};
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
      if (formatted && typeof value === "string" && value.startsWith("Date(")) {
        value = formatted;
      }
      obj[header] = value;
    });
    return obj;
  });
}

// Resolve a column's gviz id/type by its header label (for building `tq`
// filters like `where B = '<phone>'` regardless of column order).
export function findColumn(table, label) {
  return (table.cols || []).find((c) => c.label === label) || null;
}
