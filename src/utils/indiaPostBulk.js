// India Post "Bulk Booking" (Domestic Mail) upload builder.
// Produces an .xlsx that matches the official template exactly:
//   Sheets: ArticleDetails (data) · PickupAddress · AltAddress · Information
// The portal reads sheet names + the header row (row 1) verbatim — DO NOT change
// header text or order. Booleans are written as real TRUE/FALSE, and weight /
// dimensions / COD value must be absolute integers (no decimals).
//
// Two product buckets, decided by classifyOrderProduct():
//   • speed        → a single loose book (1 unit, not a set/collection)
//   • contractual  → 2+ books, or any set / collection / combo
//
// COD rule (per business):
//   • COD orders  → collect NET = order total − 5.9% commission (₹99 online
//                   advance, if any, is deducted first).
//   • Prepaid     → nothing to collect; VALUE FOR CODR/COD defaults to 10 as a
//                   placeholder, but CODR/COD code is left blank so India Post
//                   does NOT collect anything. Editable in the preview.

import { books as ALL_BOOKS } from "./book";

// ── Exact template structure (captured from bulkdomesticone_28042026.xlsx) ──
export const ARTICLE_HEADERS = [
  "SERIAL NUMBER",
  "BARCODE NO",
  "PHYSICAL WEIGHT",
  "SHAPE OF ARTICLE",
  "LENGTH ", // NOTE: trailing space is intentional — matches the template
  "BREADTH/DIAMETER",
  "HEIGHT",
  "PRIORITY FLAG",
  "DELIVERY INSTRUCTION",
  "INSTRUCTION RTS",
  "SENDER NAME",
  "SENDER COMPANY",
  "SENDER ADD LINE 1",
  "SENDER ADD LINE 2",
  "SENDER CITY",
  "SENDER STATE",
  "SENDER PINCODE",
  "SENDER EMAILID",
  "SENDER ALT CONTACT",
  "SENDER KYC",
  "SENDER TAX REFERENCE",
  "RECEIVER NAME",
  "RECEIVER COMPANY",
  "RECEIVER ADD LINE 1",
  "RECEIVER ADD LINE 2",
  "RECEIVER CITY",
  "RECEIVER STATE",
  "RECEIVER PINCODE",
  "RECEIVER EMAILID",
  "RECEIVER ALT CONTACT",
  "RECEIVER KYC",
  "RECEIVER TAX REFERENCE",
  "ALT ADDRESS FLAG",
  "PICKUP ADDRESS FLAG",
  "DROP OFF PINCODE",
  "DROPOFF/PICKUP OFFICE ID",
  "SENDER MOBILE NO",
  "RECEIVER MOBILE NO",
  "PREPAYMENT CODE",
  "VALUE OF PREPAYMENT",
  "CODR/COD",
  "VALUE FOR CODR/COD",
  "INSURANCE TYPE",
  "VALUE OF INSURANCE",
  "ACK",
  "REGISTRATION",
  "OTP BASED DELIVERY",
  "BULK REFERENCE",
];

export const PICKUP_HEADERS = [
  "serial_no",
  "addressee_name",
  "company_name",
  "address_line1",
  "address_line2",
  "address_line3",
  "city",
  "state",
  "pincode",
  "email_id",
  "alt_contact_no",
  "mobile_no",
  "pickup_schedule_slot",
  "pickup_schedule_date",
];

export const ALT_HEADERS = [
  "SERIAL NO",
  "ADDRESSEE NAME",
  "COMPANY NAME",
  "ADDRESS LINE 1",
  "ADDRESS LINE 2",
  "ADDRESS LINE 3",
  "CITY",
  "STATE",
  "PINCODE",
  "EMAIL ID",
  "ALT CONTACT NO",
  "MOBILE NO",
];

