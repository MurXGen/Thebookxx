// India Post postage estimates for bulk (contractual) customers.
//
// Source: Gazette of India, Extraordinary, S.O. 4241(E), 31 July 2026 —
// Post Office (Sixth Amendment) Regulations, 2026, in force from 1 Aug 2026.
//   • Table III  — India Post Parcel (Retail / Contractual)
//   • Table IV   — Speed Post Parcel (Retail / Contractual)
// Our "Contractual" product = India Post Parcel – Contractual.
// Our "Speed" product       = Speed Post Parcel – Contractual.
// GST is extra ("Goods and Services Tax shall be levied as applicable").
//
// Zones are worked out from our posting office (Matunga, Mumbai). The zone
// rules below (what counts as Local and Zone/Metro) are our reading of India
// Post's zones — edit ORIGIN / LOCAL_PIN3 / METRO_PIN3 / ZONE_STATES if your
// post office classifies a destination differently.

import { stateFromPincode } from "./indiaPostBulk";

export const RATES_EFFECTIVE = "1 Aug 2026";
export const GST_RATE = 0.18;

// Columns: [Local, Within State, Zone/Metro, Other States]
export const ZONES = ["local", "state", "zone", "other"];
export const ZONE_LABEL = {
  local: "Local",
  state: "Within state",
  zone: "Zone / Metro",
  other: "Other states",
};

// Weight slabs (upper bound in grams). Above 5 kg: + "additional 1 kg" rate
// for every extra kg or part of it.
const SLABS = [500, 1000, 1500, 2000, 3000, 4000, 5000];

export const RATE_TABLES = {
  // India Post Parcel – Contractual (Table III)
  contractual: {
    label: "India Post Parcel – Contractual",
    rows: [
      [27, 31, 34, 35],
      [31, 44, 51, 57],
      [36, 58, 70, 80],
      [45, 80, 100, 115],
      [57, 100, 125, 145],
      [69, 120, 150, 175],
      [81, 140, 175, 205],
    ],
    extraKg: [15, 20, 25, 30],
  },
  // Speed Post Parcel – Contractual (Table IV)
  speed: {
    label: "Speed Post Parcel – Contractual",
    rows: [
      [28, 36, 40, 47],
      [31, 49, 65, 71],
      [36, 64, 110, 150],
      [45, 89, 140, 190],
      [57, 111, 190, 250],
      [69, 133, 235, 305],
      [81, 156, 275, 350],
    ],
    extraKg: [15, 25, 60, 65],
  },
  // Retail tariffs, for reference / comparison only.
  contractualRetail: {
    label: "India Post Parcel – Retail",
    rows: [
      [28, 65, 70, 72],
      [48, 91, 106, 114],
      [60, 117, 142, 171],
      [87, 160, 198, 239],
      [116, 219, 277, 337],
      [145, 268, 344, 420],
      [174, 324, 420, 515],
    ],
    extraKg: [30, 50, 70, 90],
  },
  speedRetail: {
    label: "Speed Post Parcel – Retail",
    rows: [
      [28, 76, 82, 90],
      [48, 101, 137, 143],
      [60, 130, 182, 228],
      [87, 178, 254, 319],
      [116, 243, 355, 450],
      [145, 298, 441, 560],
      [174, 361, 539, 686],
    ],
    extraKg: [35, 60, 95, 120],
  },
};

// Typical delivery time (days) after booking, by product and zone. These are
// working estimates from our own shipments — India Post publishes no
// guaranteed times for these products. Tune as you see real delivery data.
export const DELIVERY_DAYS = {
  speed: { local: [1, 2], state: [2, 3], zone: [2, 4], other: [3, 6] },
  contractual: { local: [2, 4], state: [3, 5], zone: [5, 7], other: [5, 9] },
};
export const fmtDays = ([a, b]) => (a === b ? `${a} day${a === 1 ? "" : "s"}` : `${a}–${b} days`);

