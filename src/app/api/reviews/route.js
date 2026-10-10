// Share-&-earn review rewards API (Reviews tab).
//   GET  /api/reviews?phone=XXXXXXXXXX
//        → { submissions: [{ subId, orderId, platform, link, status, amount,
//            note, timestamp }] } newest first
//   POST /api/reviews { phone, orderId, platform, link, image? (dataURL) }
//        → appends a Pending row + notifies the team on Telegram (with the
//          screenshot when a Telegram bot token/chat is configured).
//
// Reviews tab headers:
//   Sub ID | Timestamp | Phone Number | Order ID | Platform | Post Link |
//   Status | Amount | Note | Reviewed At

import {
  reviewRewardRows,
  reviewRewardAppend,
  reviewRewardAllRows,
  reviewRewardUpdate,
  walletAppend,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const TELEGRAM_PROXY = "https://api.journalx.app/api/bookxTelegram/order";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const BOT_CHAT = process.env.TELEGRAM_CHAT_ID || "";

const digits10 = (p) => String(p || "").replace(/\D/g, "").slice(-10);
const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
};
const normStatus = (s) => {
  const t = String(s || "").toLowerCase();
  if (/approv|credit|paid|done/.test(t)) return "approved";
  if (/reject|declin|not\s*approv/.test(t)) return "rejected";
  return "pending";
};

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`rev-get:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);

  // Admin: full list for the Users tab review manager.
  if (searchParams.get("all")) {
    const all = await reviewRewardAllRows();
    const list = all
      .map((r) => ({
        subId: String(r["Sub ID"] ?? r["Sub Id"] ?? "").trim(),
        timestamp: String(r["Timestamp"] ?? "").trim(),
        phone: String(r["Phone Number"] ?? "").trim(),
        orderId: String(r["Order ID"] ?? "").trim(),
        platform: String(r["Platform"] ?? "").trim(),
        link: String(r["Post Link"] ?? "").trim(),
        status: normStatus(r["Status"]),
        amount: num(r["Amount"]),
        note: String(r["Note"] ?? "").trim(),
      }))
      .filter((s) => s.subId || s.link)
      .reverse();
    return Response.json({ submissions: list });
  }

  const phone = digits10(searchParams.get("phone"));
  if (phone.length !== 10) return Response.json({ submissions: [] });

  const rows = await reviewRewardRows(phone);
  const submissions = rows
    .map((r) => ({
      subId: String(r["Sub ID"] ?? r["Sub Id"] ?? "").trim(),
      timestamp: String(r["Timestamp"] ?? "").trim(),
      orderId: String(r["Order ID"] ?? "").trim(),
      platform: String(r["Platform"] ?? "").trim(),
      link: String(r["Post Link"] ?? "").trim(),
      status: normStatus(r["Status"]),
      amount: num(r["Amount"]),
      note: String(r["Note"] ?? "").trim(),
    }))
    .filter((s) => s.link || s.subId)
    .reverse(); // newest first (sheet appends at the bottom)

  return Response.json({ submissions });
}

async function notifyTelegram({ phone, orderId, platform, link, image }) {
  const msg =
    `🎥 *Review reward submission*\n\n` +
    `📞 ${phone}\n` +
    (orderId ? `📦 Order: ${orderId}\n` : "") +
    (platform ? `📱 Platform: ${platform}\n` : "") +
    `🔗 Post: ${link}\n\n` +
    `➡️ Verify the post, then set *Status* + *Amount* in the *Reviews* tab.`;

  // Text notification via the proxy (always).
  try {
    await fetch(TELEGRAM_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderDetails: msg,
        customerName: "Review reward",
        customerPhone: phone,
        totalAmount: 0,
        paymentMethod: "REVIEW_REWARD",
        codHandlingFee: 0,
      }),
    });
  } catch {}

  // Photo via the Telegram Bot API, only if configured and an image was sent.
  if (BOT_TOKEN && BOT_CHAT && image && /^data:image\//.test(image)) {
    try {
      const base64 = image.split(",")[1] || "";
      const mime = (image.match(/^data:(image\/\w+);/) || [])[1] || "image/jpeg";
      const bytes = Buffer.from(base64, "base64");
      if (bytes.length > 0 && bytes.length < 9 * 1024 * 1024) {
        const fd = new FormData();
        fd.append("chat_id", BOT_CHAT);
        fd.append("caption", `Review reward · ${phone}${orderId ? ` · ${orderId}` : ""}`);
        fd.append(
          "photo",
          new Blob([bytes], { type: mime }),
          "screenshot.jpg",
        );
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          body: fd,
        });
      }
    } catch {}
  }
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`rev-post:${ip}`, { limit: 10, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body = {};
  try {
    body = await request.json();
  } catch {}

  // Admin: update a submission's status/amount/note (+ credit wallet on approval)
  if (String(body.action || "").toLowerCase() === "update") {
    const subId = String(body.subId || "").trim();
    if (!subId)
      return Response.json({ ok: false, error: "no subId" }, { status: 400 });
    const status = normStatus(body.status);
    const amount = Math.max(0, Math.round(num(body.amount)));
    const note = String(body.note || "").trim().slice(0, 300);
    const phone = digits10(body.phone);

    // Only credit the wallet the first time it flips to Approved with an amount.
    const all = await reviewRewardAllRows();
    const current = all.find(
      (r) => String(r["Sub ID"] ?? "").trim() === subId,
    );
    const wasApproved = current ? normStatus(current["Status"]) === "approved" : false;

    await reviewRewardUpdate(subId, {
      Status: status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending",
      Amount: amount || "",
      Note: note,
      "Reviewed At": new Date().toLocaleString("en-IN", { hour12: true }),
    });

    let credited = false;
    if (
      status === "approved" &&
      amount > 0 &&
      !wasApproved &&
      phone.length === 10
    ) {
      const r = await walletAppend({
        Timestamp: new Date().toLocaleString("en-IN", { hour12: true }),
        "Phone Number": phone,
        Amount: amount,
        Type: "Credit",
        Reason: "Review reward",
        "Order ID": subId,
      });
      credited = !!r.success;
    }
    return Response.json({ ok: true, credited });
  }

  const phone = digits10(body.phone);
  const link = String(body.link || "").trim().slice(0, 500);
  const platform = String(body.platform || "").trim().slice(0, 40);
  const orderId = String(body.orderId || "").trim().slice(0, 40);
  if (phone.length !== 10)
    return Response.json({ ok: false, error: "bad phone" }, { status: 400 });
  if (!/^https?:\/\//i.test(link))
    return Response.json({ ok: false, error: "bad link" }, { status: 400 });

  const subId = `RV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const stamp = new Date().toLocaleString("en-IN", { hour12: true });

  await reviewRewardAppend({
    "Sub ID": subId,
    Timestamp: stamp,
    "Phone Number": phone,
    "Order ID": orderId,
    Platform: platform,
    "Post Link": link,
    Status: "Pending",
    Amount: "",
    Note: "",
    "Reviewed At": "",
  });

  notifyTelegram({ phone, orderId, platform, link, image: body.image }).catch(
    () => {},
  );

  return Response.json({ ok: true, subId });
}
