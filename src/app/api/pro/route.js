// TheBookX Exclusive (Pro) membership API.
//  GET  /api/pro?phone=XXXXXXXXXX  → { active, status, paidAt, expiresAt, daysLeft }
//  POST /api/pro { phone }         → appends an Unconfirmed ₹99 membership row
//
// Membership is valid for 30 days from the most recent PAID row. The customer
// pays ₹99 (row written Unconfirmed); an admin flips Status to "Paid" in the
// "Pro Plan" tab; the client polls this GET until it reports active.

import {
  proPlanRows,
  proPlanAppend,
  PRO_PLAN_SHEET_NAME,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const PRICE = 99;
const VALID_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

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

const isPaid = (s) => /paid|active|confirm|yes/i.test(String(s || ""));

function computeStatus(rows) {
  const now = Date.now();
  let latestPaid = null;
  let hasPending = false;
  rows.forEach((r) => {
    const status = String(r["Status"] ?? r["status"] ?? "");
    const ts =
      parseSheetDate(
        r["Timestamp"] || r["Timestamp (D)"] || r["Date"] || r["timestamp"],
      ) || null;
    if (isPaid(status)) {
      const t = ts ? ts.getTime() : now;
      if (!latestPaid || t > latestPaid) latestPaid = t;
    } else if (/unconfirm|pending/i.test(status)) {
      hasPending = true;
    }
  });
  if (latestPaid) {
    const expiresAt = latestPaid + VALID_DAYS * DAY;
    if (expiresAt > now) {
      return {
        active: true,
        status: "active",
        paidAt: latestPaid,
        expiresAt,
        daysLeft: Math.ceil((expiresAt - now) / DAY),
      };
    }
    return {
      active: false,
      status: "expired",
      paidAt: latestPaid,
      expiresAt,
      daysLeft: 0,
    };
  }
  return {
    active: false,
    status: hasPending ? "pending" : "none",
    paidAt: null,
    expiresAt: null,
    daysLeft: 0,
  };
}

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`pro-get:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const digits = String(searchParams.get("phone") || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (digits.length !== 10)
    return Response.json({ active: false, status: "none" }, { status: 400 });

  const rows = await proPlanRows(digits);
  return Response.json(computeStatus(rows));
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`pro-post:${ip}`, { limit: 10, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body = {};
  try {
    body = await request.json();
  } catch {}
  const digits = String(body.phone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (digits.length !== 10)
    return Response.json({ success: false, error: "bad phone" }, { status: 400 });

  // Already active? Don't write a duplicate — just report active.
  const existing = computeStatus(await proPlanRows(digits));
  if (existing.active) return Response.json({ success: true, ...existing });

  const now = new Date();
  const stamp = now.toLocaleString("en-IN", { hour12: true });
  await proPlanAppend({
    "Phone Number": digits,
    Amount: PRICE,
    Status: "Unconfirmed",
    Timestamp: stamp,
    Plan: "TheBookX Exclusive · Monthly",
    Expiry: new Date(now.getTime() + VALID_DAYS * DAY).toLocaleDateString(
      "en-IN",
    ),
  });
  return Response.json({ success: true, status: "pending", sheet: PRO_PLAN_SHEET_NAME });
}
