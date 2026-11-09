// Manage-orders → Offer timers. Admin only (x-admin-code header, same check as
// the console lock).
//
// GET                                   → every row of the Timers tab, newest first
// POST { action: "set-end", deviceId, endsAt }  → new "Ends At" (epoch ms)
// POST { action: "end-now", deviceId }          → offer ends now (+₹20 applies)
//
// The shopper's site re-reads "Ends At" on its next page load / tab focus.

import { isValidAdminCode } from "@/lib/adminCode";
import { parseSheetTime, fmtTs } from "@/lib/sheetTime";
import { gvizQuery, tableToObjects, timerUpdate, timerRowByDevice, TIMERS_SHEET_NAME } from "@/lib/serverSheets";



const deny = () => Response.json({ success: false, error: "unauthorized" }, { status: 401 });
const authed = (req) => isValidAdminCode(req.headers.get("x-admin-code"));

export async function GET(request) {
  if (!authed(request)) return deny();
  try {
    const table = await gvizQuery({ sheet: TIMERS_SHEET_NAME });
    const rows = tableToObjects(table)
      .filter((r) => String(r["Device ID"] || "").trim())
      .map((r) => ({
        deviceId: String(r["Device ID"]).trim(),
        startedAt: parseSheetTime(r["Started At"]),
        endsAt: parseSheetTime(r["Ends At"]),
        endsAtText: String(r["Ends At"] ?? ""),
        book: String(r["First Book"] ?? ""),
        page: String(r["First Page"] ?? ""),
        status: String(r["Status"] ?? ""),
        expiredAt: String(r["Expired At"] ?? ""),
        converted: String(r["Converted"] ?? "").toLowerCase() === "yes",
        orderId: String(r["Order ID"] ?? ""),
        convertedAt: String(r["Converted At"] ?? ""),
        pricePaid: String(r["Price Paid"] ?? ""),
        phone: String(r["Phone"] ?? ""),
        extendRequested: String(r["Extend Requested"] ?? ""),
      }))
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    return Response.json({ success: true, rows, now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return Response.json({ success: false, error: "Could not read the Timers tab", rows: [] }, { status: 200 });
  }
}

export async function POST(request) {
  if (!authed(request)) return deny();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }
  const deviceId = String(body.deviceId || "").trim().slice(0, 60);
  const action = String(body.action || "");
  if (!deviceId) return Response.json({ success: false, error: "missing deviceId" }, { status: 400 });

  let end;
  if (action === "end-now") end = Date.now();
  else if (action === "set-end") {
    end = Number(body.endsAt);
    if (!Number.isFinite(end) || end < Date.now() - 864e5 || end > Date.now() + 90 * 864e5)
      return Response.json({ success: false, error: "end time out of range" }, { status: 400 });
  } else return Response.json({ success: false, error: "bad action" }, { status: 400 });

  try {
    const row = await timerRowByDevice(deviceId);
    if (!row) return Response.json({ success: false, error: "device not found" }, { status: 404 });
    const data = { "Ends At": fmtTs(new Date(end)) };
    if (action === "end-now") data.Status = "Expired";
    else if (end > Date.now() && String(row.Status || "") === "Expired") data.Status = "Extended";
    const res = await timerUpdate(deviceId, data);
    if (!res?.success)
      return Response.json({ success: false, error: res?.error || "The sheet didn't accept the update" });
    return Response.json({ success: true, endsAt: end, endsAtText: data["Ends At"], status: data.Status || row.Status });
  } catch {
    return Response.json({ success: false, error: "Could not update the sheet" }, { status: 200 });
  }
}
