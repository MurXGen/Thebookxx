import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";
import { loadPrefs } from "@/lib/notifications";
import { fetchOrders, type OrderRow } from "@/lib/orders";
import { toast } from "@/lib/toast";

// India Post tracking for the reader's latest order.
// - When a parcel gets a consignment ID (or goes out for delivery) we post a
//   local notification. Checked on launch, on return to the app, and every
//   ~2 h in the background (Android WorkManager via expo-background-task).
// - Tapping it copies the ID and opens India Post, which has no deep link to a
//   single consignment — same approach as the website's order page.

export const INDIA_POST_TRACK_URL = "https://www.indiapost.gov.in/";
const TASK = "tbx-order-tracking";
const SEEN_KEY = "tbx_trk_seen";

// Real consignment IDs: ordinary "C…" / Speed Post "E…" (as on the website).
export const isPostId = (id: string) => /^[ce][a-z0-9]{6,}$/i.test(String(id || "").trim());

const shipId = (o: OrderRow) => String(o["Shipping ID"] || "").trim();
const isOutForDelivery = (o: OrderRow) => /out\s*for\s*delivery/i.test(`${o["Order Status"] || ""} ${o["Tracking detail"] || ""}`);
const isClosed = (o: OrderRow) => /\bdelivered\b|cancel|return/i.test(String(o["Order Status"] || ""));

/** Newest order that has an India Post ID and hasn't been delivered yet. */
export function latestTrackable(orders: OrderRow[]): OrderRow | null {
  return orders.find((o) => isPostId(shipId(o)) && !isClosed(o)) || null;
}

/** Copy the ID, say so, and open India Post's tracking site. */
export async function openTracking(id: string) {
  const clean = String(id).trim();
  try {
    await Clipboard.setStringAsync(clean);
    toast(`Paste ${clean} in “Track Consignment” on India Post`, { title: "Tracking ID copied", kind: "success" });
  } catch {}
  if (Platform.OS === "web") return Linking.openURL(INDIA_POST_TRACK_URL).catch(() => {});
  WebBrowser.openBrowserAsync(INDIA_POST_TRACK_URL, { toolbarColor: "#ffffff" }).catch(() => Linking.openURL(INDIA_POST_TRACK_URL).catch(() => {}));
}

async function readPhone(): Promise<string> {
  try {
    const p = JSON.parse((await AsyncStorage.getItem("tbx_profile")) || "{}");
    return String(p.phone || "").replace(/\D/g, "").slice(-10);
  } catch {
    return "";
  }
}

/** Notifies once per new tracking ID, and once more when it's out for delivery. */
export async function checkTracking(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const phone = await readPhone();
  if (phone.length !== 10) return false;
  const prefs = await loadPrefs();
  if (!prefs.enabled || !prefs.orders) return false;
  const perm = await Notifications.getPermissionsAsync().catch(() => null);
  if (!perm?.granted) return false;

  const o = latestTrackable(await fetchOrders(phone));
  if (!o) return false;
  const id = shipId(o);
  const ofd = isOutForDelivery(o);
  const key = `${id}:${ofd ? "ofd" : "shipped"}`;
  const seen: string[] = JSON.parse((await AsyncStorage.getItem(SEEN_KEY).catch(() => null)) || "[]");
  if (seen.includes(key)) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: ofd ? "🛵 Your books are out for delivery" : "📦 Your order has shipped",
      body: ofd
        ? `Keep your phone handy — the postman is on the way. Tap to track ${id} on India Post.`
        : `India Post tracking ID ${id}. Tap to copy it and track your parcel.`,
      data: { track: id, url: `/order/${o["Order ID"]}` },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1, channelId: "orders" },
  });
  await AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...seen, key].slice(-30))).catch(() => {});
  return true;
}

// Background check. Must be defined at module scope so Android can run it
// while the app is closed.
if (Platform.OS !== "web") {
  TaskManager.defineTask(TASK, async () => {
    try {
      await checkTracking();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function registerTrackingTask() {
  if (Platform.OS === "web") return;
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (!(await TaskManager.isTaskRegisteredAsync(TASK))) {
      await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 120 });
    }
  } catch {}
}