// The reference "Information" tab, reproduced verbatim so uploaded files look
// identical to a freshly downloaded template.
export const INFORMATION_AOA = [
  ["SHAPE OF ARTICLE", "", "PRIORITY FLAG", "DELIVERY INSTRUCTION", "", "", "INSTRUCTION RTS", "", "CODR/COD", "", "INSURANCE TYPE", "PREPAYMENT", "", "PICKUP SCHEDULE SLOT"],
  ["Code", "Description", true, "Code", "Description", "", "Code", "Description", "Code", "Description", "DOP", "Code", "Description", "10:00-13:00"],
  ["ROLL", "Roll form", false, "ND", "Normal Delivery", "", "RTS", "Returned to Sender", "codr", "Cash On Delivery Retail(VP)", "", "PS", "Postage Stamps", "13:00-16:00"],
  ["NROL", "Non Roll Form", "", "OD", "Open Delivery", "", "RTA", "Returned to Alternate Address", "cod", "Cash on Delivery", "", "FM", "Franking Machine", ""],
  ["DOC", "Document", "", "", "", "", "", "", "", "", "", "SS", "Service Stamps", ""],
  ["", "BOOLEAN(TRUE or FALSE)", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "PRIORITY FLAG", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "ALT ADDRESS FLAG", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "PICKUP ADDRESS FLAG", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "ACK", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "OTP BASED DELIVERY", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "REGISTRATION", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["INSTRUCTIONS", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  [1, "If ALT ADDRESS FLAG is True, provide the address details in the AltAddress tab", "", "", "", "", "", "", "", "", "", "", "", ""],
  [2, "If PICK UP ADDRESS FLAG is True, provide the pickup details in the PickupAddress tab", "", "", "", "", "", "", "", "", "", "", "", ""],
  [3, "IF PICK UP ADDRESS FLAG is False,DropOff Pincode is mandatory in ArticleDetails tab", "", "", "", "", "", "", "", "", "", "", "", ""],
  [3, "Do not change the field names or their positions in the first row", "", "", "", "", "", "", "", "", "", "", "", ""],
  [4, "Please provide absolute values for physical weight, insurance amount, cod amount etc. Decimal values are not permitted", "", "", "", "", "", "", "", "", "", "", "", ""],
  [5, "Date format should be in DD-MM-YYYY and format in date", "", "", "", "", "", "", "", "", "", "", "", ""],
  [6, "Please use the specified codes as mentioned", "", "", "", "", "", "", "", "", "", "", "", ""],
];

// ── Our posting (sender) defaults. Editable in the preview and persisted to
// localStorage so the mobile number etc. only has to be entered once. ──
export const SENDER_STORAGE_KEY = "ip_bulk_sender_v4";
export const DEFAULT_SENDER = {
  name: "TheBookX",
  company: "",
  add1: "Near Shilpa Sarees, Opp Apollo Pharmacy",
  add2: "Maheshwari Udyan",
  city: "Matunga",
  state: "Maharashtra",
  pincode: "400019",
  email: "",
  mobile: "7977960242",
  dropPincode: "400017", // where we hand parcels over (drop-off PO)
};

// India Post field limits (validated before download). The portal rejected
// ReceiverAddrline2 > 50 chars; other caps are the portal's documented maxima.
export const IP_LIMITS = {
  receiverName: 50,
  add1: 50,
  add2: 50,
  city: 30,
  state: 30,
  pincode: 6,
  mobile: 10,
  barcode: 20,
  weightMax: 35000,
};

export function loadSender() {
  if (typeof window === "undefined") return { ...DEFAULT_SENDER };
  try {
    const saved = JSON.parse(localStorage.getItem(SENDER_STORAGE_KEY) || "{}");
    return { ...DEFAULT_SENDER, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_SENDER };
  }
}
export function saveSender(sender) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SENDER_STORAGE_KEY, JSON.stringify(sender || {}));
  } catch {}
}

// ── Small text helpers (mirror the India Post autofill sanitiser) ──
const clean = (s) =>
  String(s || "")
    .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/gi, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,·-]+|[\s,·-]+$/g, "")
    .trim();

