import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressScale, Sheet } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { C, rupee } from "@/theme";

export type BillLines = {
  mrp: number;
  subtotal: number;
  flatDiscount: number;
  comboDiscount: number;
  delivery: number;
  faster: boolean;
  handling?: boolean; // "Handling & Care" band (orders above ₹1,000)
  gift?: number;
  bookmarks?: number;
  codFee?: number;
  coupon?: { code: string; off: number };
  total: number;
};

// The website's "View bill" sheet (src/components/UI/BillModal.jsx).
export default function BillSheet({ open, onClose, b, cta, onCta }: { open: boolean; onClose: () => void; b: BillLines; cta?: string; onCta?: () => void }) {
  const insets = useSafeAreaInsets();
  const itemDisc = Math.max(0, b.mrp - b.subtotal);
  const saving = itemDisc + b.flatDiscount + b.comboDiscount + (b.coupon?.off || 0);
  const rows: { k: string; v: string; green?: boolean; note?: string }[] = [
    { k: "Total MRP", v: rupee(b.mrp) },
    ...(itemDisc ? [{ k: "TheBookX discount", v: `− ${rupee(itemDisc)}`, green: true }] : []),
    ...(b.comboDiscount ? [{ k: "★ Combo discount (10%)", v: `− ${rupee(b.comboDiscount)}`, green: true }] : []),
    ...(b.flatDiscount ? [{ k: "Achievement discount", v: `− ${rupee(b.flatDiscount)}`, green: true }] : []),
    ...(b.coupon?.off ? [{ k: `Coupon (${b.coupon.code})`, v: `− ${rupee(b.coupon.off)}`, green: true }] : []),
    { k: b.handling ? "Handling & Care" : b.faster ? "Faster delivery" : "Delivery", v: b.delivery ? rupee(b.delivery) : "FREE", green: !b.delivery, note: b.handling ? "Careful packing for bigger orders" : undefined },
    ...(b.gift ? [{ k: "Gift wrap", v: rupee(b.gift) }] : []),
    ...(b.bookmarks ? [{ k: "Extra bookmarks", v: rupee(b.bookmarks) }] : []),
    ...(b.codFee ? [{ k: "Cash on Delivery fee", v: rupee(b.codFee) }] : []),
  ];
  return (
    <Sheet open={open} onClose={onClose} style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
      <View style={s.head}>
        <Ionicons name="receipt-outline" size={18} color={C.ink} />
        <Text style={s.h}>Bill details</Text>
        <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close bill">
          <Ionicons name="close" size={22} color={C.ink} />
        </Pressable>
      </View>
      {saving > 0 ? (
        <Animated.View entering={FadeInDown.springify()} style={s.save}>
          <Text style={s.saveTxt}>🎉 You’re saving {rupee(saving)} on this order</Text>
        </Animated.View>
      ) : null}
      <View style={s.card}>
        {rows.map((r, i) => (
          <Animated.View key={r.k} entering={FadeInDown.delay(i * 40)} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.k}>{r.k}</Text>
              {r.note ? <Text style={s.note}>{r.note}</Text> : null}
            </View>
            <Text style={[s.v, r.green && { color: C.green }]}>{r.v}</Text>
          </Animated.View>
        ))}
        <View style={s.hr} />
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.payK}>You pay</Text>
            <Text style={s.note}>Inclusive of all taxes</Text>
          </View>
          <Text style={s.payV}>{rupee(b.total)}</Text>
        </View>
      </View>
      {cta && onCta ? (
        <PressScale
          onPress={() => {
            onClose();
            onCta();
          }}
          style={s.cta}
        >
          <Text style={s.ctaTxt}>{cta}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </PressScale>
      ) : null}
    </Sheet>
  );
}

const s = StyleSheet.create({
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  h: { flex: 1, fontSize: 17, fontWeight: "700", color: C.ink },
  save: { marginTop: 14, backgroundColor: C.greenSoft, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  saveTxt: { color: C.green, fontWeight: "600", fontSize: 13.5 },
  card: { marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 14, gap: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  k: { fontSize: 14, color: C.ink2 },
  note: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  v: { fontSize: 14, fontWeight: "600", color: C.ink },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginVertical: 2 },
  payK: { fontSize: 16, fontWeight: "700", color: C.ink },
  payV: { fontSize: 20, fontWeight: "700", color: C.ink },
  cta: { marginTop: 14, height: 50, borderRadius: 12, backgroundColor: C.green, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ctaTxt: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
