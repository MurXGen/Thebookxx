// QuickReads client helpers — saved reads, per-book unlock, checkout,
// approval check, and the downloadable "knowledge card" image.

// ============================================================
// CONFIG — paste your dedicated QuickReads Google Form + Sheet here.
// (Kept separate from the books order form/sheet.)
// ============================================================
export const QR_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdvvTVLhLx9ZsJYGmpoU4S69UL-ch86CjwV_4Ywzy-YYbOYPA/formResponse";
// Mapped in the order of the form's prefill link. If any value lands in the
// wrong column, swap the entry IDs below to match your question order.
export const QR_FORM_FIELDS = {
  timestamp: "entry.545632713",
  name: "entry.830451727",
  mobile: "entry.1220930407",
  bookId: "entry.590206605",
  bookName: "entry.211134755",
  amount: "entry.944113587",
  paymentMethod: "entry.101514473",
  paymentStatus: "entry.1612784704",
  approvalStatus: "entry.837917910",
  txnRef: "entry.274318451",
};
// Published-to-web CSV of the QuickReads responses sheet (public, CORS-friendly).
export const QR_PUB_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSl_8uU6-AAMa5GqfjpFud30zQ7kMRfxYeK0klon7-F7vLZA_ri4YpFgkNVjKCDdhQpajdkWIFkj84j/pub?output=csv";
// Spreadsheet ID (fallback approval read via gviz, if the CSV ever fails).
export const QR_SHEET_ID = "1k0_wc0iziyWNpmuebhhz7PNOqcOD86VFHAS-3J6M52M";
export const QR_SHEET_NAME = "Form responses 1";
// Live read endpoint. Unlike the published CSV (pub?output=csv), which Google
// can cache for several minutes, the gviz endpoint reflects edits/deletions in
// the sheet almost immediately — so removing a row/status RE-LOCKS on reload.
export const QR_GVIZ_CSV_URL = `https://docs.google.com/spreadsheets/d/${QR_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
  QR_SHEET_NAME,
)}`;
// Column headers (trailing spaces in the sheet are trimmed on read).
export const QR_PAYMENT_HEADER = "Payment Status";
export const QR_APPROVAL_HEADER = "Approval Status";
export const QR_MOBILE_HEADER = "CustMobile Number";
export const QR_BOOKID_HEADER = "Book ID";
// Any of these values (case-insensitive) in the Approval Status column unlocks.
export const QR_APPROVED_VALUES = [
  "approved",
  "approve",
  "done",
  "yes",
  "granted",
  "unlock",
  "unlocked",
];
// Telegram endpoint (reuses the existing journalx bridge).
const QR_TELEGRAM_URL = "https://api.journalx.app/api/bookxTelegram/order";

const SAVED_KEY = "qr_saved";
const ACCESS_KEY = "qr_access"; // { phone, bookIds: [] }
const PHONE_KEY = "qr_phone";
const PROGRESS_KEY = "qr_progress"; // { [bookId]: lastFrameIndex }