// Split an address into two lines, each capped at India Post's 50-char limit.
// Line 1 fills up to 50 chars at a word boundary, line 2 gets the next 50,
// and anything beyond is dropped (the admin can tidy it in the preview).
function splitAddress(address, size = IP_LIMITS.add1) {
  const words = clean(address).split(/\s+/).filter(Boolean);
  const line1 = [];
  const line2 = [];
  let l1 = "";
  let l2 = "";
  let i = 0;
  for (; i < words.length; i++) {
    const next = l1 ? l1 + " " + words[i] : words[i];
    if (next.length <= size) {
      l1 = next;
      line1.push(words[i]);
    } else break;
  }
  for (; i < words.length; i++) {
    const next = l2 ? l2 + " " + words[i] : words[i];
    if (next.length <= size) {
      l2 = next;
      line2.push(words[i]);
    } else break;
  }
  return [l1.slice(0, size), l2.slice(0, size)];
}

// Fast catalogue lookup by (lowercased) name for weight/set detection.
const BY_NAME = {};
(ALL_BOOKS || []).forEach((b) => {
  if (b?.name) BY_NAME[b.name.toLowerCase().trim()] = b;
});

const SET_RE =
  /\b(set|sets|collection|combo|bundle|box[\s-]?set|pack|duology|trilogy|quartet|volumes?|vol\.?|series)\b|set of|\d+\s*books?/i;

// QuickReads are ₹19 digital-only titles — they never ship physically, so they
// must be excluded from parcel counts, covers, weight and dimensions.
const isQuickReadLine = (l) =>
  /\bquick\s*reads?\b/i.test(String(l?.name || "")) || Number(l?.price) === 19;

// Physical (shippable) book lines only — QuickReads stripped out.
const physicalLines = (order) =>
  (order?.parsedBooks || []).filter((l) => !isQuickReadLine(l));

// Total number of physical books in an order + whether it's a set/collection.
// QuickReads (₹19 digital) are ignored.
export function orderBookMeta(order) {
  const all = order?.parsedBooks || [];
  const lines = physicalLines(order);
  let qty = 0;
  let isSet = false;
  lines.forEach((l) => {
    const q = Number(l.quantity) || 1;
    qty += q;
    if (SET_RE.test(String(l.name || ""))) isSet = true;
  });
  // Only assume 1 when the order has no parsed lines at all (unknown data).
  if (qty === 0 && all.length === 0) qty = 1;
  return { qty, lines: lines.length, isSet };
}

// Product bucket for the India Post bulk file:
//   • Faster-delivery orders          → SPEED (always, regardless of weight)
//   • Parcels UNDER 500 g              → SPEED
//   • Parcels 500 g and OVER           → CONTRACTUAL
// Weight comes from the operator-entered "Weight(gm)" saved on the order; if
// that's blank we fall back to the catalogue estimate.
export function classifyOrderProduct(order) {
  // 1) Faster / express delivery always goes Speed.
  const deliv = String(order?.["Delivery Type"] || "");
  if (/faster|express/i.test(deliv)) return "speed";
  // 2) Weight-based split (< 500 g = Speed, >= 500 g = Contractual).
  const saved = parseInt(
    String(order?.["Weight(gm)"] ?? order?.["Weight (gm)"] ?? "").replace(
      /[^\d]/g,
      "",
    ),
    10,
  );
  const grams =
    Number.isFinite(saved) && saved > 0 ? saved : estimateWeight(order);
  return grams < 500 ? "speed" : "contractual";
}

// Best-guess parcel weight (g) from the catalogue. Weight is REQUIRED by the
// portal and can't be blank, so unmatched books fall back to ~250 g each.
export function estimateWeight(order) {
  const lines = physicalLines(order); // QuickReads carry no shipping weight
  let w = 0;
  let qty = 0;
  lines.forEach((l) => {
    const q = Number(l.quantity) || 1;
    qty += q;
    const b = BY_NAME[String(l.name || "").toLowerCase().trim()];
    w += (Number(b?.weight) || 250) * q; // fallback per-book weight
  });
  if (qty === 0) return 250; // no physical items → sensible floor
  return Math.round(w) || 250;
}

// COD math — NET = (total − ₹99 advance if paid) minus 5.9% commission.
export function codNetFor(order) {
  const isCOD = /cash|cod/i.test(order?.["Payment Type"] || "");
  const gross =
    Number(String(order?.["Total Amount"] || order?.revenue || "").replace(/[^\d.]/g, "")) || 0;
  const advancePaid = /^\s*yes/i.test(String(order?.["Advance Paid"] || ""));
  const base = isCOD && advancePaid ? Math.max(0, gross - 99) : gross;
  const net = Math.max(0, base - Math.round(base * 0.059));
  return { isCOD, gross, net };
}

