import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { API } from "@/theme";

// ── Preferences ─────────────────────────────────────────────────────────────
// `enabled` is the master switch. It only turns on once Android's notification
// permission is granted (Settings → Notification preferences).
export type NotifPrefs = {
  enabled: boolean;
  bag: boolean; // every 4 h while books are in the bag
  wishlist: boolean; // every 6 h while the wishlist has books
  picks: boolean; // when bag + wishlist are empty: trending / ₹1 / new picks
  orders: boolean; // shipped / out for delivery / delivered (server push)
  whatsapp: boolean; // order updates on WhatsApp too
  reading: boolean; // daily reading reminder
  readingTime: "morning" | "evening" | "night";
  quiet: boolean; // hold reminders between 10 PM and 8 AM
};

export const DEFAULT_PREFS: NotifPrefs = {
  enabled: false,
  bag: true,
  wishlist: true,
  picks: true,
  orders: true,
  whatsapp: true,
  reading: false,
  readingTime: "evening",
  quiet: true,
};

export const BAG_EVERY_H = 4;
export const WISH_EVERY_H = 6;
export const PICKS_EVERY_H = 8;

export const READING_TIMES: Record<NotifPrefs["readingTime"], { label: string; hour: number; minute: number }> = {
  morning: { label: "8:00 AM", hour: 8, minute: 0 },
  evening: { label: "8:00 PM", hour: 20, minute: 0 },
  night: { label: "10:00 PM", hour: 22, minute: 0 },
};

const PREFS_KEY = "tbx_notif_prefs_v2";
const ENG_PREFIX = "tbx-eng-";
const READING_ID = "tbx-reading";
const isNative = Platform.OS !== "web";

// Lets screens re-run scheduling right after prefs change.
const prefListeners = new Set<(p: NotifPrefs) => void>();
export const onPrefsChange = (l: (p: NotifPrefs) => void) => {
  prefListeners.add(l);
  return () => {
    prefListeners.delete(l);
  };
};

export async function loadPrefs(): Promise<NotifPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePrefs(p: NotifPrefs) {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p)).catch(() => {});
  prefListeners.forEach((l) => l(p));
}

// ── Setup & permission ─────────────────────────────────────────────────────
export function initNotifications() {
  if (!isNative) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === "android") {
    // Separate channels so readers can also mute one type from Android settings.
    const ch = (id: string, name: string, importance: Notifications.AndroidImportance) =>
      Notifications.setNotificationChannelAsync(id, { name, importance, lightColor: "#000000" }).catch(() => {});
    ch("orders", "Order updates", Notifications.AndroidImportance.HIGH);
    ch("reminders", "Bag & wishlist reminders", Notifications.AndroidImportance.DEFAULT);
    ch("offers", "Picks & offers", Notifications.AndroidImportance.DEFAULT);
  }
}

export type PermState = "granted" | "denied" | "undetermined";

export async function getPermission(): Promise<PermState> {
  if (!isNative) return "denied";
  try {
    return (await Notifications.getPermissionsAsync()).status as PermState;
  } catch {
    return "undetermined";
  }
}

// Shows Android's "Allow notifications?" dialog (once; after a denial Android
// stops showing it and the reader must allow it from system settings).
export async function requestPermission(): Promise<{ status: PermState; canAskAgain: boolean }> {
  if (!isNative) return { status: "denied", canAskAgain: false };
  try {
    const r = await Notifications.requestPermissionsAsync();
    return { status: r.status as PermState, canAskAgain: r.canAskAgain };
  } catch {
    return { status: "denied", canAskAgain: false };
  }
}

// ── Engagement reminders ───────────────────────────────────────────────────
// Rather than one fixed repeating alarm, we lay out the next ~2 days of
// reminders as individual notifications. That lets each one name a real book,
// skip quiet hours, and get re-planned whenever the bag or wishlist changes.
export type MiniBook = { id: string; name: string; price: number };
export type EngagementInput = { cart: MiniBook[]; wishlist: MiniBook[]; picks: MiniBook[]; oneRupee: MiniBook[] };

const HOUR = 3600 * 1000;
const inQuiet = (d: Date) => d.getHours() >= 22 || d.getHours() < 8;
const pushOutOfQuiet = (d: Date) => {
  if (!inQuiet(d)) return d;
  const n = new Date(d);
  if (n.getHours() >= 22) n.setDate(n.getDate() + 1);
  n.setHours(9, 0, 0, 0);
  return n;
};

function slots(everyH: number, count: number, quiet: boolean) {
  const out: Date[] = [];
  let t = Date.now();
  while (out.length < count) {
    t += everyH * HOUR;
    let d = new Date(t);
    if (quiet) d = pushOutOfQuiet(d);
    if (out.length && d.getTime() - out[out.length - 1].getTime() < HOUR) continue; // collapsed by quiet hours
    out.push(d);
    t = d.getTime();
  }
  return out;
}

type Msg = { title: string; body: string; url: string; channel: string };

