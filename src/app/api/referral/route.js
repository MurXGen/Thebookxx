// Refer & Earn — server-side API.
//
// All code→phone lookups and eligibility checks run here so a referrer's phone
// number is never exposed to the browser, and rewards can't be forged.
//
// GET  /api/referral?action=resolve&code=ABC123
//        → { valid }                                (friend landing check)
//
// POST /api/referral   { action, ... }
//   action=create-code { phone }                    → { code }
//   action=apply-code  { phone, code }              → { status, message }
//   action=payout      { referredPhone, orderId }   → { status }  (on Delivered)
//
// Reward rule: two-sided, paid ONLY when the referred friend is a genuinely new
// customer AND their first order is Delivered. Existing customers = "none".

import {
  gvizQuery,
  tableToObjects,
  findColumn,
  referralRows,
  referralAppend,
  referralUpdate,
  walletAppend,
  REFERRAL_CODES_SHEET_NAME,
  REFERRALS_SHEET_NAME,
  REFERRER_REWARD,
  REFEREE_REWARD,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const ten = (v) => String(v || "").replace(/\D/g, "").slice(-10);

// 6-char code, uppercase, no ambiguous chars (0/O/1/I) to avoid mistypes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = () =>
  Array.from(
    { length: 6 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  ).join("");

const fmtTs = (d = new Date()) =>
  d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Does this phone already have at least one order in the orders sheet?
async function hasExistingOrder(phone) {
  try {
    const meta = await gvizQuery({ tq: "select * limit 0" });
    const phoneCol = findColumn(meta, "Phone Number");
    const where = phoneCol
      ? phoneCol.type === "number"
        ? `where ${phoneCol.id} = ${phone}`
        : `where ${phoneCol.id} = '${phone}'`
      : "";
    const table = await gvizQuery({ tq: `select * ${where} limit 1`.trim() });
    return (table.rows || []).length > 0;
  } catch {
    return false; // fail-open: don't wrongly block a genuine new customer
  }
}

// Is this phone's most-relevant order Delivered? (used at payout time)
async function orderIsDelivered(phone, orderId) {
  try {
    const meta = await gvizQuery({ tq: "select * limit 0" });
    const phoneCol = findColumn(meta, "Phone Number");
    const where = phoneCol
      ? phoneCol.type === "number"
        ? `where ${phoneCol.id} = ${phone}`
        : `where ${phoneCol.id} = '${phone}'`
      : "";
    const table = await gvizQuery({ tq: `select * ${where}`.trim() });
    const rows = tableToObjects(table);
    const match = orderId
      ? rows.find((r) => String(r["Order ID"] || "") === String(orderId))
      : rows[0];
    const status = String(
      match?.["Status"] || match?.["Order Status"] || "",
    ).toLowerCase();
    return /deliver/.test(status);
  } catch {
    return false;
  }
}

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`referral-get:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "";
  const code = String(searchParams.get("code") || "")
    .trim()
    .toUpperCase();

  if (action === "resolve") {
    if (!/^[A-Z0-9]{6}$/.test(code)) return Response.json({ valid: false });
    const rows = await referralRows(REFERRAL_CODES_SHEET_NAME);
    const found = rows.some(
      (r) => String(r["Code"] || "").toUpperCase() === code,
    );
    return Response.json({ valid: found });
  }

  return Response.json({ error: "unknown action" }, { status: 400 });
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`referral:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const action = body?.action;

  // --- Create (or fetch existing) referral code for a phone --------------
  if (action === "create-code") {
    const phone = ten(body.phone);
    if (phone.length !== 10)
      return Response.json({ error: "invalid phone" }, { status: 400 });

    const rows = await referralRows(REFERRAL_CODES_SHEET_NAME);
    const existing = rows.find((r) => ten(r["Phone Number"]) === phone);
    if (existing && existing["Code"]) {
      return Response.json({ code: String(existing["Code"]).toUpperCase() });
    }

    // New code — avoid collisions with any already issued.
    const used = new Set(
      rows.map((r) => String(r["Code"] || "").toUpperCase()),
    );
    let code = genCode();
    let guard = 0;
    while (used.has(code) && guard++ < 20) code = genCode();

    const res = await referralAppend(REFERRAL_CODES_SHEET_NAME, {
      "Phone Number": phone,
      Code: code,
      "Created At": fmtTs(),
      "Total Referred": 0,
      "Total Earned": 0,
    });
    if (!res.success)
      return Response.json(
        { error: "could not create code" },
        { status: 502 },
      );
    return Response.json({ code });
  }

  // --- Apply a code (friend enters it on their profile) ------------------
  if (action === "apply-code") {
    const phone = ten(body.phone);
    const code = String(body.code || "").trim().toUpperCase();
    if (phone.length !== 10)
      return Response.json({ status: "error", message: "Enter a valid 10-digit number." });
    if (!/^[A-Z0-9]{6}$/.test(code))
      return Response.json({ status: "invalid", message: "That referral code doesn't look right." });

    const codeRows = await referralRows(REFERRAL_CODES_SHEET_NAME);
    const owner = codeRows.find(
      (r) => String(r["Code"] || "").toUpperCase() === code,
    );
    if (!owner)
      return Response.json({ status: "invalid", message: "This referral code is invalid." });

    const referrerPhone = ten(owner["Phone Number"]);
    if (referrerPhone === phone)
      return Response.json({
        status: "self",
        message: "You can't use your own referral code 😊",
      });

    // Already applied a code before? Lock to the first one.
    const refRows = await referralRows(REFERRALS_SHEET_NAME);
    const prior = refRows.find((r) => ten(r["Referred Phone"]) === phone);
    if (prior)
      return Response.json({
        status: "already",
        message: "You've already applied a referral code.",
      });

    // Existing customer → benefit is "none" (referral is for new customers).
    const existingCustomer = await hasExistingOrder(phone);
    const status = existingCustomer ? "none" : "pending";
    const reason = existingCustomer
      ? "Existing customer — not eligible"
      : "Awaiting first delivery";

    const res = await referralAppend(REFERRALS_SHEET_NAME, {
      "Referrer Phone": referrerPhone,
      Code: code,
      "Referred Phone": phone,
      "Applied At": fmtTs(),
      Status: status,
      Reason: reason,
      Reward: "",
      "Qualifying Order ID": "",
      "Rewarded At": "",
    });
    if (!res.success)
      return Response.json({ status: "error", message: "Couldn't apply the code, please retry." });

    if (existingCustomer)
      return Response.json({
        status: "none",
        message:
          "Thanks! Referral rewards are only for first-time customers, so no reward applies to this account — but welcome back! 📚",
      });
    return Response.json({
      status: "pending",
      reward: REFEREE_REWARD,
      message: `Code applied! 🎉 You'll get ₹${REFEREE_REWARD} in your wallet once your first order is delivered.`,
    });
  }

  // --- Payout on delivery (called when an order is marked Delivered) -----
  if (action === "payout") {
    const referredPhone = ten(body.referredPhone);
    const orderId = String(body.orderId || "").trim();
    if (referredPhone.length !== 10)
      return Response.json({ status: "error" }, { status: 400 });

    const refRows = await referralRows(REFERRALS_SHEET_NAME);
    const row = refRows.find(
      (r) =>
        ten(r["Referred Phone"]) === referredPhone &&
        String(r["Status"] || "").toLowerCase() === "pending",
    );
    if (!row) return Response.json({ status: "noop" }); // nothing pending / already paid

    // Confirm the referred friend's order really is Delivered.
    const delivered = await orderIsDelivered(referredPhone, orderId);
    if (!delivered) return Response.json({ status: "not-delivered" });

    const referrerPhone = ten(row["Referrer Phone"]);
    const qualifyingOrder = orderId || String(row["Qualifying Order ID"] || "");

    // Credit both wallets.
    await walletAppend({
      Timestamp: fmtTs(),
      "Phone Number": referrerPhone,
      Amount: String(REFERRER_REWARD),
      Type: "Credit",
      Reason: `Referral reward — friend ${referredPhone}'s order delivered`,
      "Order ID": qualifyingOrder,
    });
    await walletAppend({
      Timestamp: fmtTs(),
      "Phone Number": referredPhone,
      Amount: String(REFEREE_REWARD),
      Type: "Credit",
      Reason: "Welcome referral reward — first order delivered",
      "Order ID": qualifyingOrder,
    });

    // Mark the referral rewarded (idempotent: only matched a "pending" row).
    await referralUpdate(REFERRALS_SHEET_NAME, "Referred Phone", referredPhone, {
      Status: "rewarded",
      Reason: "First order delivered — rewarded",
      Reward: String(REFERRER_REWARD),
      "Qualifying Order ID": qualifyingOrder,
      "Rewarded At": fmtTs(),
    });

    return Response.json({
      status: "rewarded",
      referrerReward: REFERRER_REWARD,
      refereeReward: REFEREE_REWARD,
    });
  }

  return Response.json({ error: "unknown action" }, { status: 400 });
}