const cap = (s, n) => String(s ?? "").slice(0, n);

// Pincode → State, derived from India Post postal-circle prefixes. The pincode
// is authoritative (India Post routes by it), so this is used to override stale
// or wrong stored State values (e.g. legacy orders defaulted to "Maharashtra").
// 3-digit overrides take priority over the 2-digit zone map.
const PIN3_STATE = {
  160: "Chandigarh",
  194: "Ladakh",
  403: "Goa",
  490: "Chhattisgarh", 491: "Chhattisgarh", 492: "Chhattisgarh",
  493: "Chhattisgarh", 494: "Chhattisgarh", 495: "Chhattisgarh",
  496: "Chhattisgarh", 497: "Chhattisgarh",
  605: "Puducherry",
  737: "Sikkim",
  744: "Andaman and Nicobar Islands",
  790: "Arunachal Pradesh", 791: "Arunachal Pradesh", 792: "Arunachal Pradesh",
  793: "Meghalaya", 794: "Meghalaya",
  795: "Manipur", 796: "Mizoram",
  797: "Nagaland", 798: "Nagaland",
  799: "Tripura",
  // Uttarakhand (carved out of UP's 24x/26x zones)
  246: "Uttarakhand", 247: "Uttarakhand", 248: "Uttarakhand",
  249: "Uttarakhand", 262: "Uttarakhand", 263: "Uttarakhand",
  // Jharkhand (carved out of Bihar's 81x/82x/83x zones)
  813: "Jharkhand", 814: "Jharkhand", 815: "Jharkhand", 816: "Jharkhand",
  825: "Jharkhand", 826: "Jharkhand", 827: "Jharkhand", 828: "Jharkhand",
  829: "Jharkhand", 831: "Jharkhand", 832: "Jharkhand", 833: "Jharkhand",
  834: "Jharkhand", 835: "Jharkhand",
};
const PIN2_STATE = {
  11: "Delhi",
  12: "Haryana", 13: "Haryana",
  14: "Punjab", 15: "Punjab", 16: "Punjab",
  17: "Himachal Pradesh",
  18: "Jammu and Kashmir", 19: "Jammu and Kashmir",
  20: "Uttar Pradesh", 21: "Uttar Pradesh", 22: "Uttar Pradesh",
  23: "Uttar Pradesh", 24: "Uttar Pradesh", 25: "Uttar Pradesh",
  26: "Uttar Pradesh", 27: "Uttar Pradesh", 28: "Uttar Pradesh",
  30: "Rajasthan", 31: "Rajasthan", 32: "Rajasthan", 33: "Rajasthan", 34: "Rajasthan",
  36: "Gujarat", 37: "Gujarat", 38: "Gujarat", 39: "Gujarat",
  40: "Maharashtra", 41: "Maharashtra", 42: "Maharashtra",
  43: "Maharashtra", 44: "Maharashtra",
  45: "Madhya Pradesh", 46: "Madhya Pradesh", 47: "Madhya Pradesh", 48: "Madhya Pradesh",
  49: "Chhattisgarh",
  50: "Telangana",
  51: "Andhra Pradesh", 52: "Andhra Pradesh", 53: "Andhra Pradesh",
  56: "Karnataka", 57: "Karnataka", 58: "Karnataka", 59: "Karnataka",
  60: "Tamil Nadu", 61: "Tamil Nadu", 62: "Tamil Nadu", 63: "Tamil Nadu", 64: "Tamil Nadu",
  67: "Kerala", 68: "Kerala", 69: "Kerala",
  70: "West Bengal", 71: "West Bengal", 72: "West Bengal", 73: "West Bengal", 74: "West Bengal",
  75: "Odisha", 76: "Odisha", 77: "Odisha",
  78: "Assam",
  80: "Bihar", 81: "Bihar", 84: "Bihar", 85: "Bihar",
  82: "Jharkhand", 83: "Jharkhand",
};
export function stateFromPincode(pincode) {
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length < 6) return "";
  return PIN3_STATE[pin.slice(0, 3)] || PIN2_STATE[pin.slice(0, 2)] || "";
}

