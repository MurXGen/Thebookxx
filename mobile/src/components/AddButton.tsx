import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C } from "@/theme";

const tap = () => {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

// Swiggy-style ADD button that turns into a − qty + stepper.
export default function AddButton({ id, compact = false, soldOut = false }: { id: string; compact?: boolean; soldOut?: boolean }) {
  const { qtyOf, add, dec, byId } = useStore();
  const qty = qtyOf(id);
  const w = compact ? 78 : 96;
  if (soldOut)
    return (
      <View style={[s.btn, { width: w, borderColor: C.line }]}>
        <Text style={[s.add, { color: C.muted, fontSize: 11 }]}>SOLD OUT</Text>
      </View>
    );
  if (qty === 0)
    return (
      <PressScale
        scaleTo={0.9}
        onPress={() => {
          const r = add(id);
          if (!r.ok) toast(r.reason || "Couldn't add", { kind: "info" });
          else {
            tap();
            const b = byId.get(id);
            if (b) toast(b.name, { title: "Added to your bag", kind: "success", image: b.image });
          }
        }}
        style={[s.btn, { width: w }]}
        accessibilityRole="button"
        accessibilityLabel="Add to bag"
      >
        <Text style={s.add}>ADD</Text>
        <Ionicons name="add" size={14} color={C.green} style={{ marginLeft: 2 }} />
      </PressScale>
    );
  return (
    <Animated.View entering={ZoomIn.springify().damping(14)} style={[s.btn, s.stepper, { width: w }]}>
      <Pressable hitSlop={8} onPress={() => { dec(id); tap(); }} style={s.step} accessibilityLabel="Remove one">
        <Text style={s.stepTxt}>−</Text>
      </Pressable>
      <Animated.View key={qty} entering={FadeIn.duration(180)}>
        <Text style={s.qty}>{qty}</Text>
      </Animated.View>
      <Pressable
        hitSlop={8}
        onPress={() => {
          const r = add(id);
          if (!r.ok) toast(r.reason || "Couldn't add", { kind: "info" });
          else tap();
        }}
        style={s.step}
        accessibilityLabel="Add one more"
      >
        <Text style={s.stepTxt}>+</Text>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 32,
    borderRadius: 9,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D7EBDF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  add: { color: C.green, fontWeight: "700", fontSize: 14, letterSpacing: 0.4, lineHeight: 18, includeFontPadding: false },
  stepper: { backgroundColor: C.green, borderColor: C.green, justifyContent: "space-between", paddingHorizontal: 4 },
  step: { width: 24, alignItems: "center" },
  stepTxt: { color: "#fff", fontSize: 17, fontWeight: "700", lineHeight: 20, includeFontPadding: false },
  qty: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 18, includeFontPadding: false },
});
