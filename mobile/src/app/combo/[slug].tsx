import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Price, Rating } from "@/components/BookCard";
import { PressScale } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { comboBooks, comboPricing } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C, rupee } from "@/theme";

export default function ComboScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { combos, byId, cart, addCombo } = useStore();
  const c = combos.find((x) => x.slug === slug);
  if (!c)
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: "Combo" }} />
        <Text style={{ color: C.muted }}>This combo isn’t available right now.</Text>
      </View>
    );
  const books = comboBooks(c, byId);
  const p = comboPricing(c, byId);
  const inBag = c.bookIds.every((id) => cart.some((l) => l.id === id));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: c.category || "Combo" }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.hero}>
          <View style={s.fan}>
            {books.map((b, i) => (
              <Animated.View key={b.id} entering={FadeInDown.delay(i * 80).springify()} style={{ marginLeft: i ? -26 : 0, zIndex: books.length - i, transform: [{ rotate: `${(i - (books.length - 1) / 2) * 6}deg` }] }}>
                <Image alt="" source={b.image} style={s.cover} contentFit="cover" />
              </Animated.View>
            ))}
          </View>
          <Text style={s.title}>{c.title}</Text>
          {c.tagline ? <Text style={s.tagline}>{c.tagline}</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 12 }}>
            <Text style={s.price}>{rupee(p.price)}</Text>
            {p.mrp > p.price ? <Text style={s.mrp}>{rupee(p.mrp)}</Text> : null}
            {p.savings ? <Text style={s.save}>Save {rupee(p.savings)}</Text> : null}
          </View>
          {c.pct ? <Text style={s.note}>{c.pct}% off is applied automatically when both books are in your bag.</Text> : null}
        </View>
        <Text style={s.h}>In this combo</Text>
        {books.map((b) => (
          <Pressable key={b.id} onPress={() => router.push(`/book/${b.id}`)} style={s.row}>
            <Image alt="" source={b.image} style={s.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={2}>{b.name}</Text>
              <Text style={s.author}>{b.author}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Price b={b} />
                <Rating b={b} />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B5B5BD" />
          </Pressable>
        ))}
      </ScrollView>
      <View style={[s.bar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.barPrice}>{rupee(p.price)}</Text>
          <Text style={s.barSub}>{books.length} books</Text>
        </View>
        <PressScale
          onPress={() => {
            if (inBag) return router.navigate("/bag");
            const r = addCombo(c);
            if (r.added) toast(c.title, { title: "Combo added to your bag", kind: "success", image: books[0]?.image });
            else toast(r.reason || "Couldn’t add", { kind: "info" });
          }}
          style={s.btn}
        >
          <Text style={s.btnTxt}>{inBag ? "Go to bag" : "Add combo to bag"}</Text>
        </PressScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: "#fff", alignItems: "center", padding: 20, paddingTop: 26 },
  fan: { flexDirection: "row", marginBottom: 18 },
  cover: { width: 100, height: 146, borderRadius: 8, borderWidth: 3, borderColor: "#fff", backgroundColor: C.bg },
  title: { fontSize: 20, fontWeight: "700", color: C.ink, textAlign: "center" },
  tagline: { fontSize: 13, color: C.muted, textAlign: "center", marginTop: 4, lineHeight: 19 },
  price: { fontSize: 24, fontWeight: "700", color: C.ink },
  mrp: { fontSize: 14, color: C.muted, textDecorationLine: "line-through" },
  save: { fontSize: 13, color: C.green, fontWeight: "600" },
  note: { marginTop: 8, fontSize: 12, color: C.ink2, backgroundColor: C.greenSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: "hidden", textAlign: "center" },
  h: { fontSize: 15, fontWeight: "600", color: C.ink, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  thumb: { width: 52, height: 74, borderRadius: 5, backgroundColor: C.bg },
  name: { fontSize: 14, fontWeight: "600", color: C.ink },
  author: { fontSize: 12, color: C.muted, marginTop: 1 },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  barPrice: { fontSize: 18, fontWeight: "700", color: C.ink },
  barSub: { fontSize: 12, color: C.muted },
  btn: { backgroundColor: C.green, borderRadius: 12, height: 50, paddingHorizontal: 22, alignItems: "center", justifyContent: "center" },
  btnTxt: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