// Build the lightweight, editable preview row for one order.
export function buildPreviewRow(order, serial) {
  const { isCOD, net } = codNetFor(order);
  const { qty } = orderBookMeta(order);
  // Reference-only: per-title cover + qty (resolved from the catalogue) so the
  // admin can eyeball what's in each parcel while filling weights. QuickReads
  // (₹19 digital) are excluded — they don't ship.
  const covers = physicalLines(order).map((l) => {
    const b = BY_NAME[String(l.name || "").toLowerCase().trim()];
    return {
      name: l.name || "",
      image: b?.image || "",
      qty: Number(l.quantity) || 1,
    };
  });
  const [add1, add2] = splitAddress(order?.["Address"]);
  const mobile = String(order?.["Phone Number"] || "").replace(/\D/g, "").slice(-10);
  const altMobile = String(order?.["Alternate number"] || "")
    .replace(/\D/g, "")
    .slice(-10);
  // Operator-entered weight (g) + sizes ("LxBxH") saved on the order row take
  // priority over the catalogue estimate / default dimensions.
  const savedWeight = parseInt(
    String(order?.["Weight(gm)"] ?? order?.["Weight (gm)"] ?? "").replace(
      /[^\d]/g,
      "",
    ),
    10,
  );
  const savedSizes = String(
    order?.["Sizes(Lxbxh)"] ?? order?.["Sizes (Lxbxh)"] ?? "",
  ).trim();
  const [sL, sB, sH] = savedSizes
    ? savedSizes
        .split(/[xX×*]/)
        .map((n) => parseInt(String(n).replace(/[^\d]/g, ""), 10))
    : [];
  return {
    serial,
    orderId: order?.["Order ID"] || "",
    barcode: "", // India Post article/barcode number (from your allocated series)
    receiverName: cap(clean(order?.["Customer Name"]), IP_LIMITS.receiverName),
    mobile,
    add1: cap(add1, IP_LIMITS.add1),
    add2: cap(add2, IP_LIMITS.add2),
    city: cap(order?.["City"], IP_LIMITS.city),
    // Trust the pincode for State (India Post routes by it) — this overrides
    // stale/wrong stored values (legacy orders defaulted to "Maharashtra").
    // Fall back to the stored State only when the pincode can't be resolved.
    state: cap(
      stateFromPincode(order?.["Pincode"]) || order?.["State"],
      IP_LIMITS.state,
    ),
    pincode: String(order?.["Pincode"] || "").replace(/\D/g, "").slice(0, 6),
    altMobile,
    // Weight + dimensions — use the saved values when present, else fall back to
    // the catalogue estimate and the default 22 × 13 × (book count).
    weight:
      Number.isFinite(savedWeight) && savedWeight > 0
        ? savedWeight
        : estimateWeight(order),
    length: sL > 0 ? sL : 22,
    breadth: sB > 0 ? sB : 13,
    height: sH > 0 ? sH : Math.max(1, qty),
    shape: "NROL",
    delivery: "ND",
    books: qty,
    covers,
    isCOD,
    // COD orders collect the net; PREPAID orders carry NO COD — the COD TYPE
    // dropdown's "None" option has an empty value, so use "" here (not "None")
    // so the select shows None with a blank amount. Editable in preview.
    codCode: isCOD ? "COD" : "",
    codValue: isCOD ? net : "",
  };
}

