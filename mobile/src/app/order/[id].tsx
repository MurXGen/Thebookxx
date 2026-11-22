import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { Appear } from "@/components/motion";
import { confetti } from "@/lib/confetti";
import { Garland, isXmas, Snow, XmasTree } from "@/components/Xmas";

import { fetchOrder, fmtOrderDate, parseBooks, statusInfo, STEPS, type OrderRow } from "@/lib/orders";
import { useStore } from "@/lib/store";
import { C, rupee, WHATSAPP } from "@/theme";

const TONE = { green: C.green, blue: "#2563EB", amber: "#D97706", red: C.red };

export default function OrderDetail() {
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const { profile, catalog } = useStore();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(() => !!profile.phone);
  const [tries, setTries] = useState(0);

  const load = useCallback(async () => {
    if (!id || !profile.phone) return;
    try {
      setOrder(await fetchOrder(id, profile.phone));
    } catch {}
    setLoading(false);
  }, [id, profile.phone]);

  useEffect(() => {
    if (!id || !profile.phone) return;
    let live = true;
    fetchOrder(id, profile.phone)
      .then((o) => live && setOrder(o))
      .catch(() => {})
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, profile.phone]);

  // Celebrate a freshly placed order (website's success card does the same).
  useEffect(() => {
    if (placed === "1") setTimeout(() => confetti(true), 250);
  }, [placed]);

  // A just-placed order can take a few seconds to show up in the sheet.
  useEffect(() => {
    if (order || tries >= 8 || !placed) return;
    const t = setTimeout(() => {
      setTries((n) => n + 1);
      load();
    }, 4000);
    return () => clearTimeout(t);
  }, [order, tries, placed, load]);

  const items = useMemo(() => parseBooks(order?.["Books List"] || ""), [order]);
  const cover = (name: string) => catalog.books.find((b) => b.name === name)?.image;
  const st = order ? statusInfo(order) : null;
  const n = (k: string) => Math.round(Number(order?.[k]) || 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Stack.Screen options={{ title: "Order details" }} />
      {placed ? (
        <Animated.View entering={ZoomIn.springify().damping(14)} style={[s.placed, placed === "pending" && { backgroundColor: "#FFF7E6" }]}>
          {isXmas() ? (
            <>
              <Snow count={16} ink />
              <View style={{ position: "absolute", left: 10, bottom: 8 }}><XmasTree size={54} gifts={false} /></View>
              <View style={{ position: "absolute", right: 10, bottom: 8 }}><XmasTree size={64} /></View>
              <Garland style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
            </>
          ) : null}
          <View style={[s.tick, isXmas() && { marginTop: 26 }, placed === "pending" && { backgroundColor: "#D97706" }]}>
            <Ionicons name={placed === "pending" ? "time" : "checkmark"} size={30} color="#fff" />
          </View>
          <Text style={s.placedH}>{placed === "pending" ? "Order placed — verifying payment" : "Order placed! 🎉"}</Text>
          <Text style={s.placedSub}>
            {placed === "pending" ? "We’ll confirm your UPI payment shortly and update you." : "Thank you for shopping with TheBookX. We’ll keep you posted."}
          </Text>
        </Animated.View>
      ) : null}

      <View style={s.card}>
        <Text style={s.oid}>Order #{id}</Text>
        {order ? <Text style={s.meta}>{fmtOrderDate(order)} · {order["Payment Type"]}</Text> : null}
        {st ? (
          <>
            <View style={[s.pill, { backgroundColor: TONE[st.tone] + "18" }]}>
              <Text style={[s.pillTxt, { color: TONE[st.tone] }]}>{st.label}</Text>
            </View>
            {st.step >= 0 ? (
              <View style={s.timeline}>
                {STEPS.map((label, i) => {
                  const done = i <= st.step;
                  return (
                    <Animated.View key={label} entering={FadeInDown.delay(i * 80)} style={s.step}>
                      <View style={{ alignItems: "center" }}>
                        <View style={[s.dot, done && { backgroundColor: C.green, borderColor: C.green }]}>
                          {done ? <Ionicons name="checkmark" size={11} color="#fff" /> : null}
                        </View>
                        {i < STEPS.length - 1 ? <View style={[s.vline, i < st.step && { backgroundColor: C.green }]} /> : null}
                      </View>
                      <Text style={[s.stepTxt, done && { color: C.ink, fontWeight: "700" }]}>{label}</Text>
                    </Animated.View>
                  );
                })}
              </View>
            ) : null}
            {order?.["Shipping ID"] ? (
              <Pressable onPress={() => Linking.openURL("https://www.indiapost.gov.in/")} style={s.track}>
                <Ionicons name="navigate-outline" size={16} color={C.ink} />
                <Text style={s.trackTxt}>Tracking ID: <Text selectable style={{ fontWeight: "700" }}>{order["Shipping ID"]}</Text></Text>
              </Pressable>
            ) : null}
          </>
        ) : loading || (placed && tries < 8) ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color={C.ink} />
            {placed ? <Text style={[s.meta, { textAlign: "center", marginTop: 8 }]}>Fetching your order details…</Text> : null}
          </View>
        ) : (
          <Text style={[s.meta, { marginTop: 10 }]}>We couldn’t load this order. Pull down to retry.</Text>
        )}
      </View>

      {items.length ? (
        <Appear>
          <View style={s.card}>
            <Text style={s.h}>Items</Text>
            {items.map((it, i) => (
              <View key={i} style={s.item}>
                {cover(it.name) ? <Image alt="" source={cover(it.name)} style={s.thumb} contentFit="cover" /> : <View style={[s.thumb, { alignItems: "center", justifyContent: "center" }]}><Ionicons name="book" size={18} color={C.muted} /></View>}
                <View style={{ flex: 1 }}>
                  <Text style={s.itemName} numberOfLines={2}>{it.name}</Text>
                  <Text style={s.meta}>Qty {it.qty} · {rupee(it.price)} each</Text>
                </View>
                <Text style={s.itemPrice}>{rupee(it.price * it.qty)}</Text>
              </View>
            ))}
          </View>
        </Appear>
      ) : null}

      {order ? (
        <Appear delay={80}>
          <View style={s.card}>
            <Text style={s.h}>Bill</Text>
            {n("Total MRP") ? <Line k="Item total (MRP)" v={rupee(n("Total MRP"))} /> : null}
            {n("Item Discount") ? <Line k="Discount" v={`− ${rupee(n("Item Discount"))}`} green /> : null}
            {n("Offer Discount") ? <Line k="Offer" v={`− ${rupee(n("Offer Discount"))}`} green /> : null}
            <Line k="Delivery" v={n("Delivery Charge") ? rupee(n("Delivery Charge")) : "FREE"} green={!n("Delivery Charge")} />
            {n("COD Fee") ? <Line k="COD fee" v={rupee(n("COD Fee"))} /> : null}
            <View style={s.hr} />
            <Line k="Total" v={rupee(n("Total Amount"))} bold />
          </View>
          <View style={s.card}>
            <Text style={s.h}>Delivering to</Text>
            <Text style={s.addrName}>{order["Customer Name"]} · {order["Phone Number"]}</Text>
            <Text style={s.addr}>{[order.Address, order.City, order.State, order.Pincode].filter(Boolean).join(", ")}</Text>
          </View>
        </Appear>
      ) : null}

      <View style={s.actions}>
        <Pressable
          onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi TheBookX, I need help with order ${id}`)}`)}
          style={s.action}
        >
          <Ionicons name="logo-whatsapp" size={18} color={C.green} />
          <Text style={s.actionTxt}>Need help?</Text>
        </Pressable>
        <Pressable onPress={() => router.navigate("/")} style={s.action}>
          <Ionicons name="book-outline" size={18} color={C.ink} />
          <Text style={s.actionTxt}>Keep shopping</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Line({ k, v, green, bold }: { k: string; v: string; green?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 9 }}>
      <Text style={{ color: bold ? C.ink : C.ink2, fontWeight: bold ? "700" : "400", fontSize: bold ? 16 : 14 }}>{k}</Text>
      <Text style={{ color: green ? C.green : C.ink, fontWeight: bold ? "700" : "600", fontSize: bold ? 16 : 14 }}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  placed: { margin: 12, marginBottom: 0, borderRadius: 16, backgroundColor: C.greenSoft, padding: 20, paddingBottom: 26, alignItems: "center", overflow: "hidden" },
  tick: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  placedH: { fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 10, textAlign: "center" },
  placedSub: { color: C.ink2, textAlign: "center", marginTop: 4, fontSize: 13 },
  card: { backgroundColor: "#fff", marginTop: 10, padding: 16 },
  oid: { fontSize: 16, fontWeight: "700", color: C.ink },
  meta: { fontSize: 12.5, color: C.muted, marginTop: 3 },
  pill: { alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillTxt: { fontSize: 12, fontWeight: "700" },
  timeline: { marginTop: 14 },
  step: { flexDirection: "row", gap: 12 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#D4D4DA", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  vline: { width: 2, height: 18, backgroundColor: "#E6E6EC" },
  stepTxt: { fontSize: 13.5, color: C.muted, marginTop: 1 },
  track: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: C.bg },
  trackTxt: { fontSize: 13, color: C.ink2 },
  h: { fontSize: 15, fontWeight: "700", color: C.ink, marginBottom: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  thumb: { width: 40, height: 56, borderRadius: 4, backgroundColor: C.bg },
  itemName: { fontSize: 13.5, color: C.ink, fontWeight: "500" },
  itemPrice: { fontSize: 14, fontWeight: "700", color: C.ink },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginTop: 12 },
  addrName: { fontSize: 14, fontWeight: "600", color: C.ink, marginTop: 4 },
  addr: { fontSize: 13, color: C.ink2, marginTop: 3, lineHeight: 19 },
  actions: { flexDirection: "row", gap: 10, padding: 16 },
  action: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#fff", borderRadius: 12, height: 46, borderWidth: 1, borderColor: C.line },
  actionTxt: { fontWeight: "600", color: C.ink },
});
