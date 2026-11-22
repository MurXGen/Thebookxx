import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import { isOneRupee } from "@/lib/catalog";
import { loadPrefs, onPrefsChange, planNotifications, type EngagementInput, type NotifPrefs } from "@/lib/notifications";
import { useStore } from "@/lib/store";

// Keeps the scheduled reminders in step with the bag, wishlist and prefs:
// bag → every 4 h, wishlist → every 6 h, neither → trending picks.
export function useNotificationPlanner() {
  const { ready, cart, wishlist, byId, catalog } = useStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const input = useMemo<EngagementInput>(() => {
    const mini = (id: string) => {
      const b = byId.get(id);
      return b ? { id: b.id, name: b.name, price: b.price } : null;
    };
    const ok = <T,>(x: T | null): x is T => !!x;
    const pool = catalog.books.filter((b) => b.stock > 0);
    return {
      cart: cart.map((l) => mini(l.id)).filter(ok),
      wishlist: wishlist.map(mini).filter(ok),
      picks: pool.filter((b) => b.cats.includes("trending") && !isOneRupee(b)).slice(0, 8).map((b) => ({ id: b.id, name: b.name, price: b.price })),
      oneRupee: pool.filter(isOneRupee).slice(0, 3).map((b) => ({ id: b.id, name: b.name, price: b.price })),
    };
  }, [cart, wishlist, byId, catalog]);

  const latest = useRef(input);
  useEffect(() => {
    latest.current = input;
  }, [input]);

  useEffect(() => {
    if (!ready || Platform.OS === "web") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => planNotifications(await loadPrefs(), latest.current), 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ready, input]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const off = onPrefsChange((p: NotifPrefs) => planNotifications(p, latest.current));
    // Tapping a notification opens the screen it is about.
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const url = r.notification.request.content.data?.url;
      if (typeof url === "string" && url.startsWith("/")) router.push(url as never);
    });
    return () => {
      off();
      sub.remove();
    };
  }, []);
}