// Validate one preview row against India Post's field rules. Returns an object
// { field: "message" } of problems (empty object = valid).
export function validateRow(row, sender) {
  const e = {};
  const s = sender || DEFAULT_SENDER;
  const req = (v) => !String(v ?? "").trim();
  const digits = (v) => String(v ?? "").replace(/\D/g, "");
  if (req(row.barcode)) e.barcode = "Barcode / Article No is required";
  else if (String(row.barcode).length > IP_LIMITS.barcode)
    e.barcode = `Max ${IP_LIMITS.barcode} chars`;
  if (req(row.receiverName)) e.receiverName = "Required";
  else if (row.receiverName.length > IP_LIMITS.receiverName)
    e.receiverName = `Max ${IP_LIMITS.receiverName} chars`;
  if (req(row.add1)) e.add1 = "Required";
  else if (row.add1.length > IP_LIMITS.add1) e.add1 = `Max ${IP_LIMITS.add1} chars`;
  if (String(row.add2 || "").length > IP_LIMITS.add2)
    e.add2 = `Max ${IP_LIMITS.add2} chars`;
  if (req(row.city)) e.city = "Required";
  else if (row.city.length > IP_LIMITS.city) e.city = `Max ${IP_LIMITS.city} chars`;
  if (req(row.state)) e.state = "State is required";
  else if (row.state.length > IP_LIMITS.state)
    e.state = `Max ${IP_LIMITS.state} chars`;
  if (digits(row.pincode).length !== 6) e.pincode = "6-digit pincode";
  if (digits(row.mobile).length !== 10) e.mobile = "10-digit mobile";
  const w = Math.round(Number(row.weight) || 0);
  if (!w || w <= 0) e.weight = "Weight (g) required";
  else if (w > IP_LIMITS.weightMax) e.weight = "Too heavy";
  ["length", "breadth", "height"].forEach((k) => {
    if (!(Math.round(Number(row[k]) || 0) > 0)) e[k] = "> 0";
  });
  const code = String(row.codCode || "").toUpperCase();
  if (code && code !== "COD" && code !== "CODR")
    e.codCode = "Must be COD or CODR";
  if (code && !(Math.round(Number(row.codValue) || 0) > 0))
    e.codValue = "COD value > 0";
  if (req(s.mobile) || digits(s.mobile).length !== 10)
    e.senderMobile = "Set a 10-digit sender mobile (top)";
  return e;
}

const toInt = (v) => {
  const n = Math.round(Number(String(v).replace(/[^\d.-]/g, "")) || 0);
  return Number.isFinite(n) ? n : 0;
};

// Map an (edited) preview row → the full 48-column ArticleDetails object.
export function previewRowToArticle(row, sender) {
  const s = sender || DEFAULT_SENDER;
  const codCodeRaw = String(row.codCode || "").trim().toUpperCase();
  // "None" (or blank) = no COD: leave both the code and value blank in the file.
  const codCode =
    codCodeRaw && codCodeRaw !== "NONE" && codCodeRaw !== "PP" ? codCodeRaw : "";
  return {
    "SERIAL NUMBER": row.serial,
    "BARCODE NO": String(row.barcode || "").trim(),
    "PHYSICAL WEIGHT": row.weight === "" ? "" : toInt(row.weight),
    "SHAPE OF ARTICLE": row.shape || "NROL",
    "LENGTH ": toInt(row.length),
    "BREADTH/DIAMETER": toInt(row.breadth),
    HEIGHT: toInt(row.height),
    "PRIORITY FLAG": true,
    "DELIVERY INSTRUCTION": row.delivery || "ND",
    "INSTRUCTION RTS": "RTS",
    "SENDER NAME": s.name || "",
    "SENDER COMPANY": s.company || "",
    "SENDER ADD LINE 1": s.add1 || "",
    "SENDER ADD LINE 2": s.add2 || "",
    "SENDER CITY": s.city || "",
    "SENDER STATE": s.state || "",
    "SENDER PINCODE": s.pincode || "",
    "SENDER EMAILID": s.email || "",
    "SENDER ALT CONTACT": "",
    "SENDER KYC": "",
    "SENDER TAX REFERENCE": "",
    "RECEIVER NAME": cap(row.receiverName, IP_LIMITS.receiverName),
    "RECEIVER COMPANY": "",
    "RECEIVER ADD LINE 1": cap(row.add1, IP_LIMITS.add1),
    "RECEIVER ADD LINE 2": cap(row.add2, IP_LIMITS.add2),
    "RECEIVER CITY": cap(row.city, IP_LIMITS.city),
    "RECEIVER STATE": cap(row.state, IP_LIMITS.state),
    "RECEIVER PINCODE": String(row.pincode || "").replace(/\D/g, "").slice(0, 6),
    "RECEIVER EMAILID": "",
    "RECEIVER ALT CONTACT": row.altMobile || "",
    "RECEIVER KYC": "",
    "RECEIVER TAX REFERENCE": "",
    "ALT ADDRESS FLAG": false,
    "PICKUP ADDRESS FLAG": false,
    "DROP OFF PINCODE": s.dropPincode || "400017",
    "DROPOFF/PICKUP OFFICE ID": "",
    "SENDER MOBILE NO": s.mobile || "",
    "RECEIVER MOBILE NO": row.mobile || "",
    "PREPAYMENT CODE": "",
    "VALUE OF PREPAYMENT": "",
    "CODR/COD": codCode,
    // Only emit a COD value when a code is present (blank code = no collection).
    "VALUE FOR CODR/COD": codCode ? toInt(row.codValue) : "",
    "INSURANCE TYPE": "",
    "VALUE OF INSURANCE": "",
    ACK: false,
    REGISTRATION: true,
    "OTP BASED DELIVERY": false,
    "BULK REFERENCE": row.orderId || "",
  };
}

