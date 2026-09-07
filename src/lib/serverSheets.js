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

// Dedicated wallet ledger tab (Timestamp | Phone Number | Amount | Type |
// Reason | Order ID). One row per transaction.
export const WALLET_SHEET_NAME =
  process.env.WALLET_SHEET_NAME || "Wallet";

// Refer & Earn tabs.
//  ReferralCodes: Phone Number | Code | Created At | Total Referred | Total Earned
//  Referrals:     Referrer Phone | Code | Referred Phone | Applied At | Status
//                 | Reason | Reward | Qualifying Order ID | Rewarded At
export const REFERRAL_CODES_SHEET_NAME =
  process.env.REFERRAL_CODES_SHEET_NAME || "ReferralCodes";
export const REFERRALS_SHEET_NAME =
  process.env.REFERRALS_SHEET_NAME || "Referrals";

// Reward amounts (credited to wallets only when the referred friend's first
// order is DELIVERED). Two-sided: referrer earns, friend gets a welcome perk.
export const REFERRER_REWARD = Number(process.env.REFERRER_REWARD || 50);
export const REFEREE_REWARD = Number(process.env.REFEREE_REWARD || 30);

// Apps Script web apps (writes/edits). Keep these on the server so nobody can
// call them directly to forge/modify sheet rows.
export const APPSCRIPT_ORDER_URL =
  process.env.APPSCRIPT_ORDER_URL ||
  "https://script.google.com/macros/s/AKfycbzHQ2gs25qh7stuSdWWV_g4r3Im_6HUgUxxcbahkyWsY6d-VjO0ppwgiezokxHd5fqzKA/exec";

export const APPSCRIPT_EDIT_URL =
  process.env.APPSCRIPT_EDIT_URL ||
  "https://script.google.com/macros/s/AKfycbzYyEYufYZBP4pV-sJvgTvTBrcIb3iNUH3BgDD31zCL9xiULoKWnATFfad2awNMgvyC/exec";

// Dedicated Apps Script Web App that appends ONLY to the Wallet tab. Deploy the
// standalone script in docs/wallet-apps-script-standalone.gs and paste its /exec
// URL here (or set APPSCRIPT_WALLET_URL). When empty, wallet writes fall back to
// the order web app with a `sheet=Wallet` parameter.
export const APPSCRIPT_WALLET_URL = process.env.APPSCRIPT_WALLET_URL || "";

// Apps Script Web App for Refer & Earn (append + update to the ReferralCodes /
// Referrals tabs). Defaults to the orders-editor web app (APPSCRIPT_ORDER_URL),
// which now handles referral tabs too — so no extra deployment is needed once
// that script is redeployed. Override with APPSCRIPT_REFERRAL_URL if you host it
// separately. Reads use gviz directly.
export const APPSCRIPT_REFERRAL_URL =
  process.env.APPSCRIPT_REFERRAL_URL || APPSCRIPT_ORDER_URL;

// Shared secret sent (server-side only) with wallet writes so the wallet Apps
// Script can reject any request that doesn't carry it. Set the SAME value here
// (or via env) and in the wallet script's SHARED_SECRET constant.
export const APPSCRIPT_SHARED_SECRET = process.env.APPSCRIPT_SHARED_SECRET || "";

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

// ---------------------------------------------------------------------------
// Server-only Apps Script writers (never import from client components).
// ---------------------------------------------------------------------------

// Low-level POST to an Apps Script /exec endpoint (form-encoded, secret added).
async function appscriptPost(url, params) {
  if (!url) return { success: false, error: "not configured" };
  const body = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    body.set(k, typeof v === "object" ? JSON.stringify(v) : String(v ?? ""));
  });
  if (APPSCRIPT_SHARED_SECRET) body.set("secret", APPSCRIPT_SHARED_SECRET);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    let json = null;
    try {
      json = JSON.parse(await res.text());
    } catch {
      /* Apps Script may return non-JSON on redirect; treat as success */
    }
    if (!json) return { success: true };
    // Normalise: the orders-editor script returns { ok: true }, the standalone
    // scripts return { success: true } — accept either as success.
    return { ...json, success: json.success ?? json.ok ?? true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// Append one wallet ledger row (server-side; used by the referral payout).
export function walletAppend(data) {
  const url = APPSCRIPT_WALLET_URL || APPSCRIPT_ORDER_URL;
  return appscriptPost(url, {
    action: "append",
    sheet: WALLET_SHEET_NAME,
    data,
  });
}

// Append one row to a referral tab (ReferralCodes / Referrals).
export function referralAppend(sheet, data) {
  return appscriptPost(APPSCRIPT_REFERRAL_URL, {
    action: "append",
    sheet,
    data,
  });
}

// Update the first row in `sheet` where matchColumn == matchValue, setting the
// header→value pairs in `data`. Used to flip a referral to "rewarded".
export function referralUpdate(sheet, matchColumn, matchValue, data) {
  return appscriptPost(APPSCRIPT_REFERRAL_URL, {
    action: "update",
    sheet,
    matchColumn,
    matchValue,
    data,
  });
}

// Read every row of a referral tab (small tables — no phone scoping needed for
// code lookups; callers filter in-memory).
export async function referralRows(sheet) {
  try {
    const table = await gvizQuery({ sheet });
    return tableToObjects(table);
  } catch {
    return [];
  }
}
