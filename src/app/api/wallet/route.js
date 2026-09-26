// Server-side proxy for a customer's wallet ledger entries.
//
// Browser calls `/api/wallet?phone=XXXXXXXXXX`; the server reads the sheet
// (scoped to that phone via a gviz `where`) and returns only that customer's
// raw {date, amount} wallet rows. Balance/expiry math stays on the client.

import {
  gvizQuery,
  tableToObjects,
  findColumn,
  WALLET_SHEET_NAME,
  ORDERS_SHEET_NAME,
} from "@/lib/serverSheets";
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
    // Read the dedicated Wallet ledger tab, scoped to this phone.
    const meta = await gvizQuery({
      sheet: WALLET_SHEET_NAME,
      tq: "select * limit 0",
    });
    const phoneCol = findColumn(meta, "Phone Number");
    let where = "";
    if (phoneCol) {
      where =
        phoneCol.type === "number"
          ? `where ${phoneCol.id} = ${digits}`
          : `where ${phoneCol.id} = '${digits}'`;
    }
    const table = await gvizQuery({
      sheet: WALLET_SHEET_NAME,
      tq: `select * ${where}`.trim(),
    });
    const serverFiltered = !!phoneCol;

    const entries = tableToObjects(table)
      .filter((o) =>
        serverFiltered
          ? true
          : String(o["Phone Number"] ?? "").replace(/\D/g, "").slice(-10) ===
            digits,
      )
      .map((o) => {
        // Amount is signed (+credit / −debit). Fall back to Type if a row only
        // stores a positive magnitude with a Debit type.
        let amt = parseFloat(o["Amount"] ?? o["amount"] ?? 0);
        const type = String(o["Type"] ?? o["type"] ?? "").toLowerCase();
        if (!isNaN(amt) && amt > 0 && type.startsWith("deb")) amt = -amt;
        const date =
          parseSheetDate(
            o["Timestamp (D)"] || o["Timestamp"] || o["Timestamp(D)"],
          ) || new Date();
        return {
          date: date.getTime(),
          amount: amt,
          type: type || (amt >= 0 ? "credit" : "debit"),
          reason: o["Reason"] ?? o["reason"] ?? "",
          orderId: o["Order ID"] ?? o["Order Id"] ?? "",
        };
      })
      .filter((e) => !isNaN(e.amount) && e.amount !== 0)
      // Pending recharges (Type/Reason marked "unconfirmed") don't count toward
      // the balance until an admin confirms them (removes the marker). Once
      // confirmed the row appears here — which the recharge poller relies on.
      .filter(
        (e) =>
          !/unconfirmed/i.test(e.type) && !/unconfirmed/i.test(e.reason || ""),
      );

    // Cross-reference the orders sheet (scoped to this phone) once, to power:
    //   (a) CANCELLED-order refunds — a wallet debit tagged with a cancelled
    //       order's id stops reducing the balance (amount returned).
    //   (b) ORPHAN reward coins — a scratch-card CREDIT whose linked Order ID is
    //       NOT found in this phone's orders is invalid: it's hidden and not
    //       spendable. Only coins tied to a real, present order (or with no order
    //       link at all, e.g. manual/goodwill credits) count.
    // Safety: any failure reading the orders sheet leaves everything untouched
    // (no refunds applied, nothing hidden) — we never penalise on a failed read.
    const anyOrderLinked = entries.some((e) => e.orderId);
    let presentIds = new Set();
    let cancelledIds = new Set();
    let ordersReadOk = false;
    if (anyOrderLinked) {
      try {
        const oMeta = await gvizQuery({
          sheet: ORDERS_SHEET_NAME,
          tq: "select * limit 0",
        });
        const oPhoneCol = findColumn(oMeta, "Phone Number");
        let oWhere = "";
        if (oPhoneCol) {
          oWhere =
            oPhoneCol.type === "number"
              ? `where ${oPhoneCol.id} = ${digits}`
              : `where ${oPhoneCol.id} = '${digits}'`;
        }
        const oTable = await gvizQuery({
          sheet: ORDERS_SHEET_NAME,
          tq: `select * ${oWhere}`.trim(),
        });
        tableToObjects(oTable).forEach((row) => {
          const oid = String(row["Order ID"] ?? row["Order Id"] ?? "").trim();
          if (!oid) return;
          presentIds.add(oid);
          const status = String(row["Order Status"] ?? "");
          if (/cancel/i.test(status)) cancelledIds.add(oid);
        });
        ordersReadOk = true;
      } catch {
        presentIds = new Set(); // read failed → hide nothing (safe)
        cancelledIds = new Set(); // read failed → refund nothing (safe)
        ordersReadOk = false;
      }
    }

    const withLock = entries.map((e) => ({
      ...e,
      // A reward credit whose linked order is NOT found for this phone is an
      // orphan → locked (hidden + unspendable). Only applied on a good read.
      locked:
        ordersReadOk &&
        e.amount > 0 &&
        !!e.orderId &&
        !presentIds.has(String(e.orderId).trim()),
    }));

    const finalEntries =
      cancelledIds.size > 0
        ? withLock.filter(
            (e) =>
              !(
                e.amount < 0 &&
                e.orderId &&
                cancelledIds.has(String(e.orderId).trim())
              ),
          )
        : withLock;

    return Response.json({ entries: finalEntries });
  } catch (e) {
    return Response.json({ entries: [] }, { status: 200 });
  }
}
