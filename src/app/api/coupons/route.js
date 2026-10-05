// Coupons API (Coupons tab).
//   GET  /api/coupons?cartValue=499
//        → { coupons: [{code,title,type,value,maxDiscount,minOrder,status,usable,
//            discount,reason}] }  (Deactivated hidden; limit/expiry → "expired")
//   POST /api/coupons { action:"validate", code, cartValue }
//        → { ok, code, title, type, value, discount, reason }
//   POST /api/coupons { action:"redeem", code }
//        → increments Used Count by 1 (called when the order is placed)

import { couponRows, couponUpdate } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
};
const up = (s) => String(s ?? "").trim().toUpperCase();

const parseDate = (input) => {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  const m = s.match(/Date\((\d+),(\d+),(\d+)/);
  if (m) return new Date(+m[1], +m[2], +m[3], 23, 59, 59);
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1], 23, 59, 59);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

// Normalise a sheet row into a coupon object + computed status.
function parseCoupon(r) {
  const code = up(r.Code ?? r.code);
  if (!code) return null;
  const rawStatus = String(r.Status ?? r.status ?? "active").toLowerCase();
  const type = /flat|amount|rs|₹/i.test(String(r.Type ?? r.type))
    ? "flat"
    : "percent";
  const value = num(r.Value ?? r.value);
  const maxDiscount = num(r["Max Discount"] ?? r.maxDiscount);
  const minOrder = num(r["Min Order"] ?? r.minOrder);
  const usageLimit = num(r["Usage Limit"] ?? r.usageLimit);
  const usedCount = num(r["Used Count"] ?? r.usedCount);
  const expiry = parseDate(r.Expiry ?? r.expiry);

  let status = "active";
  if (/deactiv|disable|hidden/.test(rawStatus)) status = "deactivated";
  else if (/expire/.test(rawStatus)) status = "expired";
  else if (expiry && expiry.getTime() < Date.now()) status = "expired";
  else if (usageLimit > 0 && usedCount >= usageLimit) status = "expired";

  return {
    code,
    title: String(r.Title ?? r.title ?? "").trim() || code,
    type,
    value,
    maxDiscount,
    minOrder,
    usageLimit,
    usedCount,
    status,
  };
}

function discountFor(c, cartValue) {
  const base = Math.max(0, num(cartValue));
  if (c.minOrder > 0 && base < c.minOrder)
    return { ok: false, discount: 0, reason: `Min order ₹${c.minOrder}` };
  let d =
    c.type === "flat"
      ? Math.min(c.value, base)
      : Math.round((base * c.value) / 100);
  if (c.type === "percent" && c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
  d = Math.max(0, Math.min(d, base));
  return { ok: d > 0, discount: d, reason: d > 0 ? "" : "No discount" };
}

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`coupon-get:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const cartValue = num(searchParams.get("cartValue"));

  const rows = await couponRows();
  const coupons = rows
    .map(parseCoupon)
    .filter((c) => c && c.status !== "deactivated")
    .map((c) => {
      const d = c.status === "active" ? discountFor(c, cartValue) : null;
      return {
        code: c.code,
        title: c.title,
        type: c.type,
        value: c.value,
        maxDiscount: c.maxDiscount,
        minOrder: c.minOrder,
        status: c.status, // "active" | "expired"
        usable: c.status === "active" && (d ? d.ok : true),
        discount: d ? d.discount : 0,
        reason: d ? d.reason : "",
      };
    });

  return Response.json({ coupons });
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`coupon-post:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body = {};
  try {
    body = await request.json();
  } catch {}
  const action = String(body.action || "").toLowerCase();
  const code = up(body.code);
  if (!code)
    return Response.json({ ok: false, reason: "No code" }, { status: 400 });

  const rows = await couponRows();
  const found = rows.map(parseCoupon).find((c) => c && c.code === code);

  if (action === "validate") {
    if (!found) return Response.json({ ok: false, reason: "Invalid code" });
    if (found.status === "deactivated")
      return Response.json({ ok: false, reason: "Not available" });
    if (found.status === "expired")
      return Response.json({ ok: false, reason: "Expired or limit reached" });
    const d = discountFor(found, body.cartValue);
    return Response.json({
      ok: d.ok,
      code: found.code,
      title: found.title,
      type: found.type,
      value: found.value,
      discount: d.discount,
      reason: d.reason,
    });
  }

  if (action === "redeem") {
    if (!found) return Response.json({ ok: false, reason: "Invalid code" });
    const next = found.usedCount + 1;
    const r = await couponUpdate(found.code, { "Used Count": next });
    return Response.json({ ok: !!r.success, usedCount: next });
  }

  return Response.json({ ok: false, reason: "Bad action" }, { status: 400 });
}
