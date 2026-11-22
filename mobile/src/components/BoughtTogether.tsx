import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { comboBooks, comboPricing, type Book, type Combo } from "@/lib/catalog";
import { confetti } from "@/lib/confetti";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C, rupee } from "@/theme";

// "Frequently bought together": the best 2-book combo with this book — both
// covers joined by "+", the combo price (10% off) and one tap to add both.
export default function BoughtTogether({ combo, book }: { combo: Combo; book: Book }) {
  const { byId, cart, addCombo } = useStore();
  const items = comboBooks(combo, byId).sort((a) => (a.id === book.id ? -1 : 1));
  const p = comboPricing(combo, byId);
  const inBag = combo.bookIds.every((id) => cart.some((l) => l.id === id));
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={s.card}>
      <View style={s.head}>
        <Ionicons name="sparkles" size={15} color={C.brandDark} />
        <Text style={s.h}>Frequently bought together</Text>
        {combo.pct ? (
          <View style={s.off}>
            <Text style={s.offTxt}>{combo.pct}% OFF</Text>
          </View>
        ) : null}
      </View>
      <View style={s.row}>
        {items.map((b, i) => (
          <View key={b.id} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {i ? (
              <View style={s.plus}>
                <Ionicons name="add" size={16} color={C.ink} />
              </View>
            ) : null}
            <Pressable onPress={() => b.id !== book.id && router.push(`/book/${b.id}`)} style={s.item}>
              <Image alt="" source={b.image} style={s.cover} contentFit="cover" />
              <Text style={s.name} numberOfLines={2}>{b.id === book.id ? "This book" : b.name}</Text>
              <Text style={s.price}>{rupee(b.price)}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={s.foot}>
        <View style={{ flex: 1 }}>
          <Text style={s.totK}>Total for both</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text style={s.tot}>{rupee(p.price)}</Text>
            {p.sum > p.price ? <Text style={s.was}>{rupee(p.sum)}</Text> : null}
          </View>
          {p.sum > p.price ? <Text style={s.save}>You save {rupee(p.sum - p.price)} together</Text> : null}
        </View>
        <PressScale
          onPress={() => {
            if (inBag) return router.navigate("/bag");
            const r = addCombo(combo);
            if (r.added) {
              confetti(false);
              toast(combo.pct ? `${combo.pct}% off applied in your bag` : `${r.added} books added`, { title: "Added both to your bag", kind: "success", image: items[1]?.image });
            } else toast(r.reason || "Couldn’t add", { kind: "info" });
          }}
          style={[s.btn, inBag && { backgroundColor: C.ink }]}
        >
          <Ionicons name={inBag ? "bag-check" : "bag-add"} size={16} color="#fff" />
          <Text style={s.btnTxt}>{inBag ? "In bag" : "Add both"}</Text>
        </PressScale>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", marginTop: 10, padding: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  h: { flex: 1, fontSize: 15.5, fontWeight: "600", color: C.ink },
  off: { backgroundColor: C.greenSoft, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  offTxt: { color: C.green, fontSize: 11, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "flex-start", marginTop: 14 },
  item: { flex: 1, alignItems: "center" },
  cover: { width: 92, height: 132, borderRadius: 8, backgroundColor: C.bg },
  name: { fontSize: 12, color: C.ink2, textAlign: "center", marginTop: 6, lineHeight: 16 },
  price: { fontSize: 13, fontWeight: "700", color: C.ink, marginTop: 2 },
  plus: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", marginTop: 50 },
  foot: { flexDirection: "row", alignItems: "center", marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  totK: { fontSize: 12, color: C.muted },
  tot: { fontSize: 20, fontWeight: "700", color: C.ink },
  was: { fontSize: 13, color: C.muted, textDecorationLine: "line-through" },
  save: { fontSize: 12, color: C.green, fontWeight: "600" },
  btn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.green, borderRadius: 12, height: 46, paddingHorizontal: 18 },
  btnTxt: { color: "#fff", fontWeight: "600", fontSize: 14.5 },
});
