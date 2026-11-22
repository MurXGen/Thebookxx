import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Text } from "@/components/ui-text";
import {
  BAG_EVERY_H,
  DEFAULT_PREFS,
  getPermission,
  loadPrefs,
  PICKS_EVERY_H,
  READING_TIMES,
  requestPermission,
  savePrefs,
  sendTestNotification,
  syncPrefsToServer,
  WISH_EVERY_H,
  type NotifPrefs,
  type PermState,
} from "@/lib/notifications";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C } from "@/theme";

type Key = Exclude<keyof NotifPrefs, "readingTime" | "enabled">;

// Allowing notifications switches every type on; readers can turn any off after.
const ALL_ON = { enabled: true, orders: true, whatsapp: true, bag: true, wishlist: true, picks: true, reading: true, quiet: true } as const;

export default function NotificationSettings() {
  const { deviceId, cartCount, wishlist } = useStore();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [perm, setPerm] = useState<PermState>("undetermined");
  const [loaded, setLoaded] = useState(false);
  const wantsEnable = useRef(false); // reader went to Android settings to allow

  const commit = (next: NotifPrefs) => {
    setPrefs(next);
    savePrefs(next); // re-plans reminders via onPrefsChange
    syncPrefsToServer(deviceId, next);
  };

  // Ask for permission; the master toggle only turns on once it's granted.
  const enable = async (current: NotifPrefs) => {
    let status = await getPermission();
    if (status !== "granted") {
      const r = await requestPermission();
      status = r.status;
      if (status !== "granted" && !r.canAskAgain) {
        Alert.alert(
          "Notifications are blocked",
          "Allow notifications for TheBookX in your phone's settings, then come back here.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Open settings",
              onPress: () => {
                wantsEnable.current = true;
                Linking.openSettings().catch(() => {});
              },
            },
          ],
        );
      }
    }
    setPerm(status);
    if (status === "granted") {
      commit({ ...current, ...ALL_ON });
      toast("Notifications on 🔔");
    } else {
      commit({ ...current, enabled: false });
    }
  };

  // First visit: show Android's "Allow notifications?" prompt straight away.
  useEffect(() => {
    (async () => {
      const [p, st] = await Promise.all([loadPrefs(), getPermission()]);
      setPerm(st);
      // Permission revoked from system settings → reflect it.
      const effective = st === "granted" ? p : { ...p, enabled: false };
      setPrefs(effective);
      setLoaded(true);
      if (st === "undetermined" && Platform.OS !== "web") enable(effective);
      else if (effective.enabled !== p.enabled) commit(effective);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back from Android settings: pick up the new permission.
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (s) => {
      if (s !== "active") return;
      const st = await getPermission();
      setPerm(st);
      const p = await loadPrefs();
      if (st === "granted" && wantsEnable.current) {
        wantsEnable.current = false;
        commit({ ...p, ...ALL_ON });
        toast("Notifications on 🔔");
      } else if (st !== "granted" && p.enabled) {
        commit({ ...p, enabled: false });
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const on = prefs.enabled && perm === "granted";
  const set = (k: Key, v: boolean) => commit({ ...prefs, [k]: v });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.master}>
        <View style={[s.bell, { backgroundColor: on ? C.ink : "#E2E2E8" }]}>
          <Ionicons name={on ? "notifications" : "notifications-off"} size={22} color={on ? "#fff" : C.muted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.masterH}>Allow notifications</Text>
          <Text style={s.masterSub}>
            {on ? "You're all set. Choose what you hear about below." : perm === "denied" ? "Blocked in phone settings. Turn on to allow." : "Turn on to get order updates and reminders."}
          </Text>
        </View>
        <Switch
          value={on}
          disabled={!loaded}
          onValueChange={(v) => (v ? enable(prefs) : commit({ ...prefs, enabled: false }))}
          trackColor={{ true: C.green, false: "#D4D4DA" }}
          thumbColor="#fff"
        />
      </View>

      {on ? (
        <View style={s.status}>
          <Ionicons name="time-outline" size={16} color={C.ink2} />
          <Text style={s.statusTxt}>
            {cartCount
              ? `Bag reminder every ${BAG_EVERY_H} h while ${cartCount} book${cartCount > 1 ? "s are" : " is"} in your bag`
              : wishlist.length
                ? `Wishlist reminder every ${WISH_EVERY_H} h for ${wishlist.length} saved book${wishlist.length > 1 ? "s" : ""}`
                : `Trending picks & ₹1 drops about every ${PICKS_EVERY_H} h`}
          </Text>
        </View>
      ) : null}

      <Group title="Orders" disabled={!on}>
        <Item icon="cube-outline" title="Order updates" sub="Confirmed, shipped, out for delivery, delivered" value={prefs.orders} onChange={(v) => set("orders", v)} disabled={!on} />
        <Item icon="logo-whatsapp" title="Also on WhatsApp" sub="Tracking link and delivery updates" value={prefs.whatsapp} onChange={(v) => set("whatsapp", v)} disabled={!on} />
      </Group>

      <Group title="Reminders" disabled={!on}>
        <Item icon="bag-handle-outline" title="Bag reminders" sub={`Every ${BAG_EVERY_H} hours while books are in your bag`} value={prefs.bag} onChange={(v) => set("bag", v)} disabled={!on} />
        <Item icon="heart-outline" title="Wishlist reminders" sub={`Every ${WISH_EVERY_H} hours while your wishlist has books`} value={prefs.wishlist} onChange={(v) => set("wishlist", v)} disabled={!on} />
        <Item icon="flame-outline" title="Picks for you" sub="Trending books & ₹1 drops when your bag and wishlist are empty" value={prefs.picks} onChange={(v) => set("picks", v)} disabled={!on} />
      </Group>

      <Group title="Reading" disabled={!on}>
        <Item icon="book-outline" title="Daily reading reminder" sub="A gentle nudge to read a few pages" value={prefs.reading} onChange={(v) => set("reading", v)} disabled={!on} />
        {prefs.reading && on ? (
          <View style={s.times}>
            {(Object.keys(READING_TIMES) as NotifPrefs["readingTime"][]).map((k) => (
              <Pressable key={k} onPress={() => commit({ ...prefs, readingTime: k })} style={[s.time, prefs.readingTime === k && s.timeOn]}>
                <Text style={[s.timeTxt, prefs.readingTime === k && { color: "#fff" }]}>{READING_TIMES[k].label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Group>

      <Group title="Do not disturb" disabled={!on}>
        <Item icon="moon-outline" title="Quiet hours" sub="Hold reminders between 10 PM and 8 AM" value={prefs.quiet} onChange={(v) => set("quiet", v)} disabled={!on} />
      </Group>

      {on ? (
        <Pressable
          onPress={async () => toast((await sendTestNotification()) ? "Test sent — check your notifications" : "Allow notifications first")}
          style={s.test}
        >
          <Ionicons name="paper-plane-outline" size={17} color={C.ink} />
          <Text style={s.testTxt}>Send a test notification</Text>
        </Pressable>
      ) : null}

      <Text style={s.foot}>
        You can also mute a single type (Order updates, Bag & wishlist reminders, Picks & offers) from Android Settings → Apps → TheBookX → Notifications.
      </Text>
    </ScrollView>
  );
}

function Group({ title, children, disabled }: { title: string; children: ReactNode; disabled?: boolean }) {
  return (
    <View style={{ marginTop: 18, opacity: disabled ? 0.5 : 1 }}>
      <Text style={s.groupH}>{title}</Text>
      <View style={s.group}>{children}</View>
    </View>
  );
}

function Item({ icon, title, sub, value, onChange, disabled }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={s.item}>
      <Ionicons name={icon} size={20} color={C.ink2} />
      <View style={{ flex: 1 }}>
        <Text style={s.itemH}>{title}</Text>
        <Text style={s.itemSub}>{sub}</Text>
      </View>
      <Switch value={!disabled && value} disabled={disabled} onValueChange={onChange} trackColor={{ true: C.green, false: "#D4D4DA" }} thumbColor="#fff" />
    </View>
  );
}

const s = StyleSheet.create({
  master: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", padding: 16 },
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  masterH: { fontSize: 16, fontWeight: "800", color: C.ink },
  masterSub: { fontSize: 12.5, color: C.muted, marginTop: 2 },
  status: { flexDirection: "row", gap: 8, alignItems: "center", marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: C.greenSoft },
  statusTxt: { flex: 1, color: C.ink2, fontSize: 12.5, fontWeight: "600" },
  groupH: { fontSize: 12, fontWeight: "800", color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, paddingHorizontal: 16, marginBottom: 8 },
  group: { backgroundColor: "#fff" },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  itemH: { fontSize: 15, fontWeight: "700", color: C.ink },
  itemSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  times: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, paddingLeft: 50 },
  time: { borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  timeOn: { backgroundColor: C.ink, borderColor: C.ink },
  timeTxt: { fontSize: 13, fontWeight: "700", color: C.ink2 },
  test: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", margin: 16, marginTop: 22, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.ink, backgroundColor: "#fff" },
  testTxt: { fontWeight: "800", color: C.ink },
  foot: { paddingHorizontal: 16, color: C.muted, fontSize: 12, lineHeight: 17 },
});
