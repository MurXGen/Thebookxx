// Delivery windows by region. Fast-lane regions (Gujarat, Maharashtra, Goa,
// Delhi, Hyderabad, Bengaluru) keep the quick windows; everywhere else gets
// the longer ones. Detection uses the state/city text and falls back to the
// pincode prefix, so it works even when only one of them is known.

export const FAST_WINDOWS = { faster: [1, 6], standard: [5, 9] };
export const SLOW_WINDOWS = { faster: [3, 9], standard: [4, 12] };

const STATE_RE = /gujarat|maharashtra|\bgoa\b|delhi/i;
const CITY_RE = /hyderabad|secunderabad|bengaluru|bangalore|delhi/i;
// 36–39 Gujarat · 40–44 Maharashtra (403 = Goa) · 110 Delhi ·
// 500 Hyderabad · 560 Bengaluru
const PIN_RE = /^(3[6-9]|4[0-4]|110|500|560)\d+$/;

export function isFastRegion({ state, city, district, pincode } = {}) {
  if (STATE_RE.test(String(state || ""))) return true;
  if (CITY_RE.test(`${city || ""} ${district || ""}`)) return true;
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length === 6 && PIN_RE.test(pin)) return true;
  return false;
}

export function deliveryWindows(addr) {
  return isFastRegion(addr) ? FAST_WINDOWS : SLOW_WINDOWS;
}

export const windowText = ([a, b]) => `${a}–${b} days`;

// Read the order's address fields (sheet row) into the shape above.
export function addrFromOrder(order = {}) {
  const addr = String(order["Address"] || order["Full Address"] || "");
  const pinMatch = addr.match(/\b\d{6}\b/);
  return {
    state: order["State"] || addr,
    city: order["City"] || addr,
    district: order["District"] || "",
    pincode: order["Pincode"] || order["Pin Code"] || (pinMatch ? pinMatch[0] : ""),
  };
}
