// Port of the website's src/lib/deliveryEta.js — keep the two in sync.
import AsyncStorage from "@react-native-async-storage/async-storage";

type Addr = { state?: string; city?: string; district?: string; pincode?: string };
type Range = [number, number];

export const FAST_WINDOWS = { faster: [1, 6] as Range, standard: [5, 9] as Range };
export const SLOW_WINDOWS = { faster: [3, 9] as Range, standard: [4, 12] as Range };

const STATE_RE = /gujarat|maharashtra|\bgoa\b|delhi/i;
const CITY_RE = /hyderabad|secunderabad|bengaluru|bangalore|delhi/i;
const PIN_RE = /^(3[6-9]|4[0-4]|110|500|560)\d+$/;

export function isFastRegion({ state, city, district, pincode }: Addr = {}) {
  if (STATE_RE.test(String(state || ""))) return true;
  if (CITY_RE.test(`${city || ""} ${district || ""}`)) return true;
  const pin = String(pincode || "").replace(/\D/g, "");
  return pin.length === 6 && PIN_RE.test(pin);
}

export const deliveryWindows = (a: Addr) => (isFastRegion(a) ? FAST_WINDOWS : SLOW_WINDOWS);

export const windowText = ([a, b]: Range) => `${a}–${b} days`;

// Website copy: bag add-ons (app/bag/page.js) and checkout options (AddressModal)
// show plain region windows, not the cutoff-adjusted day count.
export function bagWindows(a: Addr) {
  const pin = String(a.pincode || "");
  const win = deliveryWindows(a);
  const mh = /^4[0-4]/.test(pin) && !pin.startsWith("403");
  return { std: mh ? "1–5 days" : isFastRegion(a) ? "4–9 days" : windowText(win.standard), fast: windowText(win.faster) };
}
export function checkoutWindows(a: Addr) {
  const win = deliveryWindows(a);
  return { std: windowText(win.standard), fast: windowText(win.faster) };
}

export function etaRangeFor({ pincode = "", state = "", city = "", faster = false }: Addr & { faster?: boolean } = {}): Range {
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length !== 6 && !state && !city) return faster ? [1, 6] : [4, 9];
  const addr = { pincode: pin, state, city };
  const win = deliveryWindows(addr);
  if (faster) return win.faster;
  if (pin.length === 6 && /^4[0-4]/.test(pin) && !pin.startsWith("403")) return [1, 5];
  return isFastRegion(addr) ? [4, 9] : win.standard;
}

export const CUTOFF_HOUR = 12;
export const HOLIDAYS = new Set<string>([]);
const IST_OFFSET_MIN = 330;
const DAY = 86400000;
const toIst = (ms: number) => new Date(ms + IST_OFFSET_MIN * 60000);
const key = (d: Date) => d.toISOString().slice(0, 10);
const isWorkingDay = (d: Date) => d.getUTCDay() !== 0 && !HOLIDAYS.has(key(d));
const startOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const nextWorking = (d: Date) => {
  let x = d;
  while (!isWorkingDay(x)) x = new Date(x.getTime() + DAY);
  return x;
};

export function getDeliveryEta({ range = [4, 9] as Range, now = Date.now() } = {}) {
  const ist = toIst(now);
  const today = startOfDay(ist);
  const cutoff = today.getTime() + CUTOFF_HOUR * 3600000;
  const beforeCutoff = ist.getTime() < cutoff;
  const shipsToday = isWorkingDay(today) && beforeCutoff;
  const fastWindow = shipsToday && today.getUTCDay() !== 6;
  const extra = fastWindow ? 0 : 1;
  const days: Range = [range[0] + extra, range[1] + extra];
  return {
    days,
    shipsToday,
    msToCutoff: shipsToday ? cutoff - ist.getTime() : 0,
    from: nextWorking(new Date(today.getTime() + days[0] * DAY)),
    to: nextWorking(new Date(today.getTime() + days[1] * DAY)),
  };
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtEtaDate = (d: Date) => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`;
export function fmtEtaRange(from: Date, to: Date) {
  if (from.getUTCMonth() === to.getUTCMonth()) return `${WD[from.getUTCDay()]} ${from.getUTCDate()} – ${fmtEtaDate(to)}`;
  return `${fmtEtaDate(from)} – ${fmtEtaDate(to)}`;
}
export function fmtCountdown(ms: number) {
  const mins = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

// ── India Post pincode lookup (cached on the device) ─────────────────────────
export type PinInfo = { ok: boolean | null; city?: string; district?: string; area?: string; state?: string };
const CACHE_KEY = "tbx_pin_cache";
const mem = new Map<string, PinInfo>();
const inflight = new Map<string, Promise<PinInfo>>();

export async function lookupPincode(pin: string): Promise<PinInfo> {
  const p = String(pin || "");
  if (!/^\d{6}$/.test(p)) return { ok: false };
  if (mem.has(p)) return mem.get(p)!;
  try {
    const all = JSON.parse((await AsyncStorage.getItem(CACHE_KEY)) || "{}");
    if (all[p]) {
      mem.set(p, all[p]);
      return all[p];
    }
  } catch {}
  if (inflight.has(p)) return inflight.get(p)!;
  const req = fetch(`https://api.postalpincode.in/pincode/${p}`)
    .then((r) => r.json())
    .then(async (d) => {
      let entry: PinInfo;
      if (d?.[0]?.Status === "Success") {
        const po = d[0].PostOffice?.[0] || {};
        entry = { ok: true, city: po.District || "", district: po.District || "", area: po.Name || "", state: po.State || "" };
      } else entry = { ok: false };
      mem.set(p, entry);
      try {
        const all = JSON.parse((await AsyncStorage.getItem(CACHE_KEY)) || "{}");
        all[p] = entry;
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(all));
      } catch {}
      return entry;
    })
    .catch(() => ({ ok: null }) as PinInfo)
    .finally(() => inflight.delete(p));
  inflight.set(p, req);
  return req;
}
