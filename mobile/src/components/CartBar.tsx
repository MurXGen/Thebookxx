import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OfferStrip from "@/components/OfferStrip";
import { Text } from "@/components/ui-text";
import { navHidden, TAB_H } from "@/lib/navScroll";
import { bestUnlockedFlat, FREE_DELIVERY_AT, FREE_DELIVERY_AT_ONE_RUPEE } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { C, rupee } from "@/theme";

// What the reader has achieved on the offer ladder, e.g. "✓ Free delivery · ✓ ₹50 OFF applied".
function useAchievements() {
  const { subtotal, mrpTotal, hasOneRupee, offerDiscount, flatDiscount, comboDiscount } = useStore();
  const out: string[] = [];
  const freeAt = hasOneRupee ? FREE_DELIVERY_AT_ONE_RUPEE : FREE_DELIVERY_AT;
  if (subtotal >= freeAt) out.push("✓ Free delivery");
  const best = bestUnlockedFlat(subtotal, hasOneRupee);
  if (flatDiscount) out.push(`✓ ₹${flatDiscount} OFF applied`);
  else if (best) out.push(`${best.reward} ready to avail`);
  if (comboDiscount) out.push(`✓ Combo ₹${comboDiscount} off`);
  if (!out.length) {
    out.push(`${rupee(freeAt - subtotal)} more for free delivery`);
  }
  const save = mrpTotal - subtotal + offerDiscount;
  return { line: out.join("  ·  "), save };
}

// Docked to the bottom (right above the tab bar): offer stripe + green
// "N items · ₹X  View Bag" bar, attached with no gap.
export default function CartBar({ safeBottom = false }: { safeBottom?: boolean }) {
  const { cartCount, subtotal, offerDiscount } = useStore();
  const insets = useSafeAreaInsets();
  const { line, save } = useAchievements();
  const bump = useSharedValue(1);
  useEffect(() => {
    if (cartCount) bump.set(withSequence(withTiming(1.035, { duration: 110 }), withSpring(1, { damping: 10, stiffness: 240 })));
  }, [cartCount, bump]);
  const bumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));
  // In tabs the bar rides on top of the tab bar and drops down when it hides.
  const tabH = TAB_H + insets.bottom;
  const dockStyle = useAnimatedStyle(() => ({ bottom: safeBottom ? 0 : interpolate(navHidden.get(), [0, 1], [tabH, 0]) }));

  if (!cartCount) return null;
  return (
    <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={[s.dock, dockStyle]}>
      <OfferStrip docked />
      <Animated.View style={bumpStyle}>
        <Pressable onPress={() => router.navigate("/bag")} style={({ pressed }) => [s.bar, { paddingBottom: safeBottom ? insets.bottom + 12 : 12, opacity: pressed ? 0.94 : 1 }]}>
          <View style={{ flex: 1 }}>
            <Animated.View key={`${cartCount}-${subtotal}`} entering={FadeInUp.duration(220)}>
              <Text style={s.total}>
                {cartCount} item{cartCount === 1 ? "" : "s"} · {rupee(subtotal - offerDiscount)}
                {save > 0 ? <Text style={s.save}>{`  You save ${rupee(save)}`}</Text> : null}
              </Text>
            </Animated.View>
            <Text style={s.line} numberOfLines={1}>{line}</Text>
          </View>
          <View style={s.cta}>
            <Text style={s.ctaTxt}>View Bag</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden", backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 16 },
  bar: { backgroundColor: C.green, paddingHorizontal: 16, paddingTop: 11, flexDirection: "row", alignItems: "center" },
  total: { color: "#fff", fontSize: 15.5, fontWeight: "700" },
  save: { color: "rgba(255,255,255,0.85)", fontSize: 11.5, fontWeight: "500" },
  line: { color: "#fff", fontSize: 11.5, fontWeight: "500", opacity: 0.95, marginTop: 1 },
  cta: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "rgba(0,0,0,0.14)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  ctaTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
