// SERVER-ONLY. Browser push: the "Web Push" sheet tab (one row per device)
// and the sender. Create the tab with these headers before going live:
//   Device ID | Phone | Name | Status | Subscription | Pref orders |
//   Pref arrivals | Pref offers | Pref cart | Pref wishlist | Cart |
//   Cart Updated | Wishlist | Wishlist Updated | Created At | Updated At
// Env: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
//      PUSH_CRON_SECRET (guards the daily + broadcast endpoints).

import webpush from "web-push";
import {
  gvizQuery,
  tableToObjects,
  APPSCRIPT_ORDER_URL,
  APPSCRIPT_SHARED_SECRET,
} from "@/lib/serverSheets";

export const WEB_PUSH_SHEET_NAME = process.env.WEB_PUSH_SHEET_NAME || "Web Push";
export const PUSH_TOPIC_KEYS = ["orders", "arrivals", "offers", "cart", "wishlist"];

async function sheetPost(params) {
  if (!APPSCRIPT_ORDER_URL) return { success: false, error: "not configured" };
  const body = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => body.set(k, typeof v === "object" ? JSON.stringify(v) : String(v ?? "")));
  if (APPSCRIPT_SHARED_SECRET) body.set("secret", APPSCRIPT_SHARED_SECRET);
  try {
    const res = await fetch(APPSCRIPT_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    let json = null;
    try {
      json = JSON.parse(await res.text());
    } catch {}
    if (!json) return { success: true };
    return { ...json, success: json.success ?? json.ok ?? true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export const pushRowAppend = (data) => sheetPost({ action: "append", sheet: WEB_PUSH_SHEET_NAME, data });
export const pushRowUpdate = (deviceId, data) =>
  sheetPost({ action: "update", sheet: WEB_PUSH_SHEET_NAME, matchColumn: "Device ID", matchValue: String(deviceId), data });

// Every row (only when the tab really exists — gviz falls back to the first
// tab otherwise, so require the "Device ID" + "Subscription" headers).
export async function pushAllRows() {
  try {
    const table = await gvizQuery({ sheet: WEB_PUSH_SHEET_NAME });
    const labels = (table.cols || []).map((c) => String(c.label).trim());
    if (!labels.includes("Device ID") || !labels.includes("Subscription")) return [];
    return tableToObjects(table);
  } catch {
    return [];
  }
}

export async function pushRowExists(deviceId) {
  const id = String(deviceId || "").trim();
  if (!id) return false;
  return (await pushAllRows()).some((r) => String(r["Device ID"] ?? "").trim() === id);
}

export const prefOn = (row, key) => !/^(off|false|no|0)$/i.test(String(row?.[`Pref ${key}`] ?? "on").trim());
export const rowActive = (row) =>
  String(row?.Status || "").trim().toLowerCase() === "active" && String(row?.Subscription || "").startsWith("{");

let configured = false;
export function pushConfigured() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:support@thebookx.in", pub, priv);
    configured = true;
  }
  return true;
}

// Send one payload to one sheet row. → "sent" | "gone" (expired, mark it) | "failed"
export async function sendPush(row, payload) {
  if (!pushConfigured()) return "failed";
  let sub;
  try {
    sub = JSON.parse(row.Subscription);
  } catch {
    return "gone";
  }
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 6 * 3600, urgency: "normal" });
    return "sent";
  } catch (e) {
    return e?.statusCode === 404 || e?.statusCode === 410 ? "gone" : "failed";
  }
}

// Run fn over items with limited parallelism (keeps the daily run quick).
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k], k);
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

export function checkCronSecret(request) {
  const want = process.env.PUSH_CRON_SECRET || "";
  if (!want) return false;
  const got = request.headers.get("x-cron-secret") || "";
  return got === want;
}

export function istDate(d = new Date()) {
  return new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);
}
