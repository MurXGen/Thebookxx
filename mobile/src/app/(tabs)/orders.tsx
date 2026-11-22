import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressScale } from "@/components/motion";
import PhoneGate from "@/components/PhoneGate";
import { fetchOrders, fmtOrderDate, parseBooks, statusInfo, type OrderRow } from "@/lib/orders";
import { useStore } from "@/lib/store";
import { C, rupee } from "@/theme";

const TONE = { green: C.green, blue: "#2563EB", amber: "#D97706", red: C.red };

export default function Orders() {
  const insets = useSafeAreaInsets();
  const { profile, catalog } = useStore();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile.phone) return;
    setError(false);
    try {
      setOrders(await fetchOrders(profile.phone));
    } catch {
      setError(true);
    }
  }, [profile.phone]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const cover = (name: string) => catalog.books.find((b) => b.name === name)?.image;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}>
        <Text style={s.h1}>Your orders</Text>
        {profile.phone ? <Text style={s.sub}>+91 {profile.phone}</Text> : <Text style={s.sub}>Track, return or reorder</Text>}
      </View>
      {!profile.phone ? (
        <PhoneGate />
      ) : orders === null && !error ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={C.ink} />
      ) : (
        <FlatList
          data={orders || []}
          keyExtractor={(o) => String(o["Order ID"])}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name={error ? "cloud-offline-outline" : "cube-outline"} size={52} color="#C9C9D0" />
              <Text style={s.emptyH}>{error ? "Couldn’t load your orders" : "No orders yet"}</Text>
              <Text style={s.emptySub}>{error ? "Pull down to try again." : "When you place an order, it shows up here."}</Text>
              {!error ? (
                <Pressable onPress={() => router.navigate("/")} style={s.emptyBtn}>
                  <Text style={s.emptyBtnTxt}>Start shopping</Text>
                </Pressable>
              ) : null}
            </View>
          }
          renderItem={({ item, index }) => {
            const st = statusInfo(item);
            const books = parseBooks(item["Books List"]);
            const id = String(item["Order ID"]);
            return (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 60).springify().damping(18)}>
                <PressScale scaleTo={0.98} onPress={() => router.push({ pathname: "/order/[id]", params: { id } })} style={s.card}>
                  <View style={s.top}>
                    <View style={[s.pill, { backgroundColor: TONE[st.tone] + "18" }]}>
                      <Text style={[s.pillTxt, { color: TONE[st.tone] }]}>{st.label}</Text>
                    </View>
                    <Text style={s.date}>{fmtOrderDate(item)}</Text>
                  </View>
                  <View style={s.row}>
                    <View style={s.covers}>
                      {books.slice(0, 3).map((b, i) => (
                        <View key={i} style={[s.cover, { marginLeft: i ? -18 : 0, zIndex: 3 - i }]}>
                          {cover(b.name) ? <Image alt="" source={cover(b.name)} style={{ flex: 1 }} contentFit="cover" /> : <Ionicons name="book" size={16} color={C.muted} />}
                        </View>
                      ))}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={2} style={s.names}>{books.map((b) => b.name).join(", ")}</Text>
                      <Text style={s.meta}>{books.reduce((n, b) => n + b.qty, 0)} item(s) · {rupee(Number(item["Total Amount"]) || 0)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#B5B5BD" />
                  </View>
                </PressScale>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  head: { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12 },
  h1: { fontSize: 24, fontWeight: "700", color: C.ink },
  sub: { color: C.muted, marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillTxt: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 12, color: C.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  covers: { flexDirection: "row", width: 84 },
  cover: { width: 44, height: 62, borderRadius: 5, overflow: "hidden", backgroundColor: C.bg, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  names: { fontSize: 13.5, fontWeight: "600", color: C.ink },
  meta: { fontSize: 12, color: C.muted, marginTop: 3 },
  empty: { alignItems: "center", padding: 40 },
  emptyH: { fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 12 },
  emptySub: { color: C.muted, marginTop: 4, textAlign: "center" },
  emptyBtn: { marginTop: 16, backgroundColor: C.ink, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12 },
  emptyBtnTxt: { color: "#fff", fontWeight: "700" },
});