/* ---------------- Reading progress (resume where you left off) ---------------- */
export function getReadProgress(bookId) {
  if (typeof window === "undefined" || !bookId) return 0;
  try {
    const map = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    const v = Number(map?.[bookId]);
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

export function setReadProgress(bookId, index) {
  if (typeof window === "undefined" || !bookId) return;
  try {
    const map = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    map[bookId] = index;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {}
}

/* ---------------- Saved reads ---------------- */
export function getSavedReads() {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function isSaved(bookId, frameId) {
  return getSavedReads().some(
    (s) => s.bookId === bookId && s.frameId === frameId,
  );
}

export function toggleSavedRead(item) {
  const list = getSavedReads();
  const exists = list.some(
    (s) => s.bookId === item.bookId && s.frameId === item.frameId,
  );
  const next = exists
    ? list.filter(
        (s) => !(s.bookId === item.bookId && s.frameId === item.frameId),
      )
    : [
        ...list,
        {
          bookId: item.bookId,
          bookName: item.bookName,
          frameId: item.frameId,
          title: item.title,
          content: item.content,
          ts: Date.now(),
        },
      ];
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

/* ---------------- Access / unlock ---------------- */
export function getSavedPhone() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PHONE_KEY) || "";
}

export function setSavedPhone(phone) {
  try {
    localStorage.setItem(PHONE_KEY, String(phone || ""));
  } catch {}
}

function getAccess() {
  if (typeof window === "undefined") return { phone: "", bookIds: [] };
  try {
    const a = JSON.parse(localStorage.getItem(ACCESS_KEY) || "null");
    if (a && Array.isArray(a.bookIds)) return a;
  } catch {}
  return { phone: "", bookIds: [] };
}

export function isBookUnlocked(bookId) {
  if (!bookId) return false;
  return getAccess().bookIds.includes(bookId);
}

// All book IDs the user has unlocked on this device (their QuickReads library).
export function unlockedBookIds() {
  return getAccess().bookIds;
}

// Grant local access after the sheet confirms approval (called by unlock flow).
export function grantBookAccess(bookId, phone) {
  const a = getAccess();
  const bookIds = Array.from(new Set([...a.bookIds, bookId]));
  try {
    localStorage.setItem(
      ACCESS_KEY,
      JSON.stringify({ phone: phone || a.phone, bookIds }),
    );
    if (phone) setSavedPhone(phone);
  } catch {}
  return bookIds;
}

// Revoke local access for a book (used when the sheet no longer confirms it).
export function revokeBookAccess(bookId) {
  const a = getAccess();
  const bookIds = a.bookIds.filter((id) => id !== bookId);
  try {
    localStorage.setItem(
      ACCESS_KEY,
      JSON.stringify({ phone: a.phone, bookIds }),
    );
  } catch {}
  return bookIds;
}

/* ---------------- Downloadable knowledge card ---------------- */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || "").split(" ");
  let line = "";
  let curY = y;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, curY);
      line = w + " ";
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, curY);
    curY += lineHeight;
  }
  return curY;
}

// Builds a premium, Instagram-style square knowledge card and downloads it.
export async function buildQuickReadImage({ bookName, cover, title, content }) {
  if (typeof window === "undefined") return;
  const W = 1080;
  const H = 1080;
  const scale = 1;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");

  // Background gradient (brand)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#111318");
  grad.addColorStop(1, "#1c2029");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Soft orange glow accent
  const glow = ctx.createRadialGradient(W * 0.85, 120, 40, W * 0.85, 120, 520);
  glow.addColorStop(0, "rgba(251,133,0,0.35)");
  glow.addColorStop(1, "rgba(251,133,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const P = 90;

  // Kicker
  ctx.fillStyle = "#fb8500";
  ctx.font = "700 30px Poppins, Arial, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("QUICKREADS  ·  KEY INSIGHT", P, 150);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px Poppins, Arial, sans-serif";
  let y = wrapText(ctx, title, P, 260, W - P * 2, 74);

  // Content
  ctx.fillStyle = "#d7dae0";
  ctx.font = "400 40px Poppins, Arial, sans-serif";
  wrapText(ctx, content, P, y + 40, W - P * 2, 58);

  // Footer: cover + book + branding
  const cImg = await loadImage(cover);
  const footY = H - 190;
  if (cImg) {
    const cw = 96;
    const ch = 134;
    // rounded cover
    const r = 12;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(P + r, footY);
    ctx.arcTo(P + cw, footY, P + cw, footY + ch, r);
    ctx.arcTo(P + cw, footY + ch, P, footY + ch, r);
    ctx.arcTo(P, footY + ch, P, footY, r);
    ctx.arcTo(P, footY, P + cw, footY, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(cImg, P, footY, cw, ch);
    ctx.restore();
  }
  const textX = cImg ? P + 130 : P;
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 40px Poppins, Arial, sans-serif";
  ctx.fillText(String(bookName || "").slice(0, 34), textX, footY + 52);
  ctx.fillStyle = "#9aa0a6";
  ctx.font = "500 30px Poppins, Arial, sans-serif";
  ctx.fillText("QuickReads by TheBookX", textX, footY + 98);

  // bottom accent bar
  ctx.fillStyle = "#fb8500";
  ctx.fillRect(0, H - 14, W, 14);

  await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickread_${(title || "insight")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

/* ---------------- Checkout: order + telegram + approval ---------------- */

// Submit a paid QuickReads order to the dedicated Google Form (no-cors).
export async function submitQuickReadOrder(order) {
  if (!QR_FORM_URL || !QR_FORM_FIELDS.name) {
    console.warn("QuickReads form not configured — order not stored:", order);
    return { ok: false, reason: "not-configured" };
  }
  const now = new Date();
  const values = {
    timestamp: now.toLocaleString("en-IN"),
    name: order.name || "",
    mobile: order.mobile || "",
    bookId: order.bookId || "",
    bookName: order.bookName || "",
    amount: order.amount ?? "",
    paymentMethod: order.paymentMethod || "UPI Payment",
    paymentStatus: order.paymentStatus || "Paid (unverified)",
    approvalStatus: order.approvalStatus || "Pending",
    txnRef: order.txnRef || "",
  };
  const params = new URLSearchParams();
  Object.entries(QR_FORM_FIELDS).forEach(([key, entryId]) => {
    if (entryId && values[key] !== undefined && values[key] !== "") {
      params.append(entryId, String(values[key]));
    }
  });
  try {
    await fetch(QR_FORM_URL, { method: "POST", mode: "no-cors", body: params });
    return { ok: true };
  } catch (e) {
    console.error("QuickReads order submit failed:", e);
    return { ok: false, reason: "network" };
  }
}

// Notify Telegram of a QuickReads order (reuses the existing bridge).
export async function notifyQuickReadTelegram(order) {
  const msg = `
🧠 *NEW QUICKREADS ORDER — THEBOOKX*

━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${order.name || "-"}
📞 *Mobile:* ${order.mobile || "-"}
📖 *Book:* ${order.bookName || "-"} (${order.bookId || "-"})
💰 *Amount:* ₹${order.amount ?? "-"}
💳 *Payment:* ${order.paymentMethod || "UPI"} · ${order.paymentStatus || "unverified"}
⏳ *Approval:* Pending manual verification
${order.txnRef ? `🔖 *Txn Ref:* ${order.txnRef}\n` : ""}━━━━━━━━━━━━━━━━━━━━
_Approve this order in the QuickReads sheet to grant access._
  `.trim();
  const payload = JSON.stringify({
    orderDetails: msg,
    customerName: order.name,
    customerPhone: order.mobile,
    totalAmount: order.amount,
    paymentMethod: "QuickReads-" + (order.paymentMethod || "UPI"),
  });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(QR_TELEGRAM_URL, blob)) return;
    }
    fetch(QR_TELEGRAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: payload,
    }).catch(() => {});
  } catch (e) {
    console.error("QuickReads telegram failed:", e);
  }
}

