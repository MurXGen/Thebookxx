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
export const SENDER_STORAGE_KEY = "ip_bulk_sender_v2";
export const DEFAULT_SENDER = {
  name: "TheBookX",
  company: "",
  add1: "Near Shilpa Sarees, Opp Apollo Pharmacy",
  add2: "Maheshwari Udyan",
  city: "Matunga",
  state: "Maharashtra",
  pincode: "400019",
  email: "",
  mobile: "",
  dropPincode: "400019", // where we hand parcels over (Matunga PO)
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

// Total number of physical books in an order + whether it's a set/collection.
export function orderBookMeta(order) {
  const lines = order?.parsedBooks || [];
  let qty = 0;
  let isSet = false;
  lines.forEach((l) => {
    const q = Number(l.quantity) || 1;
    qty += q;
    if (SET_RE.test(String(l.name || ""))) isSet = true;
  });
  if (qty === 0) qty = 1;
  return { qty, lines: lines.length, isSet };
}

// Speed = exactly one loose book. Everything else (2+ books, multi-line orders,
// or any set/collection) → contractual.
export function classifyOrderProduct(order) {
  const { qty, lines, isSet } = orderBookMeta(order);
  if (isSet) return "contractual";
  if (qty <= 1 && lines <= 1) return "speed";
  return "contractual";
}

// Best-guess parcel weight (g) from the catalogue. Weight is REQUIRED by the
// portal and can't be blank, so unmatched books fall back to ~250 g each.
export function estimateWeight(order) {
  const lines = order?.parsedBooks || [];
  let w = 0;
  let matched = false;
  let qty = 0;
  lines.forEach((l) => {
    const q = Number(l.quantity) || 1;
    qty += q;
    const b = BY_NAME[String(l.name || "").toLowerCase().trim()];
    if (b && Number(b.weight)) {
      matched = true;
      w += Number(b.weight) * q;
    } else {
      w += 250 * q; // fallback per-book weight for unmatched titles
    }
  });
  if (qty === 0) return 250;
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

// Build the lightweight, editable preview row for one order.
export function buildPreviewRow(order, serial) {
  const { isCOD, net } = codNetFor(order);
  const { qty } = orderBookMeta(order);
  const [add1, add2] = splitAddress(order?.["Address"]);
  const mobile = String(order?.["Phone Number"] || "").replace(/\D/g, "").slice(-10);
  return {
    serial,
    orderId: order?.["Order ID"] || "",
    barcode: "", // India Post article/barcode number (from your allocated series)
    receiverName: cap(clean(order?.["Customer Name"]), IP_LIMITS.receiverName),
    mobile,
    add1: cap(add1, IP_LIMITS.add1),
    add2: cap(add2, IP_LIMITS.add2),
    city: cap(order?.["City"], IP_LIMITS.city),
    state: cap(order?.["State"], IP_LIMITS.state),
    pincode: String(order?.["Pincode"] || "").replace(/\D/g, "").slice(0, 6),
    // Dimensions — same logic as the Book-online modal: 22 × 13 × (book count).
    weight: estimateWeight(order),
    length: 22,
    breadth: 13,
    height: Math.max(1, qty),
    shape: "NROL",
    delivery: "ND",
    books: qty,
    isCOD,
    // This is a COD-enabled contract, so the portal requires VpCodTypeCD="COD"
    // (uppercase) on every row. COD orders collect the net; prepaid collects a
    // ₹10 token. All editable in the preview.
    codCode: "COD",
    codValue: isCOD ? net : 10,
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
  const codCode = String(row.codCode || "").trim().toUpperCase();
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
    "RECEIVER ALT CONTACT": "",
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

// Build + trigger download of the multi-sheet India Post .xlsx.
export async function downloadIpWorkbook(filename, previewRows, sender) {
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

  XLSX.writeFile(wb, filename);
}
