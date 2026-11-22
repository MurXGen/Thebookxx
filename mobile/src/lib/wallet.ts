// Port of the website's src/utils/walletLedger.js — keep in sync.
// Coins expire 60 days after credit; spend is FIFO (oldest first).
import { API } from "@/theme";

export const WALLET_TTL_DAYS = 60;
export const WALLET_EXPIRY_WARN_DAYS = 10;
const DAY = 86400000;

export type Entry = { date: Date; amount: number; reason: string; type: string; orderId: string; locked: boolean; pending: boolean };
export type Txn = { date: Date; amount: number; type: "credit" | "debit"; reason: string; orderId: string; locked?: boolean; pending?: boolean; expires?: Date; remaining?: number; expired?: boolean; expiredAmount?: number };
export type Ledger = { balance: number; history: Txn[]; expiringSoon: number; expiringDate: Date | null; expiredTotal: number };

export async function fetchWalletEntries(phone: string): Promise<Entry[]> {
  const d = phone.replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return [];
  const r = await fetch(`${API}/api/wallet?phone=${d}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return (Array.isArray(j.entries) ? j.entries : []).map((e: Record<string, unknown>) => ({
    date: new Date(Number(e.date)),
    amount: Number(e.amount) || 0,
    reason: String(e.reason || ""),
    type: String(e.type || ""),
    orderId: String(e.orderId || ""),
    locked: !!e.locked,
    pending: !!e.pending,
  }));
}

export function computeWalletLedger(entries: Entry[], now = Date.now()): Ledger {
  const sorted = [...entries].filter((e) => e.date && e.amount).sort((a, b) => a.date.getTime() - b.date.getTime());
  const credits: { date: Date; remaining: number; expires: Date; h: Txn }[] = [];
  const history: Txn[] = [];
  for (const e of sorted) {
    if (e.amount > 0) {
      const expires = new Date(e.date.getTime() + WALLET_TTL_DAYS * DAY);
      const h: Txn = { date: e.date, amount: e.amount, type: "credit", reason: e.reason, orderId: e.orderId, locked: e.locked, expires };
      history.push(h);
      if (!e.locked) credits.push({ date: e.date, remaining: e.amount, expires, h });
    } else {
      history.push({ date: e.date, amount: e.amount, type: "debit", reason: e.reason, orderId: e.orderId, pending: e.pending });
      if (e.pending) continue; // unconfirmed order spend doesn't reduce the balance yet
      let need = -e.amount;
      for (const c of credits) {
        if (need <= 0) break;
        if (c.remaining <= 0 || c.expires < e.date) continue;
        const take = Math.min(c.remaining, need);
        c.remaining -= take;
        need -= take;
      }
    }
  }
  let balance = 0,
    expiringSoon = 0,
    expiredTotal = 0;
  let expiringDate: Date | null = null;
  for (const c of credits) {
    c.h.remaining = Math.max(0, Math.round(c.remaining));
    c.h.expired = c.expires.getTime() <= now;
    c.h.expiredAmount = c.h.expired ? c.h.remaining : 0;
    if (c.remaining <= 0) continue;
    if (c.expires.getTime() <= now) {
      expiredTotal += c.remaining;
      continue;
    }
    balance += c.remaining;
    if (c.expires.getTime() - now <= WALLET_EXPIRY_WARN_DAYS * DAY) {
      expiringSoon += c.remaining;
      if (!expiringDate || c.expires < expiringDate) expiringDate = c.expires;
    }
  }
  return { balance: Math.max(0, Math.round(balance)), history: history.reverse(), expiringSoon: Math.round(expiringSoon), expiringDate, expiredTotal: Math.round(expiredTotal) };
}

export const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (d: Date) => `${fmtDate(d)}, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