// Minimal CSV parser (handles quoted fields, escaped quotes, CRLF).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// True when the Payment Status means the admin verified it (removed the
// "(unverified)" suffix) — e.g. "Paid" but NOT "Paid (unverified)".
function isPaymentVerified(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return false;
  if (v.includes("unverified")) return false;
  return v.includes("paid") || v.includes("verified") || v.includes("success");
}

// Read the responses sheet as CSV. Tries the LIVE gviz endpoint first (reflects
// deletions/edits almost immediately) and falls back to the published CSV
// (heavily cached by Google) only if the live read fails. This is what makes
// removing a Timestamp/Status in the sheet actually re-lock access on reload.
async function fetchSheetCsv() {
  const bust = `&_=${Date.now()}`;
  try {
    const res = await fetch(`${QR_GVIZ_CSV_URL}${bust}`, { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      // gviz returns real CSV for public sheets; guard against an HTML error page.
      if (text && text.trim() && !/^\s*</.test(text)) return text;
    }
  } catch {
    /* fall through to the published CSV */
  }
  const res = await fetch(`${QR_PUB_CSV_URL}${bust}`, { cache: "no-store" });
  return res.text();
}

// Return every bookId this phone has a VERIFIED QuickReads order for
// (payment verified or approval column approved). Cross-device, reads the sheet.
export async function getVerifiedBookIdsForPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return [];
  try {
    const text = await fetchSheetCsv();
    const rows = parseCsv(text);
    if (!rows.length) return [];
    const headers = rows[0].map((h) => String(h || "").trim());
    const mIdx = headers.indexOf(QR_MOBILE_HEADER);
    const bIdx = headers.indexOf(QR_BOOKID_HEADER);
    const pIdx = headers.indexOf(QR_PAYMENT_HEADER);
    const aIdx = headers.indexOf(QR_APPROVAL_HEADER);
    const set = new Set();
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const rowPhone = String(cells[mIdx] ?? "").replace(/\D/g, "").slice(-10);
      if (rowPhone !== digits) continue;
      const payOk = isPaymentVerified(cells[pIdx]);
      const appr = String(cells[aIdx] ?? "").trim().toLowerCase();
      if (payOk || QR_APPROVED_VALUES.includes(appr)) {
        const b = String(cells[bIdx] ?? "").trim();
        if (b) set.add(b);
      }
    }
    return [...set];
  } catch (e) {
    console.error("QuickReads library fetch failed:", e);
    return [];
  }
}

