import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { PressScale } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { comboBooks, comboPricing, type Combo } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C, rupee } from "@/theme";

// Fanned covers + price + one-tap "Add combo".
function ComboCardInner({ c, width = 260 }: { c: Combo; width?: number }) {
  const { byId, cart, addCombo } = useStore();
  const books = comboBooks(c, byId);
  const p = comboPricing(c, byId);
  const inBag = c.bookIds.every((id) => cart.some((l) => l.id === id));
  const n = books.length;
  const coverW = n > 2 ? 62 : 74;
  const step = n > 2 ? 40 : 54;
  const fanW = coverW + step * (n - 1);
  return (
    <PressScale scaleTo={0.97} onPress={() => router.push({ pathname: "/combo/[slug]", params: { slug: c.slug } })} style={[s.card, { width }]}>
      <View style={s.stage}>
        <View style={{ width: fanW, height: coverW * 1.45 }}>
          {books.map((b, i) => (
            <Image
              key={b.id}
              alt=""
              source={b.image}
              contentFit="cover"
              style={[s.cover, { width: coverW, height: coverW * 1.45, left: i * step, zIndex: n - i, transform: [{ rotate: `${(i - (n - 1) / 2) * 5}deg` }] }]}
            />
          ))}
        </View>
        <View style={s.tag}>
          <Text style={s.tagTxt}>{c.pct ? `${c.pct}% OFF` : `${n} BOOKS`}</Text>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text style={s.title} numberOfLines={2}>{c.title}</Text>
        <Text style={s.sub} numberOfLines={1}>{n} books · {c.category}</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <Text style={s.price}>{rupee(p.price)}</Text>
              {p.mrp > p.price ? <Text style={s.mrp}>{rupee(p.mrp)}</Text> : null}
            </View>
            {p.savings ? <Text style={s.save}>Save {rupee(p.savings)}</Text> : null}
          </View>
          <PressScale
            scaleTo={0.92}
            onPress={() => {
              const r = addCombo(c);
              if (r.added) toast(c.title, { title: "Combo added to your bag", kind: "success", image: books[0]?.image });
              else toast(r.reason || "Couldn’t add", { kind: "info" });
            }}
            style={[s.btn, inBag && s.btnIn]}
          >
            {inBag ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Ionicons name="add" size={14} color={C.green} />}
            <Text style={[s.btnTxt, inBag && { color: "#fff" }]}>{inBag ? "In bag" : "Add"}</Text>
          </PressScale>
        </View>
      </View>
    </PressScale>
  );
}
export const ComboCard = memo(ComboCardInner);

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: "hidden" },
  stage: { height: 140, backgroundColor: "#F3F1EC", alignItems: "center", justifyContent: "center" },
  cover: { position: "absolute", top: 0, borderRadius: 6, borderWidth: 2, borderColor: "#fff", backgroundColor: "#ddd" },
  tag: { position: "absolute", top: 10, left: 10, backgroundColor: C.ink, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  tagTxt: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
  title: { fontSize: 14, fontWeight: "600", color: C.ink, lineHeight: 19 },
  sub: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "flex-end", marginTop: 10 },
  price: { fontSize: 16, fontWeight: "700", color: C.ink },
  mrp: { fontSize: 12, color: C.muted, textDecorationLine: "line-through" },
  save: { fontSize: 11.5, color: C.green, fontWeight: "600" },
  btn: { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1, borderColor: "#D7EBDF", borderRadius: 9, paddingHorizontal: 12, height: 32, backgroundColor: "#fff" },
  btnIn: { backgroundColor: C.green, borderColor: C.green },
  btnTxt: { fontSize: 13, fontWeight: "700", color: C.green },
});
