// Save a device's browser-push subscription, its topic choices and a small
// bag / wishlist snapshot (book ids) to the "Web Push" sheet tab.
// POST { action: "subscribe" | "prefs" | "snapshot", deviceId, phone, name,
//        subscription?, prefs?, enabled?, cart?, wishlist?, known? }

import { pushRowAppend, pushRowUpdate, pushRowExists, PUSH_TOPIC_KEYS } from "@/lib/webPushServer";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const ids = (v) =>
  String(v || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{2,40}(x\d{1,2})?$/i.test(s))
    .slice(0, 40)
    .join(",");

const notFound = (r) =>
  r && r.success === false && /not\s*found|no\s*(row|match|such)|unknown\s*(id|key)|does\s*n.?t\s*exist/i.test(String(r.error || ""));
const now = () => new Date().toISOString();
const keyChain = new Map(); // deviceId → tail promise (one write at a time)

export async function POST(request) {
  const rl = rateLimit(`push:${clientIp(request)}`, { limit: 30, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let b;
  try {
    b = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const deviceId = String(b?.deviceId || "").trim();
  if (!/^[a-z0-9_-]{8,64}$/i.test(deviceId)) {
    return Response.json({ ok: false, error: "bad device" }, { status: 400 });
  }
  const action = String(b?.action || "");
  const data = { "Device ID": deviceId, "Updated At": now() };
  const phone = String(b?.phone || "").replace(/\D/g, "").slice(-10);
  if (phone.length === 10) data.Phone = phone;
  if (b?.name) data.Name = String(b.name).slice(0, 60);

  if (action === "subscribe") {
    const sub = b?.subscription;
    const endpoint = String(sub?.endpoint || "");
    if (!/^https:\/\//.test(endpoint) || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return Response.json({ ok: false, error: "bad subscription" }, { status: 400 });
    }
    data.Subscription = JSON.stringify({ endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
    data.Status = "active";
  } else if (action === "prefs") {
    data.Status = b?.enabled === false ? "off" : "active";
  } else if (action !== "snapshot") {
    return Response.json({ ok: false, error: "bad action" }, { status: 400 });
  }
  if (b?.prefs && typeof b.prefs === "object") {
    for (const k of PUSH_TOPIC_KEYS) data[`Pref ${k}`] = b.prefs[k] === false ? "off" : "on";
  }
  if ("cart" in (b || {})) data.Cart = ids(b.cart);
  if ("wishlist" in (b || {})) data.Wishlist = ids(b.wishlist);
  const stamp = (v) => (Number.isFinite(Date.parse(v)) ? new Date(Date.parse(v)).toISOString() : null);
  if (b?.cartAt && stamp(b.cartAt)) data["Cart Updated"] = stamp(b.cartAt);
  if (b?.wishlistAt && stamp(b.wishlistAt)) data["Wishlist Updated"] = stamp(b.wishlistAt);

  const prev = keyChain.get(deviceId) || Promise.resolve();
  const job = prev.then(async () => {
    // Update first when the browser says a row exists; append only when the
    // sheet truly has none (gviz lags a few seconds, so trust `known`).
    if (b?.known || (await pushRowExists(deviceId))) {
      const r = await pushRowUpdate(deviceId, data);
      if (!notFound(r)) return r;
    }
    if (action !== "subscribe") return { success: false, error: "no row" };
    return pushRowAppend({ ...data, "Created At": now() });
  });
  const tail = job.catch(() => {});
  keyChain.set(deviceId, tail);
  const res = await job.catch((e) => ({ success: false, error: String(e) }));
  if (keyChain.get(deviceId) === tail) keyChain.delete(deviceId);
  return Response.json({ ok: !!res?.success });
}