// Full QuickReads profile for a phone, read from the sheet (cross-device):
//   { name, verified: [bookId], pending: [bookId] }
// - name    : the customer's name from the QuickReads sheet (latest non-empty),
//             so the profile can greet them even when there are NO book orders.
// - verified: books whose payment/approval is confirmed (ready to read).
// - pending : books ordered but not yet verified (awaiting confirmation).
// Subscription rows (SUB-*) are excluded from the book lists.
export async function getQuickReadProfileForPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return { name: "", verified: [], pending: [] };
  try {
    const text = await fetchSheetCsv();
    const rows = parseCsv(text);
    if (!rows.length) return { name: "", verified: [], pending: [] };
    const headers = rows[0].map((h) => String(h || "").trim());
    const mIdx = headers.indexOf(QR_MOBILE_HEADER);
    const bIdx = headers.indexOf(QR_BOOKID_HEADER);
    const pIdx = headers.indexOf(QR_PAYMENT_HEADER);
    const aIdx = headers.indexOf(QR_APPROVAL_HEADER);
    // Name column isn't a fixed constant — find a "name" header that isn't the
    // mobile/book column (handles "Name", "CustName", "Customer Name", etc.).
    const nIdx = headers.findIndex(
      (h) => /name/i.test(h) && !/mobile|book/i.test(h),
    );
    const verified = new Set();
    const pending = new Set();
    let name = "";
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const rowPhone = String(cells[mIdx] ?? "").replace(/\D/g, "").slice(-10);
      if (rowPhone !== digits) continue;
      // Latest non-empty name wins (rows are appended chronologically).
      if (nIdx >= 0) {
        const rowName = String(cells[nIdx] ?? "").trim();
        if (rowName) name = rowName;
      }
      const bookId = String(cells[bIdx] ?? "").trim();
      if (!bookId) continue;
      const upper = bookId.toUpperCase();
      if (upper === SUB_MONTHLY || upper === SUB_YEARLY) continue; // subs handled elsewhere
      const payOk = isPaymentVerified(cells[pIdx]);
      const appr = String(cells[aIdx] ?? "").trim().toLowerCase();
      if (payOk || QR_APPROVED_VALUES.includes(appr)) {
        verified.add(bookId);
        pending.delete(bookId);
      } else if (!verified.has(bookId)) {
        pending.add(bookId);
      }
    }
    return { name, verified: [...verified], pending: [...pending] };
  } catch (e) {
    console.error("QuickReads profile fetch failed:", e);
    return { name: "", verified: [], pending: [], error: true };
  }
}

/* ---------------- Unlimited subscription (₹99/mo · ₹999/yr) ---------------- */
const SUB_KEY = "qr_sub"; // { plan, expiresAt }
const SUB_MONTHLY = "SUB-MONTHLY";
const SUB_YEARLY = "SUB-YEARLY";
const DAY_MS = 24 * 60 * 60 * 1000;
// Generous bounds so a mid-period payment covers the whole month/year.
const SUB_PERIOD_MS = { monthly: 31 * DAY_MS, yearly: 366 * DAY_MS };

// Parse the sheet's Timestamp column (dd/mm/yyyy [HH:mm:ss] [am/pm]).
function parseSheetDate(input) {
  const str = String(input || "").trim();
  if (!str) return null;
  const m = str.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i,
  );
  if (!m) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  const day = +m[1];
  const month = +m[2] - 1;
  const year = +m[3];
  let hh = m[4] ? +m[4] : 0;
  const mm = m[5] ? +m[5] : 0;
  const ss = m[6] ? +m[6] : 0;
  const mer = (m[7] || "").toLowerCase();
  if (mer === "pm" && hh < 12) hh += 12;
  if (mer === "am" && hh === 12) hh = 0;
  const d = new Date(year, month, day, hh, mm, ss);
  return isNaN(d.getTime()) ? null : d;
}

export function getLocalSubscription() {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(localStorage.getItem(SUB_KEY) || "null");
    if (s && s.plan && s.expiresAt) return s;
  } catch {}
  return null;
}

export function setLocalSubscription(plan, expiresAt) {
  try {
    localStorage.setItem(SUB_KEY, JSON.stringify({ plan, expiresAt }));
  } catch {}
}

export function clearLocalSubscription() {
  try {
    localStorage.removeItem(SUB_KEY);
  } catch {}
}

