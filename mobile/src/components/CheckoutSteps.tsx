import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Text } from "@/components/ui-text";
import { C } from "@/theme";

// Bag → Address → Payment, three even columns: dot over label, joined by lines.
export default function CheckoutSteps({ at }: { at: 1 | 2 }) {
  const steps = ["Bag", "Address", "Payment"];
  return (
    <View style={s.wrap}>
      {steps.map((t, i) => {
        const done = i < at;
        const on = i === at;
        return (
          <View key={t} style={s.col}>
            {i > 0 ? <View style={[s.line, s.lineL, i <= at && s.lineOn]} /> : null}
            {i < steps.length - 1 ? <View style={[s.line, s.lineR, i < at && s.lineOn]} /> : null}
            <Animated.View entering={ZoomIn.delay(i * 70).springify()} style={[s.dot, done && s.dotDone, on && s.dotOn]}>
              {done ? <Ionicons name="checkmark" size={13} color="#fff" /> : <Text style={[s.num, on && { color: "#fff" }]}>{i + 1}</Text>}
            </Animated.View>
            <Text style={[s.label, (done || on) && { color: C.ink }, on && { fontWeight: "600" }]}>{t}</Text>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 22;
const s = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: "#fff", paddingTop: 12, paddingBottom: 12, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  col: { flex: 1, alignItems: "center" },
  line: { position: "absolute", top: DOT / 2 - 1, height: 2, backgroundColor: "#E6E6EC" },
  lineL: { left: 0, right: "50%", marginRight: DOT / 2 + 4 },
  lineR: { left: "50%", right: 0, marginLeft: DOT / 2 + 4 },
  lineOn: { backgroundColor: C.green },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: "#E6E6EC", alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: C.green },
  dotOn: { backgroundColor: C.ink },
  num: { fontSize: 11, fontWeight: "600", color: C.muted, lineHeight: 14 },
  label: { marginTop: 6, fontSize: 11.5, color: C.muted },
});
