// Server-side proxy for order writes (append / update) to the Apps Script web
// apps. The /exec URLs stay on the server so nobody can call them directly to
// forge or edit sheet rows.
//
// Body (JSON): { action: "append" | "update", orderId?, data, target? }
//   target: "order" (default) -> APPSCRIPT_ORDER_URL (new orders + updates)
//           "edit"            -> APPSCRIPT_EDIT_URL   (profile address edits)

import { APPSCRIPT_ORDER_URL, APPSCRIPT_EDIT_URL } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`order-write:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }

  const { action, orderId, data, target } = payload || {};
  if (action !== "append" && action !== "update") {
    return Response.json(
      { success: false, error: "invalid action" },
      { status: 400 },
    );
  }
  if (action === "update" && !orderId) {
    return Response.json(
      { success: false, error: "orderId required for update" },
      { status: 400 },
    );
  }

  const url = target === "edit" ? APPSCRIPT_EDIT_URL : APPSCRIPT_ORDER_URL;
  const body = new URLSearchParams();
  body.set("action", action);
  if (orderId) body.set("orderId", String(orderId));
  body.set("data", JSON.stringify(data || {}));

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false }, { status: 502 });
  }
}