// Fast, offline check of the cached subscription — active only if not expired.
export function isSubscriptionActiveLocal() {
  const s = getLocalSubscription();
  return !!(s && Date.now() < s.expiresAt);
}

// Authoritative check against the sheet. A subscription is active ONLY if a
// verified subscription row's payment date falls inside its current period —
// so a past month's payment can never keep unlocking access.
// Returns { active, plan, expiresAt } | { active:false } | { active:false, error:true }.
export async function checkSubscription(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return { active: false };
  try {
    const text = await fetchSheetCsv();
    const rows = parseCsv(text);
    if (!rows.length) return { active: false };
    const headers = rows[0].map((h) => String(h || "").trim());
    const mIdx = headers.indexOf(QR_MOBILE_HEADER);
    const bIdx = headers.indexOf(QR_BOOKID_HEADER);
    const pIdx = headers.indexOf(QR_PAYMENT_HEADER);
    const aIdx = headers.indexOf(QR_APPROVAL_HEADER);
    const tIdx = headers.indexOf("Timestamp");
    const now = Date.now();
    let best = null; // latest still-valid subscription
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const rowPhone = String(cells[mIdx] ?? "").replace(/\D/g, "").slice(-10);
      if (rowPhone !== digits) continue;
      const bookId = String(cells[bIdx] ?? "").trim().toUpperCase();
      const plan =
        bookId === SUB_MONTHLY
          ? "monthly"
          : bookId === SUB_YEARLY
            ? "yearly"
            : null;
      if (!plan) continue;
      const payOk = isPaymentVerified(cells[pIdx]);
      const appr = String(cells[aIdx] ?? "").trim().toLowerCase();
      if (!payOk && !QR_APPROVED_VALUES.includes(appr)) continue;
      const start = parseSheetDate(cells[tIdx]);
      if (!start) continue;
      const expiresAt = start.getTime() + SUB_PERIOD_MS[plan];
      if (expiresAt <= now) continue; // expired — cannot unlock (loophole closed)
      if (!best || expiresAt > best.expiresAt) best = { plan, expiresAt };
    }
    if (best) {
      setLocalSubscription(best.plan, best.expiresAt);
      return { active: true, ...best };
    }
    // Successful read, but no valid subscription row → drop any stale local
    // subscription so a deleted/expired sheet row can't keep unlocking.
    clearLocalSubscription();
    return { active: false };
  } catch (e) {
    console.error("QuickReads subscription check failed:", e);
    return { active: false, error: true };
  }
}

// Record a subscription purchase in the shared QuickReads sheet.
export async function submitSubscriptionOrder({ name, mobile, plan }) {
  const isYear = plan === "yearly";
  return submitQuickReadOrder({
    name,
    mobile,
    bookId: isYear ? SUB_YEARLY : SUB_MONTHLY,
    bookName: isYear ? "Unlimited — Yearly" : "Unlimited — Monthly",
    amount: isYear ? 999 : 99,
    paymentMethod: "UPI Payment",
    paymentStatus: "Paid (unverified)",
    approvalStatus: "Pending",
  });
}

// Check the sheet for a matching order:
//   "approved" — payment verified (or approval column approved)
//   "pending"  — order found but still unverified
//   "none"     — no matching order (or read failed)
export async function checkApproval(phone, bookId) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10 || !bookId) return "none";
  try {
    // Live read so we see the latest state as soon as the sheet updates.
    const text = await fetchSheetCsv();
    const rows = parseCsv(text);
    if (!rows.length) return "none";
    const headers = rows[0].map((h) => String(h || "").trim());
    const idxOf = (name) => headers.indexOf(name);
    const mIdx = idxOf(QR_MOBILE_HEADER);
    const bIdx = idxOf(QR_BOOKID_HEADER);
    const pIdx = idxOf(QR_PAYMENT_HEADER);
    const aIdx = idxOf(QR_APPROVAL_HEADER);
    let status = "none";
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const rowPhone = String(cells[mIdx] ?? "").replace(/\D/g, "").slice(-10);
      const rowBook = String(cells[bIdx] ?? "").trim();
      if (rowPhone !== digits || rowBook !== bookId) continue;
      const payOk = isPaymentVerified(cells[pIdx]);
      const appr = String(cells[aIdx] ?? "").trim().toLowerCase();
      const apprOk = QR_APPROVED_VALUES.includes(appr);
      if (payOk || apprOk) return "approved";
      status = "pending";
    }
    return status;
  } catch (e) {
    console.error("QuickReads approval check failed:", e);
    return "error";
  }
}
