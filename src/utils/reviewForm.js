// Google Form config for store/book reviews.
export const REVIEW_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSctZMQDICLxyCcPlsMvw4sEwZ6NF_EpHTVMyWPrRelIImqg3Q/formResponse";
export const REVIEW_FIELD_IDS = {
  type: "entry.247666328", // "Store" | "Book"
  bookName: "entry.1400746927", // book title (for book reviews)
  rating: "entry.224072796", // 1–5
  review: "entry.2097151831", // the review text
  email: "entry.657005910", // customer email
  phone: "entry.429108534", // customer phone
  timestamp: "entry.903997111", // submission time
  userAgent: "entry.1887065179", // device info (optional)
};

// Published sheet (CSV) used to READ approved reviews back onto the page.
export const REVIEW_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkBuiwKblKeTjxVTDb5Ga3a0j0cmXvHDg0lCvc09KGgZbZmqsjwZfs4fE40AbuE2dOH4rPOQeMWSZK/pub?output=csv";

// Minimal CSV parser (handles quoted fields + newlines in cells).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

// Fetch real reviews from the published sheet. Best-effort header matching so
// it keeps working even if column titles vary slightly.
export async function fetchSheetReviews() {
  if (!REVIEW_CSV_URL) return [];
  try {
    const res = await fetch(REVIEW_CSV_URL, { cache: "no-store" });
    const text = await res.text();
    const rows = parseCsv(text).filter((r) => r.some((c) => c.trim()));
    if (rows.length < 2) return [];
    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const find = (re, avoid) =>
      headers.findIndex((h) => re.test(h) && (!avoid || !avoid.test(h)));
    const iType = find(/type/);
    const iBook = find(/book/);
    const iRating = find(/rating|stars?/);
    const iReview = find(/review|feedback|comment/, /type/);
    const iEmail = find(/email/);

    return rows
      .slice(1)
      .map((r) => {
        const text2 = (iReview >= 0 ? r[iReview] : "").trim();
        const rating = parseInt((iRating >= 0 ? r[iRating] : "").trim(), 10);
        const email = (iEmail >= 0 ? r[iEmail] : "").trim();
        const name = email
          ? email.split("@")[0].replace(/[._]/g, " ")
          : "Verified reader";
        return {
          name: name.replace(/\b\w/g, (m) => m.toUpperCase()).slice(0, 22),
          rating: rating >= 1 && rating <= 5 ? rating : 5,
          text: text2,
          type: (iType >= 0 ? r[iType] : "").trim() || "Store",
          book: (iBook >= 0 ? r[iBook] : "").trim(),
          real: true,
        };
      })
      .filter((rv) => rv.text.length > 3);
  } catch (e) {
    console.error("Failed to load sheet reviews:", e);
    return [];
  }
}

// Fire-and-forget submit to the review Google Form (no-cors like the order form).
export async function submitReviewToSheet(data) {
  if (!REVIEW_FORM_URL) return { ok: false, skipped: true };
  const params = new URLSearchParams();
  Object.entries(REVIEW_FIELD_IDS).forEach(([key, id]) => {
    if (id && data[key] != null && data[key] !== "") {
      params.append(id, String(data[key]));
    }
  });
  try {
    await fetch(REVIEW_FORM_URL, { method: "POST", mode: "no-cors", body: params });
    return { ok: true };
  } catch (e) {
    console.error("Review sheet submit failed:", e);
    return { ok: false, error: e };
  }
}

// ── Per-device rate limiting: max 10 reviews per rolling 10 minutes ──
const RL_KEY = "tbx_review_ts";
const RL_WINDOW = 10 * 60 * 1000;
const RL_MAX = 10;

export function isReviewRateLimited() {
  try {
    const now = Date.now();
    const ts = JSON.parse(localStorage.getItem(RL_KEY) || "[]").filter(
      (t) => now - t < RL_WINDOW,
    );
    return ts.length >= RL_MAX;
  } catch {
    return false;
  }
}

export function recordReviewSubmission() {
  try {
    const now = Date.now();
    const ts = JSON.parse(localStorage.getItem(RL_KEY) || "[]")
      .filter((t) => now - t < RL_WINDOW)
      .concat(now);
    localStorage.setItem(RL_KEY, JSON.stringify(ts));
  } catch {
    /* ignore */
  }
}