// Assemble the multi-sheet India Post workbook (SheetJS book object).
async function buildIpWorkbook(previewRows, sender) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const articleObjs = (previewRows || []).map((r, i) =>
    previewRowToArticle({ ...r, serial: i + 1 }, sender),
  );
  const articleAoa = [
    ARTICLE_HEADERS,
    ...articleObjs.map((o) => ARTICLE_HEADERS.map((h) => o[h] ?? "")),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(articleAoa),
    "ArticleDetails",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([PICKUP_HEADERS]),
    "PickupAddress",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([ALT_HEADERS]),
    "AltAddress",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(INFORMATION_AOA),
    "Information",
  );
  return { XLSX, wb };
}

// Build + trigger a browser download of the .xlsx.
export async function downloadIpWorkbook(filename, previewRows, sender) {
  const { XLSX, wb } = await buildIpWorkbook(previewRows, sender);
  XLSX.writeFile(wb, filename);
}

// Parse an uploaded India Post .xlsx back into editable preview rows (reverse of
// previewRowToArticle). Reads the ArticleDetails sheet, matches columns by
// header name (robust to reordering), and also returns any sender details found
// on the first row so the "From" block can be prefilled too.
export async function parseIpWorkbookFile(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase() === "articledetails") ||
    wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No ArticleDetails sheet found in the file.");
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!aoa.length) throw new Error("The sheet is empty.");

  const header = (aoa[0] || []).map((h) => String(h).trim());
  const idx = (name) => header.indexOf(String(name).trim());
  const get = (row, name) => {
    const i = idx(name);
    return i >= 0 ? row[i] : "";
  };
  const str = (v) => (v === undefined || v === null ? "" : String(v).trim());

  const rows = [];
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    // Skip fully empty rows.
    if (!row.some((c) => str(c) !== "")) continue;
    const name = str(get(row, "RECEIVER NAME"));
    const pin = str(get(row, "RECEIVER PINCODE"));
    const mob = str(get(row, "RECEIVER MOBILE NO"));
    // Ignore rows with nothing useful.
    if (!name && !pin && !mob) continue;
    const codCode = str(get(row, "CODR/COD")).toUpperCase();
    const height = Number(str(get(row, "HEIGHT"))) || 1;
    rows.push({
      serial: rows.length + 1,
      orderId: str(get(row, "BULK REFERENCE")),
      barcode: str(get(row, "BARCODE NO")),
      receiverName: name,
      mobile: mob.replace(/\D/g, "").slice(-10),
      add1: str(get(row, "RECEIVER ADD LINE 1")),
      add2: str(get(row, "RECEIVER ADD LINE 2")),
      city: str(get(row, "RECEIVER CITY")),
      state: str(get(row, "RECEIVER STATE")),
      pincode: pin.replace(/\D/g, "").slice(0, 6),
      weight: str(get(row, "PHYSICAL WEIGHT")),
      length: Number(str(get(row, "LENGTH "))) || Number(str(get(row, "LENGTH"))) || 22,
      breadth: Number(str(get(row, "BREADTH/DIAMETER"))) || 13,
      height,
      shape: str(get(row, "SHAPE OF ARTICLE")) || "NROL",
      delivery: str(get(row, "DELIVERY INSTRUCTION")) || "ND",
      books: height,
      covers: [],
      isCOD: codCode === "COD" || codCode === "CODR",
      codCode: codCode === "COD" || codCode === "CODR" ? codCode : "",
      codValue: str(get(row, "VALUE FOR CODR/COD")) || (codCode ? 0 : 10),
    });
  }
  if (!rows.length) throw new Error("No usable article rows found in the file.");

  // Sender details (from the first data row's SENDER * columns), if present.
  const first = aoa[1] || [];
  const senderMobile = str(get(first, "SENDER MOBILE NO"));
  const sender = senderMobile
    ? {
        name: str(get(first, "SENDER NAME")),
        add1: str(get(first, "SENDER ADD LINE 1")),
        add2: str(get(first, "SENDER ADD LINE 2")),
        city: str(get(first, "SENDER CITY")),
        state: str(get(first, "SENDER STATE")),
        pincode: str(get(first, "SENDER PINCODE")),
        email: str(get(first, "SENDER EMAILID")),
        mobile: senderMobile.replace(/\D/g, "").slice(-10),
        dropPincode: str(get(first, "DROP OFF PINCODE")),
      }
    : null;

  return { rows, sender };
}