// ── Zone rules (from Mumbai) ────────────────────────────────────────────────
export const ORIGIN = { city: "Mumbai", state: "Maharashtra", pincode: "400019" };
// Local = Mumbai city & suburbs delivery area (pincodes 4000xx–4001xx).
const LOCAL_PIN3 = ["400"];
const LOCAL_EXCLUDE_PIN4 = ["4006", "4007"]; // Thane / Navi Mumbai (400601+, 400701+) → within state
// Metro cities (destination pincode prefixes) → Zone/Metro rate.
const METRO_PIN3 = {
  "110": "Delhi",
  "700": "Kolkata",
  "600": "Chennai",
  "560": "Bengaluru",
  "500": "Hyderabad",
  "380": "Ahmedabad",
};
// Other states in our postal zone (Western) → Zone/Metro rate.
const ZONE_STATES = ["gujarat", "goa", "madhya pradesh", "chhattisgarh", "dadra and nagar haveli and daman and diu"];

const norm = (s) => String(s || "").toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();

// Destination → zone key. Pincode first (most reliable), then the State field.
export function zoneFor({ pincode, state } = {}) {
  const pin = String(pincode || "").replace(/\D/g, "");
  const p3 = pin.slice(0, 3);
  const p4 = pin.slice(0, 4);
  if (pin.length === 6 && LOCAL_PIN3.includes(p3) && !LOCAL_EXCLUDE_PIN4.includes(p4))
    return { zone: "local", why: "Mumbai" };
  if (pin.length === 6 && METRO_PIN3[p3]) return { zone: "zone", why: `${METRO_PIN3[p3]} (metro)` };
  const st = norm(stateFromPincode(pin) || state);
  if (!st) return { zone: "other", why: "state unknown" };
  if (st === norm(ORIGIN.state)) return { zone: "state", why: title(st) };
  if (ZONE_STATES.includes(st)) return { zone: "zone", why: `${title(st)} (western zone)` };
  return { zone: "other", why: title(st) };
}
const title = (s) => String(s).replace(/\b[a-z]/g, (c) => c.toUpperCase());

// Volumetric weight (g) from L×B×H in cm (÷ 5000), as India Post uses where
// volumetric billing applies.
export function volumetricGrams(l, b, h) {
  const [x, y, z] = [l, b, h].map((v) => Number(String(v || "").replace(/[^\d.]/g, "")) || 0);
  if (!(x > 0 && y > 0 && z > 0)) return 0;
  return Math.round(((x * y * z) / 5000) * 1000);
}

// Postage for one parcel.
//   product: "speed" | "contractual"
//   grams:   gross weight in grams
// Returns null when there's no weight yet.
export function estimatePostage({ product = "contractual", grams, pincode, state, l, b, h, retail = false } = {}) {
  const g = Math.round(Number(String(grams ?? "").replace(/[^\d.]/g, "")) || 0);
  if (!(g > 0)) return null;
  const key = product === "speed" ? (retail ? "speedRetail" : "speed") : retail ? "contractualRetail" : "contractual";
  const table = RATE_TABLES[key];
  const { zone, why } = zoneFor({ pincode, state });
  const col = ZONES.indexOf(zone);
  let base;
  let slab;
  const idx = SLABS.findIndex((max) => g <= max);
  if (idx >= 0) {
    base = table.rows[idx][col];
    slab = idx === 0 ? "up to 500 g" : `${SLABS[idx - 1] + 1}–${SLABS[idx]} g`;
  } else {
    const extra = Math.ceil((g - 5000) / 1000);
    base = table.rows[SLABS.length - 1][col] + extra * table.extraKg[col];
    slab = `5 kg + ${extra} kg`;
  }
  const gst = Math.round(base * GST_RATE * 100) / 100;
  const vol = volumetricGrams(l, b, h);
  const days = DELIVERY_DAYS[product === "speed" ? "speed" : "contractual"][zone];
  return {
    days,
    eta: fmtDays(days),
    product: key,
    productLabel: table.label,
    zone,
    zoneLabel: ZONE_LABEL[zone],
    zoneWhy: why,
    grams: g,
    slab,
    base,
    gst,
    total: Math.round((base + gst) * 100) / 100,
    volumetricGrams: vol,
    volumetricHigher: vol > g,
  };
}

export const fmtRs = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: Number(n) % 1 ? 2 : 0 })}`;