function bagMsgs(cart: MiniBook[]): Msg[] {
  const first = cart[0];
  const n = cart.length;
  const more = n > 1 ? ` and ${n - 1} more` : "";
  return [
    { title: "Your books are waiting 🛍️", body: `“${first.name}”${more} ${n > 1 ? "are" : "is"} still in your bag.`, url: "/bag", channel: "reminders" },
    { title: "Stock is moving fast ⏳", body: `Checkout “${first.name}” before it sells out. Cash on Delivery available.`, url: "/bag", channel: "reminders" },
    { title: "Finish your order in 1 minute", body: `${n} book${n > 1 ? "s" : ""} in your bag. Tap to checkout.`, url: "/bag", channel: "reminders" },
  ];
}

function wishMsgs(wish: MiniBook[]): Msg[] {
  return wish.slice(0, 6).map((b, i) => ({
    title: i % 2 ? "Still thinking about it? 💭" : "From your wishlist ❤️",
    body: `“${b.name}” is ₹${b.price} right now. Add it to your bag.`,
    url: `/book/${b.id}`,
    channel: "reminders",
  }));
}

function pickMsgs(picks: MiniBook[], oneRupee: MiniBook[]): Msg[] {
  const out: Msg[] = [];
  picks.slice(0, 4).forEach((b, i) => {
    out.push({ title: i ? "Readers are loving this 📈" : "Trending on TheBookX 🔥", body: `“${b.name}” for ₹${b.price}. Tap to take a look.`, url: `/book/${b.id}`, channel: "offers" });
    if (i === 0 && oneRupee.length) {
      out.push({ title: "Books at ₹1 🔓", body: `“${oneRupee[0].name}” is ₹1 right now — one per order. Grab it before it’s gone.`, url: "/category/one-rupee", channel: "offers" });
    }
  });
  return out;
}

async function cancelEngagement() {
  const all = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(ENG_PREFIX) || n.identifier === READING_ID)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
  );
}

async function scheduleAt(id: string, when: Date, m: Msg) {
  const seconds = Math.max(60, Math.round((when.getTime() - Date.now()) / 1000));
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title: m.title, body: m.body, data: { url: m.url } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: m.channel },
  }).catch(() => {});
}

// Re-plans every reminder from scratch. Safe to call often.
export async function planNotifications(p: NotifPrefs, input: EngagementInput) {
  if (!isNative) return;
  await cancelEngagement();
  if (!p.enabled || (await getPermission()) !== "granted") return;

  const hasCart = input.cart.length > 0;
  const hasWish = input.wishlist.length > 0;

  if (hasCart && p.bag) {
    const msgs = bagMsgs(input.cart);
    const at = slots(BAG_EVERY_H, 12, p.quiet); // next ~2 days
    await Promise.all(at.map((d, i) => scheduleAt(`${ENG_PREFIX}bag-${i}`, d, msgs[i % msgs.length])));
  }
  if (hasWish && p.wishlist) {
    const msgs = wishMsgs(input.wishlist);
    const at = slots(WISH_EVERY_H, 8, p.quiet);
    await Promise.all(at.map((d, i) => scheduleAt(`${ENG_PREFIX}wish-${i}`, d, msgs[i % msgs.length])));
  }
  if (!hasCart && !hasWish && p.picks && input.picks.length) {
    const msgs = pickMsgs(input.picks, input.oneRupee);
    const at = slots(PICKS_EVERY_H, 6, true);
    await Promise.all(at.map((d, i) => scheduleAt(`${ENG_PREFIX}pick-${i}`, d, msgs[i % msgs.length])));
  }
  if (p.reading) {
    const t = READING_TIMES[p.readingTime];
    await Notifications.scheduleNotificationAsync({
      identifier: READING_ID,
      content: { title: "📖 Time for a few pages", body: "Ten minutes of reading today keeps the streak alive.", data: { url: "/" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.hour, minute: t.minute, channelId: "reminders" },
    }).catch(() => {});
  }
}

export async function sendTestNotification() {
  if (!isNative || (await getPermission()) !== "granted") return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: "Notifications are on ✅", body: "You'll only hear from TheBookX about the things you picked.", data: { url: "/" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, channelId: "orders" },
  });
  return true;
}

// ── Server sync (order-update pushes need a push token = real APK build) ────
export async function getPushToken(): Promise<string | null> {
  if (!isNative || !Device.isDevice) return null;
  if (Constants.executionEnvironment === "storeClient") return null; // Expo Go has no remote push on Android
  const projectId =
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return null;
  }
}

export async function syncPrefsToServer(deviceId: string, p: NotifPrefs) {
  if (!deviceId) return;
  try {
    const pushToken = p.enabled ? await getPushToken() : null;
    await fetch(`${API}/api/app/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        pushToken,
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version || "",
        prefs: { ...p, orders: p.enabled && p.orders },
      }),
    });
  } catch {
    /* offline — the next change retries */
  }
}
