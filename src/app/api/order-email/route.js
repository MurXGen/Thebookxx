// Server-side proxy for TheBookX order emails. The browser calls this route;
// it forwards to the journalx mail service (which owns Resend + the verified
// TheBookX domain) with the shared secret attached. Keeping the secret here,
// server-side, means it never ships to the client.
//
// Body: { type: "confirmation" | "status", to, order, status?, tracking?, invoiceBase64? }

import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const JOURNALX_BASE = (
  process.env.JOURNALX_API_BASE || "https://api.journalx.app"
).replace(/\/$/, "");
const SECRET = process.env.BOOKX_EMAIL_SECRET || "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`order-email:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }

  const { type, to } = body || {};
  if (!to || !EMAIL_RE.test(String(to)))
    return Response.json(
      { success: false, error: "valid email required" },
      { status: 400 },
    );
  const path =
    type === "status" ? "/api/bookxEmail/order-status" : "/api/bookxEmail/order-confirmation";

  try {
    const res = await fetch(`${JOURNALX_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SECRET ? { "x-bookx-secret": SECRET } : {}),
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return Response.json(
      { success: !!json.success, error: json.error },
      { status: res.ok ? 200 : res.status },
    );
  } catch (e) {
    return Response.json({ success: false, error: "forward failed" }, { status: 502 });
  }
}
