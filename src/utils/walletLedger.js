// Wallet ledger — reads the "Wallet" column entries from the orders sheet for a
// phone, and computes a balance with 60-DAY EXPIRY on credited coins (FIFO:
// oldest coins are spent first; coins older than 60 days expire unused).

export const WALLET_TTL_DAYS = 60;
export const WALLET_EXPIRY_WARN_DAYS = 10;
const DAY = 24 * 60 * 60 * 1000;

// Parse the many date formats the sheet's Timestamp column can hold.
export function parseSheetDate(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const str = String(input).trim();
  if (!str) return null;
  if (str.startsWith("Date(")) {
    const m = str.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
    if (m) {
      const d = new Date(
        +m[1],
        +m[2],
        +m[3],
        m[4] ? +m[4] : 0,
        m[5] ? +m[5] : 0,
        m[6] ? +m[6] : 0,
      );
      if (!isNaN(d.getTime())) return d;
    }
  }
  if (str.includes("/")) {
    const m = str.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i,
    );
    if (m) {
      let hours = m[4] ? +m[4] : 0;
      const mer = (m[7] || "").toLowerCase();
      if (mer === "pm" && hours < 12) hours += 12;
      if (mer === "am" && hours === 12) hours = 0;
      const d = new Date(+m[3], +m[2] - 1, +m[1], hours, m[5] ? +m[5] : 0, m[6] ? +m[6] : 0);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Compute the wallet state from raw ledger entries.
 * @param {{date: Date, amount: number}[]} entries  +amount = credit, -amount = debit
 * @returns { balance, history, expiringSoon, expiringDate, oldestCreditDate }
 */
export function computeWalletLedger(entries, now = Date.now(), ttlDays = WALLET_TTL_DAYS) {
  const sorted = [...entries]
    .filter((e) => e.date && e.amount)
    .sort((a, b) => a.date - b.date);

  const credits = []; // { date, remaining, expires }
  const history = [];

  for (const e of sorted) {
    if (e.amount > 0) {
      const expires = new Date(e.date.getTime() + ttlDays * DAY);
      credits.push({ date: e.date, remaining: e.amount, expires });
      history.push({
        date: e.date,
        amount: e.amount,
        type: "credit",
        reason: e.reason || "",
        orderId: e.orderId || "",
        expires,
      });
    } else {
      let need = -e.amount;
      history.push({
        date: e.date,
        amount: e.amount,
        type: "debit",
        reason: e.reason || "",
        orderId: e.orderId || "",
      });
      for (const c of credits) {
        if (need <= 0) break;
        if (c.remaining <= 0) continue;
        if (c.expires < e.date) continue; // already expired at debit time
        const take = Math.min(c.remaining, need);
        c.remaining -= take;
        need -= take;
      }
    }
  }

  let balance = 0;
  let expiringSoon = 0;
  let expiringDate = null;
  let oldestCreditDate = null;
  const warnMs = WALLET_EXPIRY_WARN_DAYS * DAY;

  for (const c of credits) {
    if (c.remaining <= 0) continue;
    if (c.expires.getTime() <= now) continue; // expired, unusable
    balance += c.remaining;
    if (!oldestCreditDate || c.date < oldestCreditDate) oldestCreditDate = c.date;
    if (c.expires.getTime() - now <= warnMs) {
      expiringSoon += c.remaining;
      if (!expiringDate || c.expires < expiringDate) expiringDate = c.expires;
    }
  }

  return {
    balance: Math.max(0, Math.round(balance)),
    history: history.reverse(), // newest first
    expiringSoon: Math.round(expiringSoon),
    expiringDate,
    oldestCreditDate,
  };
}

// Read raw {date, amount} wallet entries for a phone via our server route
// (/api/wallet). The sheet is read server-side and scoped to this phone, so
// other customers' rows and the sheet URL never reach the browser.
export async function fetchWalletEntries(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return [];
  try {
    const res = await fetch(`/api/wallet?phone=${digits}`);
    const json = await res.json();
    const entries = Array.isArray(json.entries) ? json.entries : [];
    // API returns dates as epoch ms; rehydrate to Date for the ledger math.
    return entries.map((e) => ({
      date: new Date(e.date),
      amount: e.amount,
      reason: e.reason || "",
      type: e.type || "",
      orderId: e.orderId || "",
    }));
  } catch (e) {
    console.error("Wallet ledger fetch failed:", e);
    return [];
  }
}

// Convenience: fetch + compute in one call.
export async function fetchWalletLedger(phone) {
  const entries = await fetchWalletEntries(phone);
  return computeWalletLedger(entries);
}