// Parse an uploaded India Post sheet into an { orderId: weightGrams } map,
// reading BULK REFERENCE (order id) + PHYSICAL WEIGHT. Used to bulk-assign
// weights back onto orders before booking.
export async function parseWeightsFile(file) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase() === "articledetails") ||
    wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No ArticleDetails sheet in the file.");
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const header = (aoa[0] || []).map((h) => String(h).trim());
  const idx = (name) =>
    header.findIndex((h) => h.toLowerCase() === String(name).toLowerCase());
  const iRef = idx("BULK REFERENCE");
  const iWt = idx("PHYSICAL WEIGHT");
  if (iRef < 0 || iWt < 0)
    throw new Error(
      "Sheet needs 'BULK REFERENCE' (order id) and 'PHYSICAL WEIGHT' columns.",
    );
  const map = {};
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const id = String(row[iRef] ?? "").trim();
    const wt = Math.round(
      Number(String(row[iWt] ?? "").replace(/[^\d.]/g, "")) || 0,
    );
    if (id && wt > 0) map[id] = wt;
  }
  return map;
}

// Parse an India Post "Bulk Articles Tracking" export into a list of
// { article, status, lastEvent } rows. Reads the "Article Number" + "Status"
// columns (the file the customer downloads from the bulk-tracking portal).
export async function parseTrackingStatusFile(file) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  // Prefer an "Articles" sheet, else the first sheet.
  const sheetName =
    wb.SheetNames.find((n) => /article/i.test(n)) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No sheet found in the file.");
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const header = (aoa[0] || []).map((h) => String(h).trim());
  const idx = (...names) =>
    header.findIndex((h) =>
      names.some((n) => h.toLowerCase() === String(n).toLowerCase()),
    );
  const iArt = idx("Article Number", "Article No", "Tracking ID", "Article");
  const iStat = idx("Status", "Current Status");
  const iEvent = idx("Last Event", "Event", "Remarks");
  if (iArt < 0 || iStat < 0)
    throw new Error(
      "File needs 'Article Number' and 'Status' columns (India Post bulk tracking export).",
    );
  const out = [];
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const article = String(row[iArt] ?? "")
      .trim()
      .toUpperCase();
    const status = String(row[iStat] ?? "").trim();
    if (!article) continue;
    out.push({
      article,
      status,
      lastEvent: iEvent >= 0 ? String(row[iEvent] ?? "").trim() : "",
    });
  }
  return out;
}

// Build the same workbook as an in-memory Blob (for API upload to India Post).
export async function buildIpWorkbookBlob(previewRows, sender) {
  const { XLSX, wb } = await buildIpWorkbook(previewRows, sender);
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
