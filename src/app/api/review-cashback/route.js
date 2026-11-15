// Review cashback: after a shopper submits a review, credit ₹40–₹47 to their
// TheBookX wallet — but only when their current balance is below ₹50.
//
// The amount is decided HERE (never by the browser) and written once per phone:
//   • phone must be a 10-digit number with at least one order on record
//   • wallet balance (same maths as /api/wallet + walletLedger) must be < ₹50
//   • no earlier "Review cashback" credit for this phone
// Response: { status: "credited", amount } or { status: "ineligible", reason, balance? }

import {
  gvizQuery,
  tableToObjects,
  findColumn,
  walletAppend,
  walletRowsForPhone,
  ORDERS_SHEET_NAME,
} from "@/lib/serverSheets";
import { GET as walletGET } from "@/app/api/wallet/route";
import { computeWalletLedger } from "@/utils/walletLedger";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const MIN_CASHBACK = 40;
const MAX_CASHBACK = 47;
const BALANCE_CAP = 50; // only wallets below this get cashback
const REASON = "Review cashback (scratch card)";

const fmtTs = (d = new Date()) =>
  d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

async function hasOrder(digits) {
  const meta = await gvizQuery({ sheet: ORDERS_SHEET_NAME, tq: "select * limit 0" });
  const col = findColumn(meta, "Phone Number");
  if (!col) return false;
  const where = col.type === "number" ? `where ${col.id} = ${digits}` : `where ${col.id} = '${digits}'`;
  const table = await gvizQuery({ sheet: ORDERS_SHEET_NAME, tq: `select ${col.id} ${where} limit 1` });
  return tableToObjects(table).length > 0;
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`review-cashback:${ip}`, { limit: 5, windowMs: 10 * 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  const digits = String(body.phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return Response.json({ status: "ineligible", reason: "no_phone" });

  try {
    // One review cashback per phone, ever.
    const rows = await walletRowsForPhone(digits);
    const claimed = rows.some((r) => /review cashback/i.test(String(r["Reason"] ?? r["reason"] ?? "")));
    if (claimed) return Response.json({ status: "ineligible", reason: "claimed" });

    if (!(await hasOrder(digits))) return Response.json({ status: "ineligible", reason: "no_order" });

    // Balance with the exact rules the wallet page uses (expiry, pending, locks).
    const wRes = await walletGET(new Request(`http://local/api/wallet?phone=${digits}`, { headers: request.headers }));
    const wJson = await wRes.json().catch(() => ({}));
    const entries = (Array.isArray(wJson.entries) ? wJson.entries : []).map((e) => ({ ...e, date: new Date(e.date) }));
    const { balance } = computeWalletLedger(entries);
    if (balance >= BALANCE_CAP) return Response.json({ status: "ineligible", reason: "balance", balance });

    const amount = MIN_CASHBACK + Math.floor(Math.random() * (MAX_CASHBACK - MIN_CASHBACK + 1));
    const res = await walletAppend({
      Timestamp: fmtTs(),
      "Phone Number": digits,
      Amount: String(amount),
      Type: "Credit",
      Reason: REASON,
      "Order ID": "",
    });
    if (!res?.success) return Response.json({ status: "error" }, { status: 502 });
    return Response.json({ status: "credited", amount, balance: balance + amount });
  } catch {
    return Response.json({ status: "error" }, { status: 502 });
  }
}
