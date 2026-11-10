// Manage-orders → Visitors. One record per Device ID, joined across the
// "Pincodes", "Timers" and "Abandoned Cart" tabs. Admin only (x-admin-code).
// Read-only.

import { isValidAdminCode } from "@/lib/adminCode";
import {
  gvizQuery,
  tableToObjects,
  PINCODES_SHEET_NAME,
  TIMERS_SHEET_NAME,
  ABANDONED_CART_SHEET_NAME,
} from "@/lib/serverSheets";
import { parseSheetTime } from "@/lib/sheetTime";

const str = (v) => String(v ?? "").trim();
const yes = (v) => str(v).toLowerCase() === "yes";

async function rowsOf(sheet) {
  try {
    return tableToObjects(await gvizQuery({ sheet })).filter((r) => str(r["Device ID"]));
  } catch {
    return null; // tab missing / unreadable
  }
}

export async function GET(request) {
  if (!isValidAdminCode(request.headers.get("x-admin-code")))
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });

  const [pins, timers, carts] = await Promise.all([
    rowsOf(PINCODES_SHEET_NAME),
    rowsOf(TIMERS_SHEET_NAME),
    rowsOf(ABANDONED_CART_SHEET_NAME),
  ]);

  const map = new Map();
  const get = (id) => {
    if (!map.has(id))
      map.set(id, { deviceId: id, name: "", phone: "", orders: new Set(), lastSeen: 0, firstSeen: 0 });
    return map.get(id);
  };
  const seen = (d, ...ts) =>
    ts.map(parseSheetTime).filter(Boolean).forEach((t) => {
      d.lastSeen = Math.max(d.lastSeen, t);
      d.firstSeen = d.firstSeen ? Math.min(d.firstSeen, t) : t;
    });

  (pins || []).forEach((r) => {
    const d = get(str(r["Device ID"]));
    d.pincode = {
      pincode: str(r["Pincode"]),
      city: str(r["City"]),
      state: str(r["State"]),
      checks: Number(r["Checks"]) || 0,
      page: str(r["Page"]),
      converted: yes(r["Converted"]),
    };
    d.name ||= str(r["Name"]);
    d.phone ||= str(r["Phone"]);
    if (str(r["Order ID"])) d.orders.add(str(r["Order ID"]));
    seen(d, r["First Checked"], r["Last Checked"], r["Converted At"]);
  });

  (timers || []).forEach((r) => {
    const d = get(str(r["Device ID"]));
    // Bag adds by source. Duplicate rows for one device: keep the highest
    // (updates land on the first matching row).
    const num = (v) => Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;
    d.adds = {
      detail: Math.max(d.adds?.detail || 0, num(r["Detail Adds"])),
      card: Math.max(d.adds?.card || 0, num(r["Card Adds"])),
    };
    d.timer = {
      status: str(r["Status"]),
      endsAt: parseSheetTime(r["Ends At"]),
      book: str(r["First Book"]),
      extendRequested: str(r["Extend Requested"]),
      pricePaid: str(r["Price Paid"]),
      converted: yes(r["Converted"]),
    };
    d.phone ||= str(r["Phone"]);
    if (str(r["Order ID"])) d.orders.add(str(r["Order ID"]));
    seen(d, r["Started At"], r["Expired At"], r["Converted At"], r["Extend Requested"]);
  });

  // A device can have more than one cart row (device key, then phone key after
  // login): keep the most recently updated one.
  (carts || []).forEach((r) => {
    const d = get(str(r["Device ID"]));
    const updated = parseSheetTime(r["Last Updated"]) || 0;
    if (!d.cart || updated >= (d.cart.updated || 0)) {
      d.cart = {
        books: str(r["Books"]),
        items: Number(r["Item Count"]) || 0,
        value: Number(String(r["Cart Value"] ?? "").replace(/[^\d.]/g, "")) || 0,
        status: str(r["Status"]),
        source: str(r["Source"]),
        updated,
      };
    }
    d.name ||= str(r["Name"]);
    d.phone ||= str(r["Phone"]);
    if (str(r["Order ID"])) d.orders.add(str(r["Order ID"]));
    seen(d, r["First Added"], r["Last Updated"]);
  });

  const now = Date.now();
  const devices = [...map.values()]
    .map((d) => {
      const orders = [...d.orders];
      const converted =
        orders.length > 0 ||
        d.pincode?.converted ||
        d.timer?.converted ||
        /convert/i.test(d.cart?.status || "");
      const timerRunning = !!(d.timer?.endsAt && d.timer.endsAt > now);
      return {
        ...d,
        orders,
        converted,
        timerRunning,
        sources: [d.pincode && "Pincodes", d.timer && "Timers", d.cart && "Cart"].filter(Boolean),
      };
    })
    .sort((a, b) => b.lastSeen - a.lastSeen);

  return Response.json(
    {
      success: true,
      devices,
      missing: [!pins && "Pincodes", !timers && "Timers", !carts && "Abandoned Cart"].filter(Boolean),
      now,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
