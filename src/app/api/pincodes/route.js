// Pincode checks from the delivery stripe under the navbar.
//
// POST { action: "check", deviceId, pincode, city, state, phone, name, page }
//   → upsert the device's row (append first time, update after)
// POST { action: "convert", deviceId, orderId }
//   → Converted = Yes (+ Order ID, Converted At) when that device places an order
//
// Stored in the "Pincodes" tab. Columns:
//   Device ID | Pincode | City | State | Phone | Name | Checks | First Checked |
//   Last Checked | Page | Converted | Order ID | Converted At

import { pincodeAppend, pincodeUpdate, pincodeRowByDevice } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const fmtTs = (d) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value || "";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return `${g("day")}/${g("month")}/${g("year")} ${hh}:${g("minute")}:${g("second")}`;
};
const only10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const clip = (v, n = 80) => String(v || "").trim().slice(0, n);

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`pincodes:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }
  const action = String(body.action || "check");
  const deviceId = clip(body.deviceId, 60);
  if (!deviceId)
    return Response.json({ success: false, error: "missing deviceId" }, { status: 400 });

  try {
    const row = await pincodeRowByDevice(deviceId);
    const now = fmtTs(new Date());

    if (action === "convert") {
      // Only devices that checked a pincode have a row; nothing to mark otherwise.
      if (!row) return Response.json({ success: true, skipped: true });
      if (String(row["Converted"] || "").toLowerCase() === "yes")
        return Response.json({ success: true, already: true });
      await pincodeUpdate(deviceId, {
        Converted: "Yes",
        "Order ID": clip(body.orderId, 40),
        "Converted At": now,
        ...(only10(body.phone) ? { Phone: only10(body.phone) } : {}),
      });
      return Response.json({ success: true, converted: true });
    }

    const pincode = String(body.pincode || "").replace(/\D/g, "");
    if (pincode.length !== 6)
      return Response.json({ success: false, error: "bad pincode" }, { status: 400 });
    const data = {
      Pincode: pincode,
      City: clip(body.city, 60),
      State: clip(body.state, 60),
      "Last Checked": now,
      Page: clip(body.page, 120),
    };
    const phone = only10(body.phone);
    const name = clip(body.name, 60);
    if (phone) data.Phone = phone;
    if (name) data.Name = name;

    if (row) {
      await pincodeUpdate(deviceId, {
        ...data,
        Checks: (Number(row["Checks"] || 0) || 0) + 1,
      });
    } else {
      await pincodeAppend({
        "Device ID": deviceId,
        Phone: phone,
        Name: name,
        ...data,
        Checks: 1,
        "First Checked": now,
        Converted: "No",
        "Order ID": "",
        "Converted At": "",
      });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false }, { status: 200 });
  }
}
