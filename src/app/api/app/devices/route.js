import { appDeviceAppend, appDeviceRow, appDeviceUpdate } from "@/lib/serverSheets";

// The Android app registers its Expo push token and notification preferences
// here, so order/offer pushes can respect what each reader opted into.
// Body: { deviceId, pushToken?, platform, appVersion, prefs: { orders, offers, ... } }
export const dynamic = "force-dynamic";

const PREF_KEYS = ["enabled", "bag", "wishlist", "picks", "orders", "whatsapp", "reading", "quiet"];

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const deviceId = String(body?.deviceId || "").trim().slice(0, 64);
  if (!/^[a-z0-9-]{8,64}$/i.test(deviceId)) {
    return Response.json({ ok: false, error: "bad device" }, { status: 400 });
  }
  const prefs = body?.prefs || {};
  const data = {
    "Device ID": deviceId,
    "Push Token": String(body?.pushToken || "").slice(0, 200),
    Platform: String(body?.platform || "").slice(0, 20),
    "App Version": String(body?.appVersion || "").slice(0, 20),
    Phone: String(body?.phone || "").replace(/\D/g, "").slice(-10),
    "Updated At": new Date().toISOString(),
  };
  for (const k of PREF_KEYS) data[`Pref ${k}`] = prefs[k] ? "on" : "off";
  if (prefs.readingTime) data["Pref readingTime"] = String(prefs.readingTime).slice(0, 10);

  const existing = await appDeviceRow(deviceId);
  const res = existing ? await appDeviceUpdate(deviceId, data) : await appDeviceAppend(data);
  return Response.json({ ok: !!res?.success });
}
